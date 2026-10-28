"use client";

import type { NurseryPageContent, PageImage } from "../../lib/nursery-pages";
import { EditorSection, Field, Icon, ImagePicker } from "./ui";

function ImageField({ label, image, onChange }: { label: string; image: PageImage; onChange: (image: PageImage) => void }) {
  return <div className="cms-image-field"><h3>{label}</h3><ImagePicker src={image.src} alt={image.alt} onChoose={selected => onChange({ src: selected.src, alt: selected.alt, width: selected.width, height: selected.height })}/><Field label={`${label} description`} hint="Describe the scene for screen readers. Leave blank only when the image is decorative." value={image.alt} maxLength={500} onChange={alt => onChange({ ...image, alt })}/></div>;
}
function Remove({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return <button type="button" className="cms-text-btn" aria-label={label} disabled={disabled} onClick={onClick}><Icon name="trash" size={15}/>Remove</button>;
}
function Add({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return <button type="button" className="cms-btn cms-btn-secondary cms-btn-small" disabled={disabled} onClick={onClick}><Icon name="plus" size={15}/>{label}</button>;
}

export default function NurseryFields({ content: c, onChange }: { content: NurseryPageContent; onChange: (content: NurseryPageContent) => void }) {
  function update(patch: Partial<NurseryPageContent>) { onChange({ ...c, ...patch }); }
  return <>
    <EditorSection number="01" title="Hero & welcome" description="The first words and photographs families see when they arrive.">
      <Field label="Hero eyebrow" hint="The short location line above your main heading." value={c.hero.eyebrow} maxLength={300} required onChange={eyebrow => update({ hero: { ...c.hero, eyebrow } })}/>
      <Field label="Hero heading" value={c.hero.heading} maxLength={500} required onChange={heading => update({ hero: { ...c.hero, heading } })}/>
      <Field label="Hero introduction" hint="Optional supporting text below the heading." value={c.hero.introduction} maxLength={4000} multiline onChange={introduction => update({ hero: { ...c.hero, introduction } })}/>
      <Field label="Visit button label" value={c.hero.buttonLabel} maxLength={100} required onChange={buttonLabel => update({ hero: { ...c.hero, buttonLabel } })}/>
      <p className="cms-field-note">Use 1–8 photographs. The first photograph also represents this page in search and social previews.</p>
      {c.hero.slides.map((image, index) => <div className="cms-repeat-item" key={index}>
        <div className="cms-card-header"><h3>Photograph {index + 1}</h3><Remove label={`Remove hero photograph ${index + 1}`} disabled={c.hero.slides.length <= 1} onClick={() => update({ hero: { ...c.hero, slides: c.hero.slides.filter((_, i) => i !== index) } })}/></div>
        <ImageField label={`Hero photograph ${index + 1}`} image={image} onChange={value => update({ hero: { ...c.hero, slides: c.hero.slides.map((slide, i) => i === index ? value : slide) } })}/>
        <div className="cms-actions"><button type="button" className="cms-text-btn" disabled={index === 0} onClick={() => { const slides = [...c.hero.slides]; [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]]; update({ hero: { ...c.hero, slides } }); }}>Move earlier</button><button type="button" className="cms-text-btn" disabled={index === c.hero.slides.length - 1} onClick={() => { const slides = [...c.hero.slides]; [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]]; update({ hero: { ...c.hero, slides } }); }}>Move later</button></div>
      </div>)}
      <Add label="Add hero photograph" disabled={c.hero.slides.length >= 8} onClick={() => update({ hero: { ...c.hero, slides: [...c.hero.slides, { ...c.hero.slides[0] }] } })}/>
    </EditorSection>
    <EditorSection number="02" title="Our approach" description="Introduce the care and Montessori education behind your nursery.">
      <Field label="Approach heading" value={c.approach.heading} maxLength={500} required onChange={heading => update({ approach: { ...c.approach, heading } })}/>
      <Field label="Approach text" value={c.approach.body} maxLength={4000} multiline required onChange={body => update({ approach: { ...c.approach, body } })}/>
      <Field label="Montessori link label" value={c.approach.linkLabel} maxLength={100} required onChange={linkLabel => update({ approach: { ...c.approach, linkLabel } })}/>
      <ImageField label="Approach photograph" image={c.approach.image} onChange={image => update({ approach: { ...c.approach, image } })}/>
    </EditorSection>
    <EditorSection number="03" title="Principles & rooms" description="Three illustrated cards introducing your values or nursery rooms.">
      {c.principles.map((p, index) => <div className="cms-repeat-item" key={index}><h3>Card {index + 1}</h3><Field label={`Card ${index + 1} label`} hint="Optional age range or short label." value={p.label} maxLength={200} onChange={label => update({ principles: c.principles.map((item, i) => i === index ? { ...item, label } : item) })}/><Field label={`Card ${index + 1} title`} value={p.title} maxLength={300} required onChange={title => update({ principles: c.principles.map((item, i) => i === index ? { ...item, title } : item) })}/><Field label={`Card ${index + 1} text`} value={p.body} maxLength={4000} multiline required onChange={body => update({ principles: c.principles.map((item, i) => i === index ? { ...item, body } : item) })}/></div>)}
    </EditorSection>
    <EditorSection number="04" title="Room explorer" description="Invite families to explore the nursery before booking a visit.">
      <Field label="Explorer eyebrow" value={c.explorer.eyebrow} maxLength={300} required onChange={eyebrow => update({ explorer: { ...c.explorer, eyebrow } })}/>
      <Field label="Explorer heading" value={c.explorer.heading} maxLength={500} required onChange={heading => update({ explorer: { ...c.explorer, heading } })}/>
      <Field label="Explorer introduction" value={c.explorer.body} maxLength={4000} multiline required onChange={body => update({ explorer: { ...c.explorer, body } })}/>
      <Field label="Explorer note title" value={c.explorer.noteTitle} maxLength={300} required onChange={noteTitle => update({ explorer: { ...c.explorer, noteTitle } })}/>
      <Field label="Explorer note text" value={c.explorer.noteBody} maxLength={4000} multiline required onChange={noteBody => update({ explorer: { ...c.explorer, noteBody } })}/>
    </EditorSection>
    <EditorSection number="05" title="Nursery life" description="Three photographs and stories showing the rhythm of the nursery day.">
      <Field label="Nursery life heading" value={c.life.heading} maxLength={500} required onChange={heading => update({ life: { ...c.life, heading } })}/>
      {c.life.cards.map((card, index) => <div className="cms-repeat-item" key={index}><h3>Story {index + 1}</h3><ImageField label={`Story ${index + 1} photograph`} image={card.image} onChange={image => update({ life: { ...c.life, cards: c.life.cards.map((item, i) => i === index ? { ...item, image } : item) } })}/><Field label={`Story ${index + 1} title`} value={card.title} maxLength={300} required onChange={title => update({ life: { ...c.life, cards: c.life.cards.map((item, i) => i === index ? { ...item, title } : item) } })}/><Field label={`Story ${index + 1} text`} value={card.body} maxLength={4000} multiline required onChange={body => update({ life: { ...c.life, cards: c.life.cards.map((item, i) => i === index ? { ...item, body } : item) } })}/></div>)}
    </EditorSection>
    <EditorSection number="06" title="Locations" description="Introduce the map connecting families with both nurseries.">
      <Field label="Locations heading" value={c.locationsHeading} maxLength={500} required onChange={locationsHeading => update({ locationsHeading })}/>
      <p className="cms-field-note">The map uses shared nursery addresses and contact details.</p>
    </EditorSection>
    <EditorSection number="07" title="Why families choose us" description="Your introduction and three animated highlight cards.">
      {c.highlights.paragraphs.map((paragraph, index) => <div className="cms-repeat-item" key={index}><Field label={`Introduction paragraph ${index + 1}`} value={paragraph} maxLength={4000} multiline required onChange={value => update({ highlights: { ...c.highlights, paragraphs: c.highlights.paragraphs.map((item, i) => i === index ? value : item) } })}/><Remove label={`Remove introduction paragraph ${index + 1}`} disabled={c.highlights.paragraphs.length <= 1} onClick={() => update({ highlights: { ...c.highlights, paragraphs: c.highlights.paragraphs.filter((_, i) => i !== index) } })}/></div>)}
      <Add label="Add paragraph" disabled={c.highlights.paragraphs.length >= 6} onClick={() => update({ highlights: { ...c.highlights, paragraphs: [...c.highlights.paragraphs, ""] } })}/>
      <Field label="About us link label" hint="Leave blank to hide this link." value={c.highlights.linkLabel} maxLength={100} onChange={linkLabel => update({ highlights: { ...c.highlights, linkLabel } })}/>
      {c.highlights.cards.map((card, index) => <div className="cms-repeat-item" key={index}><h3>Highlight {index + 1}</h3><Field label={`Highlight ${index + 1} title`} value={card.title} maxLength={300} required onChange={title => update({ highlights: { ...c.highlights, cards: c.highlights.cards.map((item, i) => i === index ? { ...item, title } : item) } })}/><Field label={`Highlight ${index + 1} text`} value={card.body} maxLength={4000} multiline required onChange={body => update({ highlights: { ...c.highlights, cards: c.highlights.cards.map((item, i) => i === index ? { ...item, body } : item) } })}/></div>)}
    </EditorSection>
    <EditorSection number="08" title="Parent testimonials" description="Share 1–10 quotes from your nursery community.">
      {c.testimonials.map((item, index) => <div className="cms-repeat-item" key={index}><div className="cms-card-header"><h3>Testimonial {index + 1}</h3><Remove label={`Remove testimonial ${index + 1}`} disabled={c.testimonials.length <= 1} onClick={() => update({ testimonials: c.testimonials.filter((_, i) => i !== index) })}/></div><Field label={`Testimonial ${index + 1} quote`} value={item.quote} maxLength={4000} multiline required onChange={quote => update({ testimonials: c.testimonials.map((t, i) => i === index ? { ...t, quote } : t) })}/><Field label={`Testimonial ${index + 1} attribution`} hint="Optional name and source." value={item.author} maxLength={300} onChange={author => update({ testimonials: c.testimonials.map((t, i) => i === index ? { ...t, author } : t) })}/></div>)}
      <Add label="Add testimonial" disabled={c.testimonials.length >= 10} onClick={() => update({ testimonials: [...c.testimonials, { quote: "", author: "" }] })}/>
    </EditorSection>
    <EditorSection number="09" title="Questions & contact" description="Answer 1–20 common questions and invite families to get in touch.">
      <Field label="Questions heading" value={c.faqs.heading} maxLength={500} required onChange={heading => update({ faqs: { ...c.faqs, heading } })}/>
      <Field label="Contact link label" value={c.faqs.contactLabel} maxLength={100} required onChange={contactLabel => update({ faqs: { ...c.faqs, contactLabel } })}/>
      {c.faqs.items.map((item, index) => <div className="cms-repeat-item" key={index}><div className="cms-card-header"><h3>Question {index + 1}</h3><Remove label={`Remove question ${index + 1}`} disabled={c.faqs.items.length <= 1} onClick={() => update({ faqs: { ...c.faqs, items: c.faqs.items.filter((_, i) => i !== index) } })}/></div><Field label={`Question ${index + 1}`} value={item.question} maxLength={500} required onChange={question => update({ faqs: { ...c.faqs, items: c.faqs.items.map((q, i) => i === index ? { ...q, question } : q) } })}/><Field label={`Answer ${index + 1}`} value={item.answer} maxLength={4000} multiline required onChange={answer => update({ faqs: { ...c.faqs, items: c.faqs.items.map((q, i) => i === index ? { ...q, answer } : q) } })}/></div>)}
      <Add label="Add question" disabled={c.faqs.items.length >= 20} onClick={() => update({ faqs: { ...c.faqs, items: [...c.faqs.items, { question: "", answer: "" }] } })}/>
    </EditorSection>
  </>;
}
