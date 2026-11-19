import models from "./content-model.json" with { type: "json" };
import { documentId } from "./config";
export function previewDocumentIds(pathname: string): string[] | null {
  if (/^\/careers(?:\/[a-z0-9-]+(?:\/apply)?)?$/.test(pathname))
    return ["page-careers", "page-site", "page-announcements"];
  if (
    !models.some(
      (model) =>
        model.path === pathname &&
        !["site", "announcements"].includes(model.slug),
    )
  )
    return null;
  return models
    .filter(
      (model) =>
        model.path === pathname ||
        ["site", "announcements"].includes(model.slug) ||
        (pathname === "/timetable" && model.slug === "fees"),
    )
    .map((model) => documentId(model.slug));
}
export function contentRevision(
  documents: { _id: string; _rev: string }[],
): string {
  return JSON.stringify(
    documents
      .map((document) => [document._id, document._rev])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}
