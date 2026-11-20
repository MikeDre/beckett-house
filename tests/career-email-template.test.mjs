import assert from 'node:assert/strict';
import test from 'node:test';
import '../migration/scripts/register.mjs';
const {defaultCareerEmailTemplate,validateCareerEmailTemplate,renderCareerEmailTemplate}=await import('../lib/career-email-template.ts');
test('acknowledgement templates validate placeholders and prevent subject header injection',()=>{
 for(const change of [{subject:''},{subject:'Hello\nBcc: bad'},{body:'Hi {unknown}'},{heading:'x'.repeat(201)}])assert.throws(()=>validateCareerEmailTemplate({...defaultCareerEmailTemplate,...change}));
 const template=validateCareerEmailTemplate({...defaultCareerEmailTemplate,body:'Hi {applicantName},\n\nThank you for applying for {jobTitle} at {nursery}.'});
 const result=renderCareerEmailTemplate(template,{applicantName:'Alex $&',jobTitle:'Practitioner',nursery:'Angel'});
 assert.equal(result.body,'Hi Alex $&,\n\nThank you for applying for Practitioner at Angel.');
 assert.equal(renderCareerEmailTemplate({...template,subject:'Application: {applicantName}'},{applicantName:'Name\nInjected',jobTitle:'Role',nursery:'Angel'}).subject,'Application: Name Injected');
});
