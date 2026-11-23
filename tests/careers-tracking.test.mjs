import assert from 'node:assert/strict';
import test from 'node:test';
import '../migration/scripts/register.mjs';
const {trackCareerEvent}=await import('../app/careers/tracking.ts');
test('careers tracking requires consent and production host and emits only approved event names',()=>{
 const previous=globalThis.window;let consent='denied';const events=[];
 globalThis.window={location:{hostname:'www.beckett-house.co.uk'},localStorage:{getItem:()=>consent},gtag(){},dataLayer:events};
 try{trackCareerEvent('application_submit');assert.equal(events.length,0);consent='granted';trackCareerEvent('application_submit');assert.deepEqual(events,[{event:'careers_application_submit'}]);trackCareerEvent('applicant@example.invalid');assert.equal(events.length,1);window.location.hostname='beckett-house-preview.patient-dust-7607.workers.dev';trackCareerEvent('application_start');assert.equal(events.length,1);}finally{globalThis.window=previous;}
});
