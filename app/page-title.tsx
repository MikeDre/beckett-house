"use client";

import { useEffect } from "react";

// Sets the tab title on pages where vinext ignores the metadata export, such as the 404 page.
export default function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
