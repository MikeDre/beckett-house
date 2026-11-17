/** Convert only at the boundary so the established page layouts stay intact. */
export function fieldName(key: string) {
  return key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
export function imageUrl(reference: string) {
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(reference);
  return match
    ? `https://cdn.sanity.io/images/lk8ts1r7/production/${match[1]}-${match[2]}.${match[3]}`
    : "";
}
export function fromSanity(value: unknown, template: unknown): unknown {
  if (
    typeof template === "string" &&
    value &&
    typeof value === "object" &&
    "asset" in value
  )
    return imageUrl((value as { asset: { _ref: string } }).asset._ref);
  if (
    typeof template === "string" &&
    Array.isArray(value) &&
    value.every((block) => block?._type === "block")
  )
    return value
      .map((block) =>
        block.children
          .map((span: { text: string; marks?: string[] }) =>
            span.marks?.includes("strong")
              ? "**" + span.text + "**"
              : span.text,
          )
          .join(""),
      )
      .join("\n\n");
  if (Array.isArray(template)) {
    const objects = template.filter(
      (item) => item && typeof item === "object" && !Array.isArray(item),
    );
    const itemTemplate = objects.length
      ? Object.assign({}, ...objects)
      : template[0];
    return Array.isArray(value)
      ? value.map((item) => fromSanity(item, itemTemplate))
      : template;
  }
  if (template && typeof template === "object") {
    const source = value as Record<string, unknown> | undefined;
    if (!source) return template;
    const result: Record<string, unknown> = {},
      original = template as Record<string, unknown>;
    for (const [key, fallback] of Object.entries(original))
      if (
        fallback &&
        typeof fallback === "object" &&
        !Array.isArray(fallback) &&
        key !== "image" &&
        source[fieldName(key)] === undefined
      )
        result[key] = fallback;
    for (const [key,fallback] of Object.entries(original)) {
      if(source[fieldName(key)]!==undefined)continue;
      if(Array.isArray(fallback) && key!=='funded15') result[key]=[];
      if(/^(text|paragraph)\d+$/.test(key))result[key]='';
      if(key==='image' && fallback && !('category' in original))result[key]=fallback;
    }
    for (const [name, child] of Object.entries(source)) {
      if (name.startsWith("_") || name === "asset") continue;
      const key =
        Object.keys(original).find((key) => fieldName(key) === name) ?? name;
      result[key] = fromSanity(child, original[key] ?? child);
    }
    if (source.asset) {
      const reference = (source.asset as { _ref: string })._ref;
      const url = imageUrl(reference);
      if (url) {
        result["imageSrc" in original ? "imageSrc" : "src"] = url;
        const dimensions = /-(\d+)x(\d+)-/.exec(reference);
        if (dimensions && "width" in original)
          result.width = Number(dimensions[1]);
        if (dimensions && "height" in original)
          result.height = Number(dimensions[2]);
        if ("alt" in original && typeof result.alt !== "string")
          result.alt = "";
        if ("imageAlt" in original && typeof result.imageAlt !== "string")
          result.imageAlt = "";
      }
    }
    return result;
  }
  return value === undefined ? template : value;
}
