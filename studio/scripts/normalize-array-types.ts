/** Supply explicit member types required by Studio's array editor. Values and stable keys are preserved. */
import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
function normalize(value:unknown):unknown {
 if(Array.isArray(value))return value.map(item=>{const result=normalize(item);return result && typeof result==='object' && !Array.isArray(result) && !('_type' in result) ? {_type:'item',...result} : result})
 if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,normalize(child)]))
 return value
}
let count=0
for(const document of await client.fetch('*[_id match "page-*" || _id match "drafts.page-*"]')) {
 const fields=Object.fromEntries(Object.entries(document).filter(([key])=>!key.startsWith('_')).map(([key,value])=>[key,normalize(value)]))
 if(Object.entries(fields).some(([key,value])=>JSON.stringify(value)!==JSON.stringify(document[key]))) {await client.patch(document._id).ifRevisionId(document._rev).set(fields).commit();count++}
}
console.log(`Normalized array member types in ${count} documents; editorial values preserved.`)
