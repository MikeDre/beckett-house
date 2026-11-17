import "server-only";
import { createClient } from "@sanity/client";
import { env } from "cloudflare:workers";
import {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION,
  documentId,
} from "./config";
import { validSession, SESSION_COOKIE } from "./preview-session";
import { fromSanity } from "./shape";
import models from "./content-model.json" with { type: "json" };

export type SanityEnvironment = {
  SANITY_CONTENT_ENABLED?: string;
  SANITY_VISUAL_PREVIEW?: string;
  SANITY_PREVIEW_READ_TOKEN?: string;
  PREVIEW_SESSION_SECRET?: string;
};
export function sanityClient(
  token?: string,
  perspective: "published" | "drafts" = token ? "drafts" : "published",
) {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: !token,
    perspective,
    token,
    stega: false,
  });
}
export async function previewEnabled() {
  const settings = env as SanityEnvironment;
  if (
    settings.SANITY_VISUAL_PREVIEW !== "true" ||
    !settings.PREVIEW_SESSION_SECRET
  )
    return false;
  const { cookies } = await import("next/headers");
  return validSession(
    (await cookies()).get(SESSION_COOKIE)?.value,
    settings.PREVIEW_SESSION_SECRET,
  );
}
export async function getSanityContent<T>(slug: string): Promise<T | null> {
  const settings = env as SanityEnvironment;
  if (settings.SANITY_CONTENT_ENABLED !== "true") return null;
  const preview = await previewEnabled();
  const token = preview ? settings.SANITY_PREVIEW_READ_TOKEN : undefined;
  if (preview && !token)
    throw new Error("Sanity draft preview is not configured");
  const document = await sanityClient(
    token,
    preview ? await previewPerspective() : "published",
  ).fetch("*[_id == $id][0]", { id: documentId(slug) });
  if (!document) throw new Error(`Missing Sanity content: ${slug}`);
  const model = models.find((model) => model.slug === slug);
  return fromSanity(document, model?.content ?? {}) as T;
}

export async function getCmsContext() {
  const settings = env as SanityEnvironment;
  const preview = await previewEnabled();
  if (settings.SANITY_CONTENT_ENABLED !== "true")
    return { documents: {}, preview: false };
  const { headers } = await import("next/headers");
  const pathname = (await headers()).get("x-beckett-content-path") || "/";
  if (pathname === "/admin" || pathname.startsWith("/admin/"))
    return { documents: {}, preview: false };
  const selected = models.filter(
    (model) =>
      model.path === pathname ||
      model.slug === "site" ||
      model.slug === "announcements",
  );
  const documents: Record<string, unknown> = {};
  const data = await sanityClient(
    preview ? settings.SANITY_PREVIEW_READ_TOKEN : undefined,
    preview ? await previewPerspective() : "published",
  ).fetch("*[_id in $ids]", {
    ids: selected.map((model) => documentId(model.slug)),
  });
  for (const model of selected) {
    const document = data.find(
      (item: { _id: string }) => item._id === documentId(model.slug),
    );
    if (document) documents[model.slug] = fromSanity(document, model.content);
  }
  return { documents, preview };
}

async function previewPerspective(): Promise<"published" | "drafts"> {
  const { cookies } = await import("next/headers");
  return (await cookies()).get("beckett-preview-perspective")?.value ===
    "published"
    ? "published"
    : "drafts";
}
