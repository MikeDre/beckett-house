import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
for(const id of ['page-site','drafts.page-site']){const doc=await client.getDocument(id);if(!doc)continue;const items=(doc.menus?.navItems||[]).filter((item:{href:string})=>item.href!=='/careers');const index=items.findIndex((item:{href:string})=>item.href==='/register');items.splice(index<0?items.length:index,0,{_type:'item',_key:'careers',title:'Careers',href:'/careers'});await client.patch(id).ifRevisionId(doc._rev).set({'menus.navItems':items}).commit()}
console.log('Careers navigation added before Register')
