"use client";
import { useState } from "react";
import { api, Badge, Confirm, ErrorState, formatDate, Icon, Loading, useResource } from "./ui";
import { DraftPreview, type PageContent, type PageRecord } from "./pages-editor";
type Revision = {version:number;published_at:string|null;published_by:string|null};
export default function PageHistory({record,busy,hasEdits,onRestore}:{record:PageRecord;busy:boolean;hasEdits:boolean;onRestore:(version:number)=>Promise<void>}) {
 const resource=useResource<{currentVersion:number;revisions:Revision[]}>(`pages/${record.slug}/history`);
 const [selected,setSelected]=useState<(Revision & {content:PageContent})|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(""),[confirm,setConfirm]=useState(false);
 async function preview(version:number) {setLoading(true);setError("");try{setSelected(await api(`pages/${record.slug}/history/${version}`));}catch(error){setError((error as Error).message);}finally{setLoading(false);}}
 const date=(revision:Revision)=>revision.published_at ? formatDate(revision.published_at,true) : "Original website content";
 return <section className="cms-history" aria-label="Version history">
  <div className="cms-inline-note"><Icon name="clock" size={20}/><p>The latest 50 published versions are kept. Preview a version, then restore it as a draft. Your live page changes only when you publish. History starts with the live content saved when this feature was added.</p></div>
  {resource.loading ? <Loading label="Loading version history…"/> : resource.error ? <ErrorState message={resource.error} retry={resource.reload}/> : <div className="cms-card cms-history-list">{resource.data?.revisions.map((revision,index)=><div key={revision.version} className="cms-history-row"><div><strong>{date(revision)}</strong><small>{revision.published_by ? `Published by ${revision.published_by}` : "Earlier publisher not recorded"}</small></div><div className="cms-actions">{index===0 && <Badge tone="green">Latest published</Badge>}<button type="button" className="cms-btn cms-btn-secondary cms-btn-small" disabled={busy||loading} aria-pressed={selected?.version===revision.version} onClick={()=>void preview(revision.version)}><Icon name="eye" size={16}/>Preview</button></div></div>)}</div>}
  {loading && <Loading label="Loading version preview…"/>}{error && <p role="alert">{error}</p>}
  {selected && <><div className="cms-history-heading"><div><h2>Version from {date(selected)}</h2><p>This is a saved version. Your current edits are unchanged.</p></div><button type="button" className="cms-btn cms-btn-secondary" disabled={busy||loading} onClick={()=>setConfirm(true)}><Icon name="back" size={16}/>Restore as draft</button></div><DraftPreview slug={record.slug} content={selected.content} active historical/></>}
  <Confirm open={confirm} title="Restore this version as a draft?" description={`This will replace the current saved draft${hasEdits ? " and your unsaved edits" : ""} for this page. The live page stays unchanged. You can review the restored draft before publishing.`} action="Restore as draft" busy={busy} onClose={()=>setConfirm(false)} onConfirm={()=>{setConfirm(false);void onRestore(selected!.version);}}/>
 </section>;
}
