"use client";

import { useEffect, useRef, useState } from "react";
import { validateHomepageContent, type HomePageContent, type HomePageRecord } from "../../lib/homepage-content";
import { validateNurseryPageContent, type NurseryPageContent, type NurseryPageRecord } from "../../lib/nursery-pages";
import NurseryFields from "./nursery-fields";
import { ApiError, api, Badge, Confirm, EditorSection, ErrorState, Field, formatDate, Icon, ImagePicker, Loading, useDirty, useResource, type DirtyHandler, type Notify } from "./ui";

type PageRecord = HomePageRecord | NurseryPageRecord;
type PageContent = HomePageContent | NurseryPageContent;
type NurserySlug = "angel" | "abbey-road";
const nurseryNames: Record<NurserySlug, string> = { angel: "Angel", "abbey-road": "Abbey Road" };
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const pageName = (record: PageRecord) => record.slug === "home" ? "Nursery selection map" : `${record.title} nursery homepage`;
const validate = (slug: PageRecord["slug"], content: unknown): PageContent => slug === "home" ? validateHomepageContent(content) : validateNurseryPageContent(content);

export function PagesSection({ page, navigate, notify, onDirty }: { page: string | null; navigate: (view: string) => void; notify: Notify; onDirty: DirtyHandler }) {
  const resource = useResource<PageRecord[]>("pages");
  if (resource.loading) return <Loading label="Loading your pages…"/>;
  if (resource.error || !resource.data) return <ErrorState message={resource.error || "Your pages couldn’t be loaded."} retry={resource.reload}/>;
  const records = resource.data;
  function updateRecord(next: PageRecord) { resource.setData(current => current?.map(record => record.slug === next.slug ? next : record) ?? null); }
  return <>
    <div hidden={page !== null}>
      <div className="cms-section-toolbar"><div className="cms-search cms-search-static"><Icon name="pages" size={18}/><span>{records.length} editable pages</span></div><span className="cms-muted cms-small">Drafts and publishing are managed separately for each page.</span></div>
      <div className="cms-card cms-pages-list"><div className="cms-list-heading"><span>Page</span><span>Status</span><span>Last updated</span><span/></div>
        {records.map(record => <a href={`#pages/${record.slug}`} key={record.slug} className="cms-page-row" onClick={event => { event.preventDefault(); navigate(`pages/${record.slug}`); }}>
          <span className="cms-page-identity"><span className="cms-page-thumb"><Icon name={record.slug === "home" ? "globe" : "leaf"} size={26}/></span><span><strong>{pageName(record)}</strong><small>{record.slug === "home" ? "Homepage" : record.title} · {record.path}</small></span></span>
          <span className="cms-page-badges"><Badge tone="green">Published</Badge>{record.draft && !equal(record.draft, record.published) && <Badge tone="amber">Draft changes</Badge>}</span>
          <span className="cms-muted cms-small">{record.draftUpdatedAt ? formatDate(record.draftUpdatedAt, true) : "Original website content"}</span><span className="cms-page-edit">Edit page <Icon name="arrow" size={17}/></span>
        </a>)}
      </div>
      <div className="cms-inline-note"><Icon name="leaf" size={18}/><p>Each page has its own draft and publishing history. Changes stay private until you choose to publish that page.</p></div>
    </div>
    {page !== null && !records.some(record => record.slug === page) && <ErrorState message="This page is not available in the editor." retry={() => navigate("pages")}/>}
    {records.map(record => <div key={record.slug} hidden={page !== record.slug}><PageEditor initial={record} active={page === record.slug} onRecord={updateRecord} notify={notify} onDirty={onDirty} navigate={navigate}/></div>)}
  </>;
}

