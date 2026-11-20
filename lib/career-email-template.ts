export const defaultCareerEmailTemplate={subject:'Your application — Beckett House Montessori',heading:'Application received',body:'Thank you for applying for {jobTitle}. Our team will review your application and contact you about next steps.'};
export type CareerEmailTemplate=typeof defaultCareerEmailTemplate;
export function validateCareerEmailTemplate(value:unknown):CareerEmailTemplate{
 if(!value||typeof value!=='object')throw new Error('Please complete the template.');
 const result={...defaultCareerEmailTemplate};
 for(const key of ['subject','heading','body'] as const){const text=(value as Record<string,unknown>)[key];if(typeof text!=='string'||!text.trim()||text.length>(key==='body'?5000:200))throw new Error(`Please complete ${key} within its character limit.`);if(key!=='body'&&/[\r\n]/.test(text))throw new Error('Subject and heading must be a single line.');for(const match of text.matchAll(/\{([^{}]+)\}/g))if(!['jobTitle','applicantName','nursery'].includes(match[1]))throw new Error(`Unknown placeholder: {${match[1]}}`);result[key]=text.trim();}
 return result;
}
export function renderCareerEmailTemplate(template:CareerEmailTemplate,values:{jobTitle:string;applicantName:string;nursery:string}):CareerEmailTemplate{
 const replace=(text:string)=>text.replace(/\{(jobTitle|applicantName|nursery)\}/g,(_,key:keyof typeof values)=>values[key]);
 return {subject:replace(template.subject).replace(/[\r\n]/g,' '),heading:replace(template.heading),body:replace(template.body)};
}
