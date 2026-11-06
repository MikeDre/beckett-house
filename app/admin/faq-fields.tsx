"use client";

import { useState } from "react";
import type { FaqContent, FaqTopic } from "../../lib/faq-content";
import { Confirm, EditorSection, Field } from "./ui";

function moved<T>(items: T[], index: number, direction: number) {
  const next = [...items];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  return next;
}
export default function FaqFields({ content, onChange }: { content: FaqContent; onChange: (content: FaqContent) => void }) {
  const [removing, setRemoving] = useState<{ topic: string; question?: string; label: string } | null>(null);
  function groups(next: FaqTopic[]) { onChange({ ...content, groups: next }); }
  function topic(id: string, update: Partial<FaqTopic>) { groups(content.groups.map(group => group.id === id ? { ...group, ...update } : group)); }
  function remove() {
    if (!removing) return;
    if (removing.question) {
      const group = content.groups.find(group => group.id === removing.topic);
      if (group && group.items.length > 1) topic(group.id, { items: group.items.filter(item => item.id !== removing.question) });
    } else if (content.groups.length > 1) groups(content.groups.filter(group => group.id !== removing.topic));
    setRemoving(null);
  }
  return <>
    <EditorSection title="Welcome & introduction" description="Heading and introduction shown above the FAQ topics.">
      <Field label="Page heading" value={content.heading} maxLength={300} required onChange={heading => onChange({ ...content, heading })}/>
      <Field label="Introduction" value={content.introduction} maxLength={4000} multiline required onChange={introduction => onChange({ ...content, introduction })}/>
    </EditorSection>
    <div className="cms-section-toolbar"><p className="cms-muted cms-small">{content.groups.length} topics · expand a topic to edit its questions.</p><button type="button" className="cms-btn cms-btn-primary" disabled={content.groups.length >= 20 || content.groups.reduce((sum, group) => sum + group.items.length, 0) >= 200} onClick={() => groups([...content.groups, { id: `topic-${crypto.randomUUID()}`, heading: "New topic", items: [{ id: `question-${crypto.randomUUID()}`, question: "", answer: "" }] }])}>Add topic</button></div>
    {content.groups.map((group, index) => <EditorSection key={group.id} title={group.heading || "Untitled topic"} description={`${group.items.length} question${group.items.length === 1 ? "" : "s"}`}>
      <div className="cms-actions">
        <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" aria-label={`Move topic ${group.heading} up`} disabled={index === 0} onClick={() => groups(moved(content.groups, index, -1))}>Move up</button>
        <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" aria-label={`Move topic ${group.heading} down`} disabled={index === content.groups.length - 1} onClick={() => groups(moved(content.groups, index, 1))}>Move down</button>
        <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" disabled={content.groups.length === 1} onClick={() => setRemoving({ topic: group.id, label: group.heading })}>Remove topic</button>
      </div>
      <Field label="Topic heading" value={group.heading} maxLength={200} required onChange={heading => topic(group.id, { heading })}/>
      {group.items.map((item, questionIndex) => <section className="cms-card cms-editor-card" key={item.id} aria-label={`Question ${questionIndex + 1} in ${group.heading}`}>
        <div className="cms-title-between"><h3>Question {questionIndex + 1}</h3><div className="cms-actions">
          <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" aria-label={`Move question ${questionIndex + 1} up in ${group.heading}`} disabled={questionIndex === 0} onClick={() => topic(group.id, { items: moved(group.items, questionIndex, -1) })}>Move up</button>
          <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" aria-label={`Move question ${questionIndex + 1} down in ${group.heading}`} disabled={questionIndex === group.items.length - 1} onClick={() => topic(group.id, { items: moved(group.items, questionIndex, 1) })}>Move down</button>
          <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" disabled={group.items.length === 1} onClick={() => setRemoving({ topic: group.id, question: item.id, label: item.question || "this question" })}>Remove question</button>
        </div></div>
        <Field label="Question" value={item.question} maxLength={500} required onChange={question => topic(group.id, { items: group.items.map(entry => entry.id === item.id ? { ...entry, question } : entry) })}/>
        <Field label="Answer" value={item.answer} maxLength={4000} multiline required onChange={answer => topic(group.id, { items: group.items.map(entry => entry.id === item.id ? { ...entry, answer } : entry) })}/>
      </section>)}
      <button type="button" className="cms-btn cms-btn-secondary" disabled={group.items.length >= 30 || content.groups.reduce((sum, entry) => sum + entry.items.length, 0) >= 200} onClick={() => topic(group.id, { items: [...group.items, { id: `question-${crypto.randomUUID()}`, question: "", answer: "" }] })}>Add question</button>
    </EditorSection>)}
    <Confirm open={Boolean(removing)} title={removing?.question ? "Remove this question?" : "Remove this topic?"} description={`${removing?.label || "This item"} will be removed from your current edits${removing?.question ? "." : ", together with its questions."} The live page changes only after publishing.`} action="Remove" onClose={() => setRemoving(null)} onConfirm={remove}/>
  </>;
}