function PageEditor({ initial, active, onRecord, notify, onDirty, navigate }: { initial: PageRecord; active: boolean; onRecord: (record: PageRecord) => void; notify: Notify; onDirty: DirtyHandler; navigate: (view: string) => void }) {
  const [record, setRecord] = useState(initial), [content, setContent] = useState<PageContent>(() => structuredClone(initial.draft ?? initial.published));
  const [tab, setTab] = useState("content"), [saving, setSaving] = useState(false), [publishing, setPublishing] = useState(false), [reloading, setReloading] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false), [discard, setDiscard] = useState(false), [conflict, setConflict] = useState(false);
  const slug = record.slug, name = pageName(record), busy = saving || publishing || reloading;
  const dirty = !equal(content, record.draft ?? record.published), pending = Boolean(record.draft && !equal(record.draft, record.published));
  useDirty(`page:${slug}`, dirty, onDirty);
  function accept(next: PageRecord) { setRecord(next); onRecord(next); setContent(structuredClone(next.draft ?? next.published)); setConflict(false); }
  function report(error: unknown) { if (error instanceof ApiError && error.status === 409) setConflict(true); notify("error", error instanceof Error ? error.message : "Something went wrong. Please try again."); }
  async function saveDraft(quiet = false) {
    const validated = validate(slug, content);
    const next = await api<PageRecord>(`pages/${slug}`, "PUT", { content: validated, version: record.version });
    accept(next); if (!quiet) notify("success", "Draft saved. Your live page has not changed."); return next;
  }
  async function save() { if (busy) return; setSaving(true); try { await saveDraft(); } catch (error) { report(error); } finally { setSaving(false); } }
  async function publish() {
    if (busy) return;
    setPublishing(true);
    try {
      const saved = dirty ? await saveDraft(true) : record;
      const next = await api<PageRecord>(`pages/${slug}/publish`, "POST", { version: saved.version });
      accept(next); setConfirmPublish(false); notify("success", `${name} published.`);
    } catch (error) { setConfirmPublish(false); report(error); }
    finally { setPublishing(false); }
  }
  async function discardEdits() {
    if (busy) return;
    if (!conflict) { setContent(structuredClone(record.draft ?? record.published)); setDiscard(false); return; }
    setReloading(true);
    try { accept(await api<PageRecord>(`pages/${slug}`)); setDiscard(false); }
    catch (error) { report(error); }
    finally { setReloading(false); }
  }
  const tabs = [{ id: "content", label: "Page content", icon: "pages" as const }, { id: "seo", label: "Search appearance", icon: "search" as const }, { id: "preview", label: "Preview", icon: "eye" as const }];
  return <form noValidate onSubmit={event => { event.preventDefault(); void save(); }}>
    <div className="cms-editor-toolbar"><button type="button" className="cms-text-btn" onClick={() => navigate("pages")}><Icon name="back" size={16}/>All pages</button><div className="cms-actions"><Badge tone={dirty || pending ? "amber" : "green"}>{dirty ? "Unsaved changes" : pending ? "Draft changes" : "Published"}</Badge><a href={record.path} target="_blank" rel="noopener noreferrer" className="cms-text-btn">View live page <Icon name="external" size={15}/></a></div></div>
    <div className="cms-editor-tabs" role="tablist" aria-label={`${name} editor`}>{tabs.map((item, index) => <button type="button" role="tab" tabIndex={tab === item.id ? 0 : -1} id={`editor-${slug}-tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`editor-${slug}-panel-${item.id}`} className={tab === item.id ? "is-active" : ""} key={item.id} onClick={() => setTab(item.id)} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? tabs[(index + 1) % tabs.length] : event.key === "ArrowLeft" ? tabs[(index + tabs.length - 1) % tabs.length] : event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[tabs.length - 1] : undefined;
      if (next) { event.preventDefault(); setTab(next.id); document.getElementById(`editor-${slug}-tab-${next.id}`)?.focus(); }
    }}><Icon name={item.icon} size={17}/>{item.label}</button>)}</div>
    {conflict && <div className="cms-conflict" role="alert"><Icon name="alert"/><div><strong>A newer version was saved elsewhere.</strong><p>Your edits are still here. Copy any changes you need before loading the latest version.</p><button type="button" disabled={busy} className="cms-text-btn" onClick={() => setDiscard(true)}>Reload latest draft <Icon name="arrow" size={15}/></button></div></div>}
    <div className="cms-editor-layout" hidden={tab === "preview"}><div className="cms-editor-main"><fieldset disabled={busy} className="cms-fieldset">
      <div role="tabpanel" id={`editor-${slug}-panel-content`} aria-labelledby={`editor-${slug}-tab-content`} hidden={tab !== "content"}>
        {slug === "home" ? <MapFields content={content as HomePageContent} onChange={setContent}/> : <NurseryFields content={content as NurseryPageContent} onChange={setContent}/>}
      </div>
      <div role="tabpanel" id={`editor-${slug}-panel-seo`} aria-labelledby={`editor-${slug}-tab-seo`} hidden={tab !== "seo"}>
        <EditorSection title="Search appearance" description="Title and description used by search engines and social previews.">
          <Field label="Search title" hint="Aim for around 50–60 characters. Search engines may shorten longer titles." value={content.seoTitle} maxLength={200} required onChange={seoTitle => setContent(current => ({ ...current, seoTitle }))}/>
          <Field label="Search description" hint="A useful summary of around 150–160 characters works well." value={content.seoDescription} maxLength={500} multiline required onChange={seoDescription => setContent(current => ({ ...current, seoDescription }))}/>
          <div className="cms-search-preview"><p className="cms-eyebrow">Search preview</p><span>www.beckett-house.co.uk{record.path}</span><h3>{content.seoTitle || "Your page title"}</h3><p>{content.seoDescription || "Your page description will appear here."}</p></div>
          <p className="cms-field-note">This is an approximate preview. Search engines can choose different titles and descriptions.</p>
        </EditorSection>
      </div>
    </fieldset></div><aside className="cms-editor-aside"><section className="cms-card cms-publish-card"><div className="cms-card-header"><h2>Page details</h2><Icon name="pages" size={18}/></div><dl className="cms-meta-list"><div><dt>Page address</dt><dd><a href={record.path} target="_blank" rel="noopener noreferrer">{record.path} <Icon name="external" size={13}/></a></dd></div><div><dt>Live content</dt><dd><Badge tone="green">Published</Badge></dd></div><div><dt>Draft saved</dt><dd>{formatDate(record.draftUpdatedAt, true)}</dd></div><div><dt>Last published</dt><dd>{record.publishedAt ? formatDate(record.publishedAt, true) : "Original website"}</dd></div></dl></section><section className="cms-editor-tip"><span className="cms-tip-icon"><Icon name="leaf" size={20}/></span><h3>Publishing workflow</h3><p>Save draft stores changes privately. Publish changes updates this live page.</p><button type="button" className="cms-text-btn" onClick={() => setTab("preview")}>Preview your changes <Icon name="arrow" size={15}/></button></section></aside></div>
    <div role="tabpanel" id={`editor-${slug}-panel-preview`} aria-labelledby={`editor-${slug}-tab-preview`} hidden={tab !== "preview"}><DraftPreview slug={slug} content={content} active={active && tab === "preview"}/></div>
    <div className="cms-savebar"><span className={dirty ? "cms-unsaved" : "cms-saved"}><Icon name={dirty ? "clock" : "check"} size={16}/>{busy ? publishing ? "Publishing page…" : reloading ? "Loading latest draft…" : "Saving draft…" : dirty ? "You have unsaved changes" : pending ? "Draft saved · not yet published" : "No unpublished changes"}</span><div className="cms-actions">{dirty && <button type="button" className="cms-text-btn" disabled={busy} onClick={() => setDiscard(true)}>Discard edits</button>}<button type="submit" className="cms-btn cms-btn-secondary" disabled={busy || !dirty}><Icon name="save" size={16}/>{saving ? "Saving…" : "Save draft"}</button><button type="button" className="cms-btn cms-btn-primary" disabled={busy || (!dirty && !pending)} onClick={() => { try { validate(slug, content); setConfirmPublish(true); } catch (error) { report(error); } }}><Icon name="globe" size={16}/>Publish changes</button></div></div>
    <Confirm open={confirmPublish} title={`Publish ${name.toLowerCase()}?`} description={dirty ? "Your edits will be saved as a draft, then published to this live page. Families will see the changes immediately." : "Your saved draft will replace this live page. Families will see the changes immediately."} action="Publish page" busy={publishing} onClose={() => setConfirmPublish(false)} onConfirm={() => void publish()}/>
    <Confirm open={discard} title={conflict ? "Load the latest version?" : "Discard your unsaved edits?"} description={conflict ? "This will replace your edits on this page with the latest saved version. Copy anything you want to keep first. Edits to other pages stay as they are." : "Your unsaved edits on this page will be removed. Your last saved draft and the live page won’t change."} action={conflict ? "Load latest version" : "Discard edits"} busy={reloading} onClose={() => setDiscard(false)} onConfirm={() => void discardEdits()}/>
  </form>;
}

function MapFields({ content, onChange }: { content: HomePageContent; onChange: (content: HomePageContent) => void }) {
  const [nursery, setNursery] = useState<NurserySlug>("angel");
  const card = content.nurseryCards[nursery];
  function update(patch: Partial<HomePageContent>) { onChange({ ...content, ...patch }); }
  function updateCard(patch: Partial<typeof card>) { update({ nurseryCards: { ...content.nurseryCards, [nursery]: { ...card, ...patch } } }); }
  return <>
    <EditorSection number="01" title="Welcome & introduction" description="Introduction and nursery selection buttons.">
      <Field label="Page heading" hint="Describes the page to screen readers. Your logo remains the visual heading." value={content.heading} maxLength={300} required onChange={heading => update({ heading })}/>
      <Field label="Introduction" hint="Introductory text displayed alongside the map." value={content.introduction} maxLength={4000} multiline required onChange={introduction => update({ introduction })}/>
      <div className="cms-field-grid"><Field label="Angel button label" value={content.nurseryLabels.angel} maxLength={100} required onChange={angel => update({ nurseryLabels: { ...content.nurseryLabels, angel } })}/><Field label="Abbey Road button label" value={content.nurseryLabels["abbey-road"]} maxLength={100} required onChange={value => update({ nurseryLabels: { ...content.nurseryLabels, "abbey-road": value } })}/></div>
    </EditorSection>
    <EditorSection number="02" title="Nursery cards" description="Images, summaries and action labels for each nursery.">
      <div className="cms-segmented" aria-label="Choose a nursery">{(Object.keys(nurseryNames) as NurserySlug[]).map(slug => <button type="button" key={slug} aria-pressed={nursery === slug} className={nursery === slug ? "is-active" : ""} onClick={() => setNursery(slug)}>{nurseryNames[slug]}</button>)}</div>
      <ImagePicker src={card.imageSrc} alt={card.imageAlt} onChoose={image => updateCard({ imageSrc: image.src, imageAlt: image.alt })}/>
      <Field label={`${nurseryNames[nursery]} image description`} hint="Describe what’s in the image for people using screen readers." maxLength={500} value={card.imageAlt} required onChange={imageAlt => updateCard({ imageAlt })}/>
      <Field label={`${nurseryNames[nursery]} summary`} maxLength={2000} multiline required value={card.summary} onChange={summary => updateCard({ summary })}/>
      <Field label={`${nurseryNames[nursery]} call to action`} maxLength={100} value={card.buttonLabel} required onChange={buttonLabel => updateCard({ buttonLabel })}/>
      <p className="cms-field-note"><Icon name="settings" size={15}/>Addresses, ages and opening times are shared nursery information and stay consistent across the site.</p>
    </EditorSection>
  </>;
}

function DraftPreview({ slug, content, active }: { slug: PageRecord["slug"]; content: PageContent; active: boolean }) {
  const [mobile, setMobile] = useState(false), [scale, setScale] = useState(1), [ready, setReady] = useState(false);
  const container = useRef<HTMLDivElement>(null), frame = useRef<HTMLIFrameElement>(null);
  const width = mobile ? 390 : 1280, height = mobile ? 844 : 800;
  const name = slug === "home" ? "Nursery map" : `${nurseryNames[slug]} homepage`, path = slug === "home" ? "/" : `/${slug}`;
  const messageType = slug === "home" ? "beckett-homepage-preview" : "beckett-page-preview";
  const readyType = slug === "home" ? "beckett-homepage-preview-ready" : "beckett-page-preview-ready";
  useEffect(() => {
    if (!active || !container.current) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(container.current); return () => observer.disconnect();
  }, [width, active]);
  useEffect(() => {
    if (!active) return;
    const handshake = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === readyType && (slug === "home" || event.data.slug === slug)) {
        setReady(true);
        frame.current?.contentWindow?.postMessage({ type: messageType, slug, content }, window.location.origin);
      }
    };
    window.addEventListener("message", handshake); return () => window.removeEventListener("message", handshake);
  }, [active, content, slug, messageType, readyType]);
  useEffect(() => { if (ready && active) frame.current?.contentWindow?.postMessage({ type: messageType, slug, content }, window.location.origin); }, [ready, content, active, slug, messageType]);
  return <section className="cms-card cms-preview-card"><div className="cms-preview-toolbar"><div><strong>{name} preview</strong><span className="cms-muted cms-small">Includes your current edits · visible only to staff</span></div><div className="cms-segmented" aria-label="Preview device"><button type="button" className={!mobile ? "is-active" : ""} aria-pressed={!mobile} onClick={() => setMobile(false)}><Icon name="desktop" size={16}/>Desktop</button><button type="button" className={mobile ? "is-active" : ""} aria-pressed={mobile} onClick={() => setMobile(true)}><Icon name="phone" size={16}/>Mobile</button></div></div><div className="cms-preview-stage" ref={container}><div className="cms-browser-frame" style={{ width: width * scale, height: height * scale + 34 }}><div className="cms-browser-bar"><span/><span/><span/><small>beckett-house.co.uk {path}</small><Badge tone="amber">Preview</Badge></div>{active && <iframe ref={frame} src={`/admin/preview/${slug}`} title={`Private ${name.toLowerCase()} draft preview`} onLoad={() => { setReady(true); frame.current?.contentWindow?.postMessage({ type: messageType, slug, content }, window.location.origin); }} style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}/>}</div></div><p className="cms-preview-caption"><Icon name="eye" size={15}/>Preview the layout here. Links are disabled to keep you in the editor.</p></section>;
}
