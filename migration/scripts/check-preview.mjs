import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {issueSession,SESSION_COOKIE} from '../../lib/sanity/preview-session.ts';
const origin='https://beckett-house-preview.patient-dust-7607.workers.dev';
const secret=await readFile(process.env.PREVIEW_SESSION_SECRET_FILE || '/tmp/beckett-preview-session-secret','utf8');
const cookie=SESSION_COOKIE+'='+await issueSession(secret);
const models=JSON.parse(await readFile('lib/sanity/content-model.json','utf8'));
const results=[];
for(const model of models.filter(model=>!['site','announcements'].includes(model.slug))) {
 const response=await fetch(origin+model.path,{headers:{Cookie:cookie}}),html=await response.text();
 assert.equal(response.status,200,model.path+' '+html.slice(0,100));
 assert.match(response.headers.get('cache-control'),/no-store/,model.path);
 assert.match(response.headers.get('x-robots-tag'),/noindex/,model.path);
 assert.match(html,/data-sanity=/,model.path+' lacks editing bindings');
 assert.doesNotMatch(html,/Something went wrong|Internal Server Error/);
 results.push({path:model.path,status:response.status,bindings:(html.match(/data-sanity=/g)||[]).length});
}
assert.equal((await fetch(origin+'/gallery')).status,401);
assert.equal((await fetch(origin+'/api/forms/visit',{method:'POST'})).status,404);
assert.equal((await fetch(origin+'/api/draft-mode/enable?sanity-preview-secret=invalid')).status,401);
await writeFile('migration/reports/preview.json',JSON.stringify({routes:results,unauthenticatedDrafts:'blocked',previewForms:'disabled',invalidSecrets:'rejected'},null,2)+'\n');
console.log(`Preview checks passed: ${results.length} routes, private drafts, blocked submissions and invalid secrets.`);
