/* eslint-disable @next/next/no-img-element -- CMS asset previews use the selected local image directly. */
"use client";
import { siteImages } from "../../lib/media-library";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type IconName = "grid" | "pages" | "news" | "inbox" | "clock" | "settings" | "mail" | "arrow" | "external" | "chevron" | "check" | "plus" | "close" | "eye" | "search" | "image" | "globe" | "logout" | "menu" | "back" | "desktop" | "phone" | "save" | "trash" | "copy" | "leaf" | "alert";
const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  pages: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
  news: <><path d="m3 11 16-6v14L3 13v-2ZM6 14l2 7h4l-2-6M21 9v6"/></>,
  inbox: <><path d="m4 4-2 10v6h20v-6L20 4H4ZM2 14h6l2 3h4l2-3h6"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="3" fill="currentColor" stroke="none"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>, external: <><path d="M14 3h7v7m0-7L11 13M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>, check: <path d="m5 12 4 4L19 6"/>, plus: <path d="M12 5v14M5 12h14"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  logout: <><path d="M9 4H4v16h5M9 12h12m-5-5 5 5-5 5"/></>, menu: <path d="M4 6h16M4 12h16M4 18h16"/>, back: <path d="M20 12H4m6-6-6 6 6 6"/>,
  desktop: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>, phone: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
  leaf: <><path d="M20 3C10 2 3 5 4 13c1 6 8 8 12 3 3-4 2-8 4-13Z"/><path d="M4 21 15 9"/></>,
  alert: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T = unknown>(path: string, method = "GET", data?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, { method, signal, cache: "no-store", ...(method !== "GET" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data ?? {}) } : {}) });
  if (!response.headers.get("content-type")?.includes("application/json")) throw new ApiError("Your sign-in may have expired. Reload this page to sign in again. Your unsaved edits are still here.", response.status);
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new ApiError(result.error || "We couldn’t complete that request. Please try again.", response.status);
  return result as T;
}
export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    api<T>(path, "GET", undefined, controller.signal).then(setData).catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  return { data, setData, error, loading, reload };
}
export function useRefreshOnActivate(active: boolean, reload: () => void) {
  const previous = useRef(active);
  useEffect(() => { if (active && !previous.current) reload(); previous.current = active; }, [active, reload]);
}
export type Notify = (kind: "success" | "error", message: string) => void;
export type DirtyHandler = (section: string, dirty: boolean) => void;
export function useDirty(section: string, dirty: boolean, onDirty: DirtyHandler) {
  useEffect(() => { onDirty(section, dirty); return () => onDirty(section, false); }, [section, dirty, onDirty]);
}
export function Field({ label, hint, value, onChange, type = "text", multiline = false, maxLength, required = false, readOnly = false }: { label: string; hint?: string; value: string | number; onChange?: (value: string) => void; type?: string; multiline?: boolean; maxLength?: number; required?: boolean; readOnly?: boolean }) {
  return <label className="cms-field"><span className="cms-field-label">{label}{required && <span className="cms-required" aria-hidden="true"> *</span>}</span>{multiline ? <textarea rows={4} value={value} maxLength={maxLength} required={required} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} /> : <input type={type} value={value} maxLength={maxLength} required={required} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} {...(type === "number" ? { min: 0, step: "any" } : {})} />}{(hint || maxLength) && <span className="cms-field-hint">{hint && <span>{hint}</span>}{maxLength && <span>{String(value).length}/{maxLength}</span>}</span>}</label>;
}
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) { return <span className={`cms-badge cms-badge-${tone}`}><span className="cms-badge-dot"/>{children}</span>; }
export function Empty({ icon, title, description, children }: { icon: IconName; title: string; description: string; children?: ReactNode }) { return <div className="cms-empty"><span className="cms-empty-icon"><Icon name={icon} size={24}/></span><h3>{title}</h3><p>{description}</p>{children}</div>; }
export function Loading({ label = "Loading your workspace…" }: { label?: string }) { return <div className="cms-loading" role="status"><span className="cms-spinner"/>{label}</div>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <div className="cms-error-state" role="alert"><Icon name="alert"/><div><strong>Unable to load content</strong><p>{message}</p><button className="cms-btn cms-btn-secondary" onClick={retry} type="button">Try again</button></div></div>; }
export function SaveBar({ dirty, saving, children, label = "Save changes" }: { dirty: boolean; saving: boolean; children?: ReactNode; label?: string }) { return <div className="cms-savebar"><span className={dirty ? "cms-unsaved" : "cms-saved"}><Icon name={dirty ? "clock" : "check"} size={16}/>{saving ? "Saving your changes…" : dirty ? "You have unsaved changes" : "All changes saved"}</span><div className="cms-actions">{children}<button type="submit" className="cms-btn cms-btn-primary" disabled={saving || !dirty}><Icon name="save" size={16}/>{saving ? "Saving…" : label}</button></div></div>; }
export function Modal({ open, title, children, onClose, wide = false, drawer = false }: { open: boolean; title: string; children: ReactNode; onClose: () => void; wide?: boolean; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (open && !dialog?.open) dialog?.showModal(); else if (!open && dialog?.open) dialog.close(); }, [open]);
  return <dialog ref={ref} aria-label={title} className={`cms-modal${wide ? " cms-modal-wide" : ""}${drawer ? " cms-drawer" : ""}`} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) { const box = ref.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}><header className="cms-modal-header"><h2>{title}</h2><button type="button" className="cms-icon-btn" aria-label="Close dialog" onClick={onClose}><Icon name="close"/></button></header>{children}</dialog>;
}
export function Confirm({ open, title, description, action = "Confirm", danger = false, busy = false, onConfirm, onClose }: { open: boolean; title: string; description: string; action?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onClose: () => void }) { return <Modal open={open} title={title} onClose={() => { if (!busy) onClose(); }}><div className="cms-modal-body"><span className={`cms-confirm-icon${danger ? " is-danger" : ""}`}><Icon name={danger ? "trash" : "globe"} size={24}/></span><p>{description}</p></div><footer className="cms-modal-footer"><button className="cms-btn cms-btn-secondary" autoFocus type="button" disabled={busy} onClick={onClose}>Cancel</button><button className={`cms-btn ${danger ? "cms-btn-danger" : "cms-btn-primary"}`} type="button" disabled={busy} onClick={onConfirm}>{busy ? "Working…" : action}</button></footer></Modal>; }
export function formatDate(date?: string | null, time = false) { if (!date) return "Not yet"; const parsed = new Date(date); return Number.isNaN(parsed.getTime()) ? "Unknown date" : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", ...(time ? { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" } : { year: "numeric" }) }).format(parsed); }
export { siteImages } from "../../lib/media-library";
export type LibraryImage = typeof siteImages[number] & { id?: string; uploaded?: boolean; used?: boolean };
export function ImagePicker({ src, alt, onChoose }: { src: string; alt: string; onChoose: (image: LibraryImage) => void }) {
  const [open, setOpen] = useState(false);
  const safe = /^\/images\/[\w/-]+\.(webp|jpe?g|png|avif)$/i.test(src) && !src.includes("..");
  return <><div className="cms-image-picker">{safe ? <img src={src} alt={alt || "Selected website image"}/> : <span className="cms-image-placeholder"><Icon name="image" size={28}/></span>}<div><strong>{src ? "Selected image" : "Add an image"}</strong><p>Choose a photo or upload a new one.</p><button type="button" className="cms-btn cms-btn-secondary cms-btn-small" onClick={() => setOpen(true)}><Icon name="image" size={15}/>{src ? "Change image" : "Choose image"}</button></div></div><Modal open={open} title="Choose a website image" wide onClose={() => setOpen(false)}>{open && <div className="cms-modal-body"><MediaLibrary selected={src} onChoose={image => { onChoose(image); setOpen(false); }}/></div>}</Modal></>;
}
export function MediaLibrary({ selected, onChoose }: { selected?: string; onChoose?: (image: LibraryImage) => void }) {
  const resource = useResource<{ configured: boolean; images: LibraryImage[]; pendingDeletes: {id:string;name:string}[] }>("media");
  const [search, setSearch] = useState(""), [name, setName] = useState(""), [alt, setAlt] = useState(""), [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState(""), [removing, setRemoving] = useState<{id:string;name:string} | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const library: LibraryImage[] = resource.data?.images ?? siteImages;
  const images = library.filter(image => `${image.name} ${image.alt}`.toLowerCase().includes(search.trim().toLowerCase()));
  async function copyUrl(image: LibraryImage) {
    setError(""); setMessage("");
    try {
      await navigator.clipboard.writeText(new URL(image.src, window.location.origin).href);
      setMessage(`Image URL copied for ${image.name}.`);
    } catch { setError("Unable to copy the image URL. Please allow clipboard access in your browser and try again."); }
  }
  async function upload() {
    if (!file || !name.trim() || !alt.trim()) { setError("Choose a photo and enter its name and description."); return; }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) { setError("Choose a JPEG, PNG or WebP photo no larger than 5 MB."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const body = new FormData(); body.set('file',file); body.set('name',name); body.set('alt',alt);
      const response = await fetch('/api/admin/media',{method:'POST',body,signal:AbortSignal.timeout(60000)});
      const result = await response.json() as LibraryImage & {error?:string};
      if (!response.ok) throw new Error(result.error || 'Photo upload failed. Please try again.');
      setFile(null); setName(""); setAlt(""); setSearch(""); if (input.current) input.current.value = "";
      setMessage("Photo uploaded."); resource.reload(); onChoose?.(result);
    } catch (error) { setError(error instanceof Error ? error.message : 'Photo upload failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!removing) return; setBusy(true); setError("");
    try { await api(`media/${removing.id}`,'DELETE',{}); setRemoving(null); setMessage('Photo removed.'); resource.reload(); }
    catch (error) { setError((error as Error).message); resource.reload(); }
    finally { setBusy(false); }
  }
  return <>
    <p className="cms-muted">Existing website photos and uploaded images. Photos are resized and optimised automatically.</p>
    {resource.loading && <Loading label="Loading image library…"/>}
    {resource.error && <ErrorState message={resource.error} retry={resource.reload}/>}
    {resource.data && !resource.data.configured && <p role="status">Uploads will be available once the image-storage connection is configured.</p>}
    {resource.data?.configured && <details className="cms-card cms-editor-section"><summary><strong>Upload a photo</strong></summary><fieldset className="cms-editor-section-body cms-fieldset" disabled={busy} onKeyDown={event => { if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'file') event.preventDefault(); }}>
      <label className="cms-field"><span className="cms-field-label">Photo</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const next = event.target.files?.[0] ?? null; setFile(next); if (next && !name) setName(next.name.replace(/\.[^.]+$/, '').replace(/[-_]/g,' ')); }}/><span className="cms-field-hint">JPEG, PNG or WebP · up to 5 MB</span></label>
      <Field label="Image name" value={name} maxLength={150} onChange={setName}/><Field label="Image description" hint="Describe what is shown for people using screen readers." value={alt} maxLength={500} onChange={setAlt}/>
      <button type="button" className="cms-btn cms-btn-primary" disabled={busy || !file || !name.trim() || !alt.trim()} onClick={() => void upload()}>{busy ? 'Working…' : 'Upload photo'}</button>
    </fieldset></details>}
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <Field label="Search images" hint={`${images.length} images available`} value={search} onChange={setSearch}/>
    {!images.length && <p role="status">No images match your search.</p>}
    <div className="cms-media-grid">{images.map(image => <div className="cms-media-item" key={image.src}>
      <button type="button" disabled={!onChoose || busy} aria-pressed={selected === image.src} className={selected === image.src ? 'is-selected' : ''} onClick={() => onChoose?.(image)}><img src={image.src} alt={image.alt} loading="lazy"/><span>{image.name}{selected === image.src && <Icon name="check" size={15}/>}</span></button>
      <div className="cms-media-meta"><small>{image.uploaded ? (image.used ? 'Used in content or history' : 'Not used in saved content') : 'Website image'}</small><div className="cms-media-actions">
        <button type="button" className="cms-icon-btn" title="Copy image URL" aria-label={`Copy image URL for ${image.name}`} onClick={() => void copyUrl(image)}><Icon name="copy" size={17}/></button>
        <a className="cms-icon-btn" href={image.src} target="_blank" rel="noopener noreferrer" title="Open image" aria-label={`Open ${image.name} in a new tab`}><Icon name="external" size={17}/></a>
        {image.uploaded && <button type="button" className="cms-icon-btn cms-media-delete" title={image.used ? 'Photos used in saved content or version history cannot be removed' : image.src === selected ? 'The selected photo cannot be removed' : 'Remove photo'} aria-label={`Remove ${image.name}`} disabled={busy || image.used || image.src === selected} onClick={() => setRemoving({id:image.id!,name:image.name})}><Icon name="trash" size={17}/></button>}
      </div></div>
    </div>)}</div>
    {resource.data?.pendingDeletes.map(image => <p key={image.id}>Removal pending: {image.name} <button type="button" className="cms-text-btn" disabled={busy} onClick={() => setRemoving(image)}>Retry removal</button></p>)}
    <Confirm open={Boolean(removing)} title="Remove this photo?" description={`${removing?.name || 'This photo'} will be removed permanently. Photos used in saved drafts, published content or version history cannot be removed.`} action="Remove photo" danger busy={busy} onClose={() => setRemoving(null)} onConfirm={() => void remove()}/>
  </>;
}

export function EditorSection({ title, description, number, children }: { title: string; description: string; number?: string; children: ReactNode }) { return <details className="cms-card cms-editor-section"><summary><span className="cms-section-number">{number || <Icon name="pages" size={17}/>}</span><span><strong>{title}</strong><small>{description}</small></span><Icon name="chevron" size={18}/></summary><div className="cms-editor-section-body">{children}</div></details>; }
