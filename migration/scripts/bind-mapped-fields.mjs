import ts from 'typescript';import {readFile,writeFile} from 'node:fs/promises';
const files=[['app/nursery-home-view.tsx','slug'],['app/beckett-house/about-view.tsx','"about"'],['app/history/history-view.tsx','"history"'],['app/faq/faq-view.tsx','"faq"']];
for(const [file,page] of files){let source=await readFile(file,'utf8');const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
function resolve(n,origin){
 if(ts.isPropertyAccessExpression(n)){const p=resolve(n.expression,origin);return p===null?null:p+'+'+JSON.stringify('.'+n.name.text);}
 if(ts.isElementAccessExpression(n)){const p=resolve(n.expression,origin);if(p===null)return null;if(ts.isNumericLiteral(n.argumentExpression))return p+'+'+JSON.stringify('['+n.argumentExpression.text+']');if(ts.isStringLiteral(n.argumentExpression))return p+'+'+JSON.stringify('.'+n.argumentExpression.text);return null;}
 if(ts.isIdentifier(n)){
  if(n.text==='content')return '""';
  for(let parent=origin.parent;parent;parent=parent.parent)if(ts.isArrowFunction(parent)&&parent.parameters[0]?.name.getText(ast)===n.text && ts.isCallExpression(parent.parent)&&ts.isPropertyAccessExpression(parent.parent.expression)&&parent.parent.expression.name.text==='map'){
   const arr=parent.parent.expression.expression,p=resolve(arr,parent);return p===null?null:p+'+"["+'+arr.getText(ast)+'.indexOf('+n.text+')+"]"';
  }
 }
 return null;
}
function visit(node){
 if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)){
  let covered=false;for(let p=node.parent;p;p=p.parent)if(ts.isJsxElement(p)&&p.openingElement.tagName.getText(ast)==='CmsField')covered=true;
  const p=resolve(node.expression,node);
  if(!covered&&p&&p.includes('indexOf'))edits.push([node.getStart(ast),node.end,`<CmsField page={${page}} field={${p}.replace(/^\\./, '')}>{${node.expression.getText(ast)}}</CmsField>`]);
 }
 if(ts.isJsxSelfClosingElement(node)&&node.tagName.getText(ast)==='Image'){
  const spread=node.attributes.properties.find(a=>ts.isJsxSpreadAttribute(a));
  if(spread){const p=resolve(spread.expression,node);if(p)edits.push([node.tagName.getStart(ast),node.tagName.end,`CmsImage page={${page}} field={(${p}).replace(/^\\./, '')}`]);}
 }
 ts.forEachChild(node,visit);
}visit(ast);
for(const [start,end,text]of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+text+source.slice(end);
if(edits.length){source=source.replace('import {CmsField}', 'import {CmsField, CmsImage}');await writeFile(file,source);}
}
