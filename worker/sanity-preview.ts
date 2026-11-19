import {contentRevision,previewDocumentIds} from "../lib/sanity/preview-revision";
import { createClient } from "@sanity/client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION,
  STUDIO_URL,
} from "../lib/sanity/config";
import {
  SESSION_COOKIE,
  SESSION_SECONDS,
  issueSession,
  safeRedirect,
  validSession,
} from "../lib/sanity/preview-session";
import type { SanityEnvironment } from "../lib/sanity/server";

export async function previewEndpoint(
  request: Request,
  env: SanityEnvironment,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/draft-mode/")) return null;
  if (env.SANITY_VISUAL_PREVIEW !== "true")
    return new Response("Not found", { status: 404 });
  if (request.method !== "GET")
    return new Response("Method not allowed", { status: 405 });
  const cookieOptions =
    "; Path=/; Secure; HttpOnly; SameSite=None; Partitioned";
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  });
  if(url.pathname==='/api/draft-mode/version') {
    if(!(await previewAuthorized(request,env)))return new Response('Unauthorized',{status:401,headers});
    if(!env.SANITY_PREVIEW_READ_TOKEN)return new Response('Preview is not configured',{status:503,headers});
    const ids=previewDocumentIds(url.searchParams.get('path') || '/');
    if(!ids)return new Response('Not found',{status:404,headers});
    const published=/(?:^|;\s*)beckett-preview-perspective=published(?:;|$)/.test(request.headers.get('Cookie') || '');
    const client=createClient({projectId:SANITY_PROJECT_ID,dataset:SANITY_DATASET,apiVersion:SANITY_API_VERSION,useCdn:false,token:env.SANITY_PREVIEW_READ_TOKEN,perspective:published?'published':'drafts'});
    const documents=await client.fetch('*[_id in $ids || ($careers && _type == "job")]{_id,_rev}',{ids,careers:(url.searchParams.get('path') || '').startsWith('/careers')});
    return Response.json({revision:contentRevision(documents)},{headers});
  }
  if (url.pathname === "/api/draft-mode/disable") {
    headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=; Max-Age=0${cookieOptions}`,
    );
    headers.append(
      "Set-Cookie",
      "beckett-preview-perspective=; Max-Age=0; Path=/; Secure; SameSite=None; Partitioned",
    );
    headers.set("Location", "/");
    return new Response(null, { status: 307, headers });
  }
  if (url.pathname !== "/api/draft-mode/enable")
    return new Response("Not found", { status: 404 });
  if (!env.SANITY_PREVIEW_READ_TOKEN || !env.PREVIEW_SESSION_SECRET)
    return new Response("Preview is not configured", { status: 503, headers });
  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: env.SANITY_PREVIEW_READ_TOKEN,
  });
  const result = await validatePreviewUrl(client, request.url);
  if (
    !result.isValid ||
    ![
      STUDIO_URL,
      "https://sanity.io",
      "https://www.sanity.io",
      "http://localhost:3333",
    ].includes(result.studioOrigin || "")
  )
    return new Response("Invalid preview link", { status: 401, headers });
  headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=${await issueSession(env.PREVIEW_SESSION_SECRET)}; Max-Age=${SESSION_SECONDS}${cookieOptions}`,
  );
  headers.append(
    "Set-Cookie",
    `beckett-preview-perspective=${result.studioPreviewPerspective === "published" ? "published" : "drafts"}; Max-Age=${SESSION_SECONDS}; Path=/; Secure; SameSite=None; Partitioned`,
  );
  headers.set("Location", safeRedirect(result.redirectTo));
  return new Response(null, { status: 307, headers });
}
export async function previewAuthorized(
  request: Request,
  env: SanityEnvironment,
) {
  const value = request.headers
    .get("Cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(SESSION_COOKIE + "="))
    ?.slice(SESSION_COOKIE.length + 1);
  return validSession(value, env.PREVIEW_SESSION_SECRET || "");
}
