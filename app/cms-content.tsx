"use client";
import { locations as defaultLocations, type Location } from "../lib/content";
import Image, { type ImageProps } from "next/image";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createDataAttribute } from "@sanity/visual-editing-standalone";
import {
  documentId,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  STUDIO_URL,
} from "../lib/sanity/config";
import { fieldName } from "../lib/sanity/shape";

type ContentContext = { documents: Record<string, unknown>; preview: boolean };
const Context = createContext<ContentContext>({
  documents: {},
  preview: false,
});
export function CmsProvider({
  documents,
  preview,
  children,
}: ContentContext & { children: ReactNode }) {
  return (
    <Context.Provider value={{ documents, preview }}>
      {children}
    </Context.Provider>
  );
}
export function useCmsContent<T>(page: string, fallback: T): T {
  const { documents } = useContext(Context);
  return (documents[page] as T | undefined) ?? fallback;
}
function lookup(source: unknown, path: string) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      source,
    );
}
export function useEditAttribute(page: string, path: string) {
  const { preview } = useContext(Context);
  return preview
    ? createDataAttribute({
        id: documentId(page),
        type: fieldName(page) + "Page",
        path: path.split(".").map(fieldName).join("."),
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        baseUrl: STUDIO_URL,
      }).toString()
    : undefined;
}
export function CmsText({
  page,
  field,
  fallback,
}: {
  page: string;
  field: string;
  fallback: string;
}) {
  const { documents } = useContext(Context);
  const text = lookup(documents[page], field);
  const attribute = useEditAttribute(page, field);
  const value = typeof text === "string" ? text : fallback;
  return attribute ? (
    <span data-sanity={attribute}>{value}</span>
  ) : (
    <>{value}</>
  );
}
export function CmsImage({
  page,
  field,
  ...props
}: ImageProps & { page: string; field: string }) {
  const { documents } = useContext(Context);
  const image = lookup(documents[page], field) as
    Partial<ImageProps> | undefined;
  return (
    <Image
      {...props}
      {...image}
      alt={image?.alt ?? props.alt}
      data-sanity={useEditAttribute(page, field)}
      unoptimized={
        typeof image?.src === "string" &&
        image.src.startsWith("https://cdn.sanity.io/")
      }
    />
  );
}
export function CmsField({
  page,
  field,
  children,
}: {
  page: string;
  field: string;
  children: ReactNode;
}) {
  const attribute = useEditAttribute(page, field);
  return attribute ? (
    <span data-sanity={attribute}>{children}</span>
  ) : (
    <>{children}</>
  );
}

export function useCmsLocations(
  fallback: Location[] = defaultLocations,
): Location[] {
  const { locations } = useCmsContent("site", {
    locations: [] as (Partial<Location> & {
      panoramaLabels?: { name: string; description: string }[];
    })[],
  });
  return useMemo(
    () =>
      fallback.map((original) => {
        const content = locations.find((item) => item.slug === original.slug);
        return {
          ...original,
          ...content,
          panoramas: original.panoramas.map((scene, index) => ({
            ...scene,
            ...content?.panoramaLabels?.[index],
          })),
        };
      }),
    [fallback, locations],
  );
}

export function CmsRegion({
  as = "div",
  page,
  field,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "figure";
  page: string;
  field: string;
}) {
  const attribute = useEditAttribute(page, field);
  const Element = as;
  return (
    <Element {...props} data-sanity={attribute}>
      {children}
    </Element>
  );
}
