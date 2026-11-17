import assert from 'node:assert/strict';
import test from 'node:test';
import '../migration/scripts/register.mjs';
const {issueSession,validSession,safeRedirect,SESSION_SECONDS}=await import('../lib/sanity/preview-session.ts');
const {previewEndpoint,previewAuthorized}=await import('../worker/sanity-preview.ts');
const {fieldName,fromSanity}=await import('../lib/sanity/shape.ts');
test('preview sessions reject tampering, expiration, wrong keys and excessive lifetime',async()=>{
 const now=1800000000000,secret='test-only-preview-secret';
 const value=await issueSession(secret,now);
 assert(await validSession(value,secret,now));
 assert.equal(await validSession(value,'wrong-key',now),false);
 assert.equal(await validSession(value.slice(0,-1)+(value.endsWith('0')?'1':'0'),secret,now),false);
 assert.equal(await validSession(value,secret,now+SESSION_SECONDS*1000),false);
 assert.equal(await validSession(value,secret,now-1),false);
 assert.equal(await validSession(value+'.extra',secret,now),false);
});
test('preview redirects remain local and prevent protocol-relative or backslash redirects',()=>{
 for(const input of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','/\r\nx'])assert.equal(safeRedirect(input),'/');
 assert.equal(safeRedirect('/gallery?location=angel'),'/gallery?location=angel');
});
test('production cannot issue draft sessions and preview requires configuration',async()=>{
 const request=new Request('https://example.invalid/api/draft-mode/enable');
 assert.equal((await previewEndpoint(request,{})).status,404);
 assert.equal((await previewEndpoint(request,{SANITY_VISUAL_PREVIEW:'true'})).status,503);
 assert.equal(await previewAuthorized(new Request('https://example.invalid/'),{}),false);
});
test('content adapter preserves nursery keys, optional rows, rich text and native images',()=>{
 const template={'abbey-road':{paragraph1:'Welcome **families**',image:{src:'/old.jpg',alt:'Photo',width:900,height:600},items:[{title:'First',note:'Optional'},{title:'Second'}]}};
 const source={abbeyRoad:{paragraph1:[{_type:'block',children:[{text:'Welcome ',marks:[]},{text:'families',marks:['strong']}]}],image:{_type:'image',asset:{_ref:'image-abcdef-100x200-jpg'},alt:'New photo'},items:[{_key:'a',title:'First'},{_key:'b',title:'Second',note:'Only here'}]}};
 const result=fromSanity(source,template);
 assert.equal(fieldName('abbey-road'),'abbeyRoad');
 assert.equal(result['abbey-road'].paragraph1,'Welcome **families**');
 assert.equal(result['abbey-road'].image.src,'https://cdn.sanity.io/images/lk8ts1r7/production/abcdef-100x200.jpg');
 assert.equal(result['abbey-road'].image.width,100);
 assert.equal(result['abbey-road'].image.height,200);
 assert.equal(result['abbey-road'].items[0].note,undefined);
 assert.equal(result['abbey-road'].items[1].note,'Only here');
});
test('incomplete drafts keep sections renderable without inventing optional funded prices',()=>{
 const result=fromSanity({texts:{},hero:{},fees:[{standard:[4,5,6]}]},{texts:{paragraph1:'Body',text28:'Prefix'},hero:{slides:[{src:'/images/default.jpg'}]},fees:[{standard:[4,5,6],funded15:[1,2,3]}]});
 assert.equal(result.texts.paragraph1,'');
 assert.equal(result.texts.text28,'');
 assert.deepEqual(result.hero.slides,[]);
 assert.equal(result.fees[0].funded15,undefined);
 assert.deepEqual(result.fees[0].standard,[4,5,6]);
});
test('preview revision checks are private and scoped to the page and shared content',async()=>{
 const {previewDocumentIds,contentRevision}=await import('../lib/sanity/preview-revision.ts');
 assert.equal(previewDocumentIds('/admin'),null);
 assert.equal(previewDocumentIds('/api/admin/submissions'),null);
 assert.deepEqual(previewDocumentIds('/gallery').sort(),['page-gallery','page-site','page-announcements'].sort());
 assert(previewDocumentIds('/timetable').includes('page-fees'));
 const docs=[{_id:'page-gallery',_rev:'a'},{_id:'page-site',_rev:'b'}];
 assert.equal(contentRevision(docs),contentRevision([...docs].reverse()));
 assert.notEqual(contentRevision(docs),contentRevision([{_id:'page-gallery',_rev:'changed'},docs[1]]));
 const response=await previewEndpoint(new Request('https://example.invalid/api/draft-mode/version?path=/gallery'),{SANITY_VISUAL_PREVIEW:'true',PREVIEW_SESSION_SECRET:'test'});
 assert.equal(response.status,401);
 assert.match(response.headers.get('cache-control'),/no-store/);
});
