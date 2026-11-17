/** One-time codemod: preserve JSX layout while extracting literal editorial copy. */
import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const models=JSON.parse(await readFile('lib/sanity/content-model.json','utf8'));
const files=[
 ['montessori','Montessori','/montessori',['app/montessori/page.tsx']],
 ['gallery','Gallery','/gallery',['app/gallery/page.tsx','app/gallery/gallery.tsx']],
 ['virtual-tour','Virtual tour','/virtual-tour',['app/virtual-tour/page.tsx','app/virtual-tour/tour.tsx']],
 ['find-your-nursery','Find your nursery','/find-your-nursery',['app/find-your-nursery/page.tsx']],
 ['visit','Book a visit','/visit',['app/visit/page.tsx']],
 ['register','Registration','/register',['app/register/page.tsx','app/register/registration-page.tsx']],
 ['privacy','Privacy notice','/privacy',['app/privacy/page.tsx']],
 ['thank-you','Confirmation pages','/thank-you',['app/thank-you/page.tsx','app/thank-you/thank-you-content.tsx']],
 ['site','Shared navigation and forms','/',['app/components.tsx']],
 ['fees','Fees and opening hours','/opening-hours-fees',['app/opening-hours-fees/page.tsx']],
];
for(const [slug,title,url,sources] of files) {
 const model=models.find(m=>m.slug===slug) ?? {slug,title,path:url,content:{}};
 model.content.copy={};model.content.photos={};
 for(const file of sources) {
  const source=await readFile(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];let images=0;
  function visit(node) {
   if(ts.isJsxText(node) && node.text.trim() && !['script','style','option','textarea'].includes(node.parent.openingElement?.tagName?.getText(ast))) {
    // Match React's multiline JSX whitespace normalization; decode HTML entities.
    const lines=node.text.replace(/\r/g,'').split('\n');
    let value=lines.map((s,i)=>{s=s.replace(/\t/g,' ');if(i>0)s=s.trimStart();if(i<lines.length-1)s=s.trimEnd();return s;}).filter(Boolean).join(' ');
    value=value.replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&nbsp;/g,'\u00a0').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    let key=value.replace(/[^a-zA-Z0-9 ]/g,'').trim().split(/\s+/).slice(0,7).map((s,i)=>i?s[0]?.toUpperCase()+s.slice(1):s.toLowerCase()).join('') || 'text';
    if(!/^[a-z]/i.test(key)) key='text'+key;
    const base=key;let n=2;while(model.content.copy[key]!==undefined && model.content.copy[key]!==value)key=base+n++;
    model.content.copy[key]=value;
    edits.push([node.getStart(ast),node.end,`<CmsText page="${slug}" field="copy.${key}" fallback={${JSON.stringify(value)}} />`]);
   }
   if(ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast)==='Image') {
    const attrs=node.attributes.properties;
    const src=attrs.find(a=>a.name?.getText(ast)==='src');
    if(src?.initializer && ts.isStringLiteral(src.initializer)) {
     const photo={src:src.initializer.text,alt:'',width:1600,height:1067};
     for(const key of ['alt','width','height']) {
      const attr=attrs.find(a=>a.name?.getText(ast)===key);
      if(attr?.initializer) {const v=attr.initializer;photo[key]=ts.isStringLiteral(v)?v.text:ts.isJsxExpression(v)&&v.expression&&ts.isNumericLiteral(v.expression)?Number(v.expression.text):photo[key];}
     }
     const key='photo'+ ++images;model.content.photos[key]=photo;
     edits.push([node.tagName.getStart(ast),node.tagName.end,`CmsImage page="${slug}" field="photos.${key}"`]);
    }
   }
   ts.forEachChild(node,visit);
  } visit(ast);
  let result=source;for(const [start,end,text] of edits.sort((a,b)=>b[0]-a[0]))result=result.slice(0,start)+text+result.slice(end);
  if(edits.length) {
   const relative=path.relative(path.dirname(file),'app/cms-content').replaceAll('\\','/');
   const line=`import {CmsText, CmsImage} from ${JSON.stringify(relative.startsWith('.')?relative:'./'+relative)};\n`;
   const pos=result.startsWith('"use client";')?'"use client";'.length:0;
   result=result.slice(0,pos)+'\n'+line+result.slice(pos);
   await writeFile(file,result);
  }
 }
 if(!models.includes(model))models.push(model);
}
await writeFile('lib/sanity/content-model.json',JSON.stringify(models,null,2)+'\n');
console.log(`Content models: ${models.length}`);
