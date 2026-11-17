import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const origin='https://www.beckett-house.co.uk';
const models=JSON.parse(await readFile('lib/sanity/content-model.json','utf8'));
const results=[];
for(const model of models.filter(model=>!['site','announcements'].includes(model.slug))) {
 const response=await fetch(origin+model.path),html=await response.text();
 assert.equal(response.status,200,model.path+' '+html.slice(0,100));
 assert.doesNotMatch(html,/data-sanity=/,model.path+' exposes preview attributes');
 assert.doesNotMatch(html,/Something went wrong|Internal Server Error/);
 if(['home','angel','gallery'].includes(model.slug))assert.match(html,/cdn\.sanity\.io/,model.path+' is not using Sanity images');
 if(model.slug==='visit')assert.match(html,/name="phone"/);
 if(model.slug==='thank-you')assert.match(html,/noindex/);
 results.push({path:model.path,status:response.status});
}
assert.equal((await fetch(origin+'/api/draft-mode/enable')).status,404);
assert([301,302,303,307,308,401,403].includes((await fetch(origin+'/admin',{redirect:'manual'})).status),'Staff inbox must require Cloudflare Access');
for(const kind of ['visit','register']) {
 const response=await fetch(origin+'/api/forms/'+kind,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:'{}'});
 assert.equal(response.status,400,'Invalid '+kind+' submissions must fail validation without sending email');
}
await writeFile('migration/reports/production.json',JSON.stringify({routes:results,draftSessions:'disabled',invalidForms:'rejected before delivery'},null,2)+'\n');
console.log(`Production checks passed: ${results.length} public pages, no preview bindings, draft sessions disabled, form validation active.`);
