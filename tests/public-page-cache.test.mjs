import assert from 'node:assert/strict';
import test from 'node:test';
import '../migration/scripts/register.mjs';
const {publicPageCacheKey,cacheablePublicPage}=await import('../worker/public-page-cache.ts');
const request=(path='/',headers={},method='GET')=>new Request('https://www.beckett-house.co.uk'+path,{method,headers:{Accept:'text/html',...headers}});
test('public HTML cache excludes private, dynamic and personalised requests',()=>{
 assert(publicPageCacheKey(request('/faq')));
 for(const path of ['/admin','/api/forms/careers','/careers','/careers/role/apply','/visit','/register','/opening-hours-fees','/timetable','/?location=angel'])assert.equal(publicPageCacheKey(request(path)),null,path);
 for(const header of ['Cookie','Authorization','RSC','Next-Router-State-Tree','Next-Router-Prefetch','Next-Url'])assert.equal(publicPageCacheKey(request('/',{[header]:'value'})),null,header);
 assert.equal(publicPageCacheKey(request('/',{},'POST')),null);
 assert.equal(publicPageCacheKey(request('/',{Accept:'text/x-component'})),null);
});
test('only successful public HTML without private headers can enter cache',()=>{
 const response=(headers={},status=200)=>new Response('Page',{status,headers:{'Content-Type':'text/html',...headers}});
 assert(cacheablePublicPage(response()));
 for(const headers of [{'Set-Cookie':'session=x'},{'Cache-Control':'private'},{'Cache-Control':'no-store'},{Vary:'RSC, Next-Router-State-Tree'},{Vary:'Cookie'},{'Content-Type':'application/json'}])assert(!cacheablePublicPage(response(headers)));
 assert(!cacheablePublicPage(response({},500)));
});
