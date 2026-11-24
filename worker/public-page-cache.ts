/** Short-lived HTML cache. Deliberately excludes forms, careers, prices and private routes. */
const paths=new Set(['/','/angel','/abbey-road','/about','/beckett-house','/history','/montessori','/faq','/gallery','/find-your-nursery']);
export const PUBLIC_PAGE_CACHE_SECONDS=30;
export function publicPageCacheKey(request:Request):Request|null{
 const url=new URL(request.url);
 if(request.method!=='GET'||url.hostname!=='www.beckett-house.co.uk'||url.search||!paths.has(url.pathname))return null;
 if(request.headers.has('Cookie')||request.headers.has('Authorization')||request.headers.has('RSC')||request.headers.has('Next-Router-State-Tree')||request.headers.has('Next-Router-Prefetch')||request.headers.has('Next-Url'))return null;
 if(!request.headers.get('Accept')?.includes('text/html'))return null;
 return new Request(url.toString(),{method:'GET'});
}
export function cacheablePublicPage(response:Response){
 return response.status===200&&response.headers.get('Content-Type')?.includes('text/html')&&!response.headers.has('Set-Cookie')&&!/private|no-store|no-cache/i.test(response.headers.get('Cache-Control')||'')&&!/\*|cookie|rsc|next-router/i.test(response.headers.get('Vary')||'');
}
