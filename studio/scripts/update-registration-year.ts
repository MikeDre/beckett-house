import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
for(const id of ['page-site','drafts.page-site']){const doc=await client.getDocument(id);if(doc)await client.patch(id).ifRevisionId(doc._rev).set({'copy.for2026':' for 2026/2027'}).commit()}
console.log('Registration banner updated to 2026/2027')
