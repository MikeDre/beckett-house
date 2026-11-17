import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import {montessoriSections} from '../../lib/montessori-content.ts';
import {registrationContent} from '../../app/register/register-content.ts';
import {locations} from '../../lib/content.ts';
const models=JSON.parse(await readFile('lib/sanity/content-model.json','utf8'));
function constant(source,name) {
 const ast=ts.createSourceFile('content.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let value;
 function visit(n) {if(ts.isVariableDeclaration(n)&&n.name.getText(ast)===name) value=n.initializer.getText(ast);ts.forEachChild(n,visit);}visit(ast);
 return Function('return ('+value+')')();
}
models.find(m=>m.slug==='gallery').content.images=constant(await readFile('app/gallery/gallery.tsx','utf8'),'galleryImages');
models.find(m=>m.slug==='thank-you').content.confirmation=constant(await readFile('app/thank-you/thank-you-content.tsx','utf8'),'copy');
models.find(m=>m.slug==='montessori').content.sections=montessoriSections;
models.find(m=>m.slug==='register').content.registration=registrationContent;
models.find(m=>m.slug==='site').content.locations=locations.map(({slug,name,area,strapline,ages,ageDetail,address,streetAddress,addressLocality,postcode,email,phone,phoneHref,mapsUrl,ofstedUrl,panoramas})=>({slug,name,area,strapline,ages,ageDetail,address,streetAddress,addressLocality,postcode,email,phone,phoneHref,mapsUrl,ofstedUrl,panoramaLabels:panoramas.map(({name,description})=>({name,description}))}));
await writeFile('lib/sanity/content-model.json',JSON.stringify(models,null,2)+'\n');
