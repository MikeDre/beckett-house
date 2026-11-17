import ts from 'typescript';
import {readFile} from 'node:fs/promises';
export async function resolve(specifier, context, next) {
  if (specifier === 'server-only' || specifier === 'cloudflare:workers') return {url:'data:text/javascript,export const env={};',shortCircuit:true};
  try { return await next(specifier,context); } catch(error) {
    if(specifier.startsWith('.')) return next(`${specifier}.ts`,context);
    throw error;
  }
}
export async function load(url,context,next) {
  if(url.endsWith('.ts')) return {format:'module',source:ts.transpileModule(await readFile(new URL(url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true};
  return next(url,context);
}
