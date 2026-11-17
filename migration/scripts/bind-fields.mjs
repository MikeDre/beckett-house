import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const files=[['app/beckett-house/about-view.tsx','"about"'],['app/history/history-view.tsx','"history"'],['app/faq/faq-view.tsx','"faq"'],['app/timetable/timetable-view.tsx','"timetable"'],['app/nursery-home-view.tsx','slug'],['app/components.tsx','"home"']];
for(const [file,page] of files) {
 let source=await readFile(file,'utf8');const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];
 function contentPath(expression) {
  if(ts.isPropertyAccessExpression(expression)) {const base=contentPath(expression.expression);return base===null?null:base+'.'+expression.name.text;}
  if(ts.isElementAccessExpression(expression) && ts.isNumericLiteral(expression.argumentExpression)) {const base=contentPath(expression.expression);return base===null?null:base+'['+expression.argumentExpression.text+']';}
  if(ts.isIdentifier(expression)&&expression.text==='content')return '';
  return null;
 }
 function visit(node) {
  if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)) {
   const p=contentPath(node.expression);
   if(p && !p.includes('.images') && !p.endsWith('.image') && !p.endsWith('.slides')) {
    edits.push([node.getStart(ast),node.end,`<CmsField page={${page}} field=${JSON.stringify(p.slice(1))}>{${node.expression.getText(ast)}}</CmsField>`]);
   }
  }
  ts.forEachChild(node,visit);
 }visit(ast);
 for(const [start,end,text] of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+text+source.slice(end);
 if(edits.length){const relative=path.relative(path.dirname(file),'app/cms-content');const line=`import {CmsField} from ${JSON.stringify(relative.startsWith('.')?relative:'./'+relative)};\n`;const pos=source.startsWith('"use client";')?13:0;source=source.slice(0,pos)+'\n'+line+source.slice(pos);await writeFile(file,source);}
}
