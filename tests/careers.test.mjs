import assert from 'node:assert/strict';
import test from 'node:test';
import '../migration/scripts/register.mjs';
const {isOpenJob}=await import('../lib/careers.ts');
const {validateCareerApplication,handleCareerApplication,CV_MAX_BYTES}=await import('../worker/careers.ts');
const {previewDocumentIds}=await import('../lib/sanity/preview-revision.ts');
const valid={jobId:'test-role',name:'Test Applicant',email:'person@example.invalid',phone:'01234567890',qualification:'Yes',shifts:'Yes',availability:'One month',qualifications:'Level 3',experience:'Nursery practitioner, 2020–2026',motivation:'I enjoy early years practice.',consent:'Yes',turnstileToken:'test-only-token',cv:{name:'My CV.pdf',data:Buffer.from('%PDF-1.4 test cv').toString('base64')}};
test('career applications require both exact qualifying answers and complete applicant details',()=>{
 assert.equal(validateCareerApplication(valid).fields[4][1],'Yes');
 for(const change of [{qualification:'No'},{shifts:'No'},{cv:undefined},{cv:{name:'cv.pdf',data:Buffer.from('not a pdf').toString('base64')}},{cv:{name:'cv.exe',data:valid.cv.data}},{cv:{name:'cv.pdf',data:'%%%'}},{cv:{name:'cv.pdf',data:Buffer.concat([Buffer.from('%PDF'),Buffer.alloc(CV_MAX_BYTES)]).toString('base64')}},{qualification:''},{qualification:'Maybe'},{shifts:true},{consent:'No'},{email:'invalid'},{experience:''},{additional:'x'.repeat(2001)},{jobId:''}])assert.throws(()=>validateCareerApplication({...valid,...change}));
});
test('word documents are accepted and CV names are made safe',()=>{
 const docx=validateCareerApplication({...valid,cv:{name:'../Jo <CV>.docx',data:Buffer.from([0x50,0x4b,0x03,0x04,1,2]).toString('base64')}});
 assert.equal(docx.cv.type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
 assert.doesNotMatch(docx.cv.name,/[\/<>]/);
 assert.match(docx.fields.find(([label])=>label==='CV')[1],/^.+\.docx \(1 KB\)$/);
});
test('closing dates include the full closing day in London, closed roles are excluded',()=>{
 const job={status:'open',closingDate:'2026-11-19'};
 assert(isOpenJob(job,new Date('2026-11-19T23:59:59Z')));
 assert.equal(isOpenJob(job,new Date('2026-11-20T00:00:00Z')),false);
 assert.equal(isOpenJob({...job,status:'closed'},new Date('2026-11-18')),false);
 assert(isOpenJob({status:'open'},new Date()));
 assert.equal(isOpenJob({status:'open',closingDate:'broken'}),false);
});
test('careers visual preview resolves shared documents on listing, advert and application paths',()=>{
 for(const path of ['/careers','/careers/practitioner','/careers/practitioner/apply'])assert(previewDocumentIds(path).includes('page-careers'));
 assert.equal(previewDocumentIds('/careers/../../admin'),null);
});
test('applications reject cross-origin requests, malformed bodies and missing configuration',async()=>{
 const request=(body,origin='https://example.invalid')=>new Request('https://example.invalid/api/forms/careers',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const ctx={waitUntil(){throw new Error('Unexpected side effect');}};
 assert.equal((await handleCareerApplication(request(valid,'https://other.invalid'),{},ctx)).status,403);
 assert.equal((await handleCareerApplication(request({...valid,email:'bad'}),{},ctx)).status,400);
 assert.equal((await handleCareerApplication(request(valid),{},ctx)).status,503);
 assert.equal((await handleCareerApplication(request({...valid,website:'spam'}),{},ctx)).status,200);
});
test('real applications persist privately and send all answers to email and a dedicated sheet; samples cannot submit',async()=>{
 const previous=globalThis.fetch,background=[],emails=[],sheets=[],inserts=[];
 let sample=false;
 const key=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const privateKey='-----BEGIN PRIVATE KEY-----\n'+Buffer.from(await crypto.subtle.exportKey('pkcs8',key.privateKey)).toString('base64')+'\n-----END PRIVATE KEY-----';
 globalThis.fetch=async(input,init)=>{
  const url=String(input instanceof Request?input.url:input);
  if(url.includes('siteverify'))return Response.json({success:true});
  if(url.includes('api.sanity.io'))return Response.json({result:{_id:'test-role',_type:'job',title:'Test role',status:'open',location:'angel',isSample:sample}});
  if(url.includes('api.resend.com')){emails.push(JSON.parse(init.body));return Response.json({id:'test'});}
  if(url.includes('oauth2.googleapis.com'))return Response.json({access_token:'test-token'});
  if(url.includes('sheets.googleapis.com')){sheets.push({url,body:init?.body?JSON.parse(init.body):null});return Response.json({sheets:[]});}
  throw new Error('Unexpected network request: '+url);
 };
 const env={RESEND_API_KEY:'test',FORM_FROM_EMAIL:'test@example.invalid',TURNSTILE_SECRET_KEY:'test',FORM_SHEET_ID:'test',GOOGLE_SERVICE_ACCOUNT_EMAIL:'test@example.invalid',GOOGLE_PRIVATE_KEY:privateKey,DB:{prepare(sql){return {bind(...values){return {first:async()=>null,run:async()=>{inserts.push({sql,values});return {success:true};}}}}},async batch(statements){for(const statement of statements)await statement.run();return [];}}};
 const request=()=>new Request('https://example.invalid/api/forms/careers',{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json'},body:JSON.stringify(valid)});
 try{
  const response=await handleCareerApplication(request(),env,{waitUntil(p){background.push(p);}});assert.equal(response.status,200,await response.text());
  await Promise.all(background);
  assert.equal(inserts.length,2);assert.equal(inserts[0].values[1],'careers');
  assert.match(inserts[1].sql,/submission_files/);assert.equal(inserts[1].values[1],'My CV.pdf');assert.equal(Buffer.from(inserts[1].values[3]).toString(),'%PDF-1.4 test cv');
  assert.deepEqual(emails[0].attachments,[{filename:'My CV.pdf',content:valid.cv.data}]);assert.equal(emails[1].attachments,undefined);
  assert.match(inserts[0].values[5],/Available for listed shifts/);
  assert.equal(emails.length,2);assert.match(emails[0].text,/Available for listed shifts: Yes/);
  assert(sheets.some(x=>x.body?.requests?.[0]?.addSheet?.properties?.title==='Careers applications'));
  assert(sheets.some(x=>x.url.includes(':append')&&x.body.values[0].includes("'Yes")));
  sample=true;
  assert.equal((await handleCareerApplication(request(),env,{waitUntil(){throw new Error('Unexpected delivery');}})).status,400);
  assert.equal(inserts.length,2);
 }finally{globalThis.fetch=previous;}
});
