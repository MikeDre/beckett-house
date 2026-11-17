import {locations as defaultLocations,type Location} from "../lib/content";

import {CmsField, CmsImage} from "./cms-content";
import Link from "next/link";
import Testimonials from "./testimonials";
import Announcements from "./announcements";
import HomeMotion from "./home-motion";
import HeroSlideshow from "./hero-slideshow";
import CardAnimation, { type CardAnimationName } from "./card-animation";
import {
  FAQList,
  LocationsMap,
  PanoramaViewer,
  SiteFooter,
  SiteHeader,
} from "./components";

import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  locationId,
  getFaqSchema,
  getLocationSchema,
  getOrganizationSchema,
  getWebsiteSchema,
  jsonLd,
  SITE_URL,
} from "../lib/seo";

import type { Announcement } from "../lib/content";
import { defaultNurseryPages, type NurseryPageContent, type NurseryPageSlug } from "../lib/nursery-pages";
const roomCardClasses = ["principle-sun", "principle-blue", "principle-lilac"];
const angelAnimations:CardAnimationName[] = ["rings", "tower", "shapes"];
const roomCardAnimations:CardAnimationName[] = ["bouncing", "joy", "morph"];
const angelHighlights:CardAnimationName[] = ["family", "badge", "coins"];
const abbeyHighlights:CardAnimationName[] = ["medal", "sun", "hours"];
export default function NurseryHomeView({slug,content,announcements,previewOnly=false,locations=defaultLocations}:{slug:NurseryPageSlug;content:NurseryPageContent;announcements:Announcement[];previewOnly?:boolean;locations?:Location[]}) {
 const abbeyRoadLocation = locations.find(l => l.slug === "abbey-road")!;
 const location = locations.find(l => l.slug === slug)!;
 const url = `${SITE_URL}/${slug}`;
 const image = content.hero.slides?.[0] ?? defaultNurseryPages[slug].hero.slides[0];
 const subject = slug === "angel" ? `${SITE_URL}/#organisation` : locationId(location);
 const structuredData = {"@context":"https://schema.org", "@graph":[
 ...(slug === "angel" ? [getOrganizationSchema(locations),getWebsiteSchema()] : []),
 {"@type":"WebPage","@id":`${url}#webpage`,url,name:content.seoTitle,description:content.seoDescription,inLanguage:"en-GB",dateModified:CONTENT_LAST_REVIEWED,isPartOf:{"@id":`${SITE_URL}/#website`},about:{"@id":subject},mainEntity:{"@id":subject},primaryImageOfPage:{"@type":"ImageObject",url:new URL(image.src,SITE_URL).href,width:image.width,height:image.height}},
 ...(slug === "angel" ? locations : [location]).map(getLocationSchema),
 ...(slug === "abbey-road" ? [getBreadcrumbSchema([{name:"Home",url:`${SITE_URL}/`},{name:"Nursery locations",url:`${SITE_URL}/find-your-nursery`},{name:location.name,url}])] : []),
 getFaqSchema(content.faqs.items,`${url}#answers`)
 ]};
  if (slug === "angel") return (
    <>
      <SiteHeader previewNursery={previewOnly ? slug : undefined} />
      <main className="home-page">
        {!previewOnly && <HomeMotion />}
        <section
          className="wide-photo-break homepage-photo-hero"
          aria-labelledby="home-hero-title"
        >
          <HeroSlideshow cmsPage={slug} slides={content.hero.slides} />
          <div className="wide-photo-caption">
            <h1 id="home-hero-title"><span><CmsField page={slug} field="hero.eyebrow">{content.hero.eyebrow}</CmsField></span>{" "}<CmsField page={slug} field="hero.heading">{content.hero.heading}</CmsField></h1>
            {content.hero.introduction && <p className="photo-hero-lede"><CmsField page={slug} field="hero.introduction">{content.hero.introduction}</CmsField></p>}
            <div className="photo-hero-actions">
              <Link className="button button-light" href="/visit?location=angel">
                <CmsField page={slug} field="hero.buttonLabel">{content.hero.buttonLabel}</CmsField>
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={announcements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2><CmsField page={slug} field="approach.heading">{content.approach.heading}</CmsField></h2>
            <div className="manifesto-copy">
            <p><CmsField page={slug} field="approach.body">{content.approach.body}</CmsField></p>
            <Link className="text-link" href="/montessori"><CmsField page={slug} field="approach.linkLabel">{content.approach.linkLabel}</CmsField></Link>
            </div>
          </div>
          <CmsImage page={slug} field={((""+".approach"+".image")).replace(/^\./, '')}
            className="manifesto-photo"
            {...content.approach.image} alt={content.approach.image.alt}
            loading="lazy"
          />
        </section>

        <section className="principles section-pad" aria-label={slug === "angel" ? "Our principles" : "Rooms at Abbey Road"}>
          {content.principles.map((p,index) => <article className={`principle-card ${roomCardClasses[index]}`} key={index}>
            {p.label && <span><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".label").replace(/^\./, '')}>{p.label}</CmsField></span>}
            <CardAnimation name={(slug === "angel" ? angelAnimations : roomCardAnimations)[index]} />
            <h3><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".title").replace(/^\./, '')}>{p.title}</CmsField></h3><p><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".body").replace(/^\./, '')}>{p.body}</CmsField></p>
          </article>)}
        </section>

        <section className="room-explorer section-pad" id="virtual-tour">
          <div className="explorer-copy">
            <p className="eyebrow"><CmsField page={slug} field="explorer.eyebrow">{content.explorer.eyebrow}</CmsField></p>
            <h2><CmsField page={slug} field="explorer.heading">{content.explorer.heading}</CmsField></h2>
            <p><CmsField page={slug} field="explorer.body">{content.explorer.body}</CmsField></p>
            <div className="explorer-note">
              <span aria-hidden="true">◎</span>
              <p>
                <strong><CmsField page={slug} field="explorer.noteTitle">{content.explorer.noteTitle}</CmsField></strong>
                <CmsField page={slug} field="explorer.noteBody">{content.explorer.noteBody}</CmsField>
              </p>
            </div>
          </div>
          <PanoramaViewer location={locations[0]} />
        </section>

        <section
          className="nursery-life section-pad"
          id="nursery-life"
          aria-label="Life at Beckett House"
        >
          <div className="nursery-life-intro"><h2><CmsField page={slug} field="life.heading">{content.life.heading}</CmsField></h2></div>
          <div className="nursery-life-grid">{content.life.cards.map((card,index) => <article className="life-photo-card" key={index}>
            <CmsImage page={slug} field={((""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".image")).replace(/^\./, '')} {...card.image} alt={card.image.alt} sizes="(min-width: 700px) 33vw, 100vw" />
            <h3><CmsField page={slug} field={(""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".title").replace(/^\./, '')}>{card.title}</CmsField></h3><p><CmsField page={slug} field={(""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".body").replace(/^\./, '')}>{card.body}</CmsField></p>
          </article>)}</div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2><CmsField page={slug} field="locationsHeading">{content.locationsHeading}</CmsField></h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section className="home-highlights section-pad" aria-label="Why families choose Beckett House">
          <div className="home-highlights-intro">
            {content.highlights.paragraphs.map((p,index) => <p key={index}><CmsField page={slug} field={(""+".highlights"+".paragraphs"+"["+content.highlights.paragraphs.indexOf(p)+"]").replace(/^\./, '')}>{p}</CmsField></p>)}
            {content.highlights.linkLabel && <Link className="text-link" href="/beckett-house"><CmsField page={slug} field="highlights.linkLabel">{content.highlights.linkLabel}</CmsField></Link>}
          </div>
          <div className="home-highlight-cards">{content.highlights.cards.map((card,index) => <article key={index}>
            <CardAnimation name={(slug === "angel" ? angelHighlights : abbeyHighlights)[index]} />
            <h3><CmsField page={slug} field={(""+".highlights"+".cards"+"["+content.highlights.cards.indexOf(card)+"]"+".title").replace(/^\./, '')}>{card.title}</CmsField></h3><p><CmsField page={slug} field={(""+".highlights"+".cards"+"["+content.highlights.cards.indexOf(card)+"]"+".body").replace(/^\./, '')}>{card.body}</CmsField></p>
          </article>)}</div>
        </section>

        <Testimonials cmsPage={slug} testimonials={content.testimonials} />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2><CmsField page={slug} field="faqs.heading">{content.faqs.heading}</CmsField></h2>
            <a className="text-link answers-contact-link" href="mailto:info@beckett-house.co.uk">
              <CmsField page={slug} field="faqs.contactLabel">{content.faqs.contactLabel}</CmsField>
            </a>
          </div>
          <FAQList cmsPage={slug} cmsField="faqs.items" items={content.faqs.items} />
        </section>
      </main>
      <SiteFooter />
      {!previewOnly && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />}
    </>
  );
  return (
    <>
      <SiteHeader previewNursery={previewOnly ? slug : undefined} />
      <main className="home-page abbey-road-home">
        {!previewOnly && <HomeMotion />}
        <section
          className="wide-photo-break homepage-photo-hero"
          aria-labelledby="abbey-road-hero-title"
        >
          <HeroSlideshow cmsPage={slug} slides={content.hero.slides} />
          <div className="wide-photo-caption">
            <h1 id="abbey-road-hero-title"><span><CmsField page={slug} field="hero.eyebrow">{content.hero.eyebrow}</CmsField></span>{" "}<CmsField page={slug} field="hero.heading">{content.hero.heading}</CmsField></h1>
            {content.hero.introduction && <p className="photo-hero-lede"><CmsField page={slug} field="hero.introduction">{content.hero.introduction}</CmsField></p>}
            <div className="photo-hero-actions">
              <Link
                className="button button-light"
                href="/visit?location=abbey-road"
              >
                <CmsField page={slug} field="hero.buttonLabel">{content.hero.buttonLabel}</CmsField>
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={announcements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2><CmsField page={slug} field="approach.heading">{content.approach.heading}</CmsField></h2>
            <div className="manifesto-copy">
              <p><CmsField page={slug} field="approach.body">{content.approach.body}</CmsField></p>
              <Link className="text-link" href="/montessori"><CmsField page={slug} field="approach.linkLabel">{content.approach.linkLabel}</CmsField></Link>
            </div>
          </div>
          <CmsImage page={slug} field={((""+".approach"+".image")).replace(/^\./, '')}
            className="manifesto-photo"
            {...content.approach.image} alt={content.approach.image.alt}
            loading="lazy"
          />
        </section>

        <section className="principles section-pad" aria-label={"Rooms at Abbey Road"}>
          {content.principles.map((p,index) => <article className={`principle-card ${roomCardClasses[index]}`} key={index}>
            {p.label && <span><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".label").replace(/^\./, '')}>{p.label}</CmsField></span>}
            <CardAnimation name={roomCardAnimations[index]} />
            <h3><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".title").replace(/^\./, '')}>{p.title}</CmsField></h3><p><CmsField page={slug} field={(""+".principles"+"["+content.principles.indexOf(p)+"]"+".body").replace(/^\./, '')}>{p.body}</CmsField></p>
          </article>)}
        </section>

        <section className="room-explorer section-pad" id="virtual-tour">
          <div className="explorer-copy">
            <p className="eyebrow"><CmsField page={slug} field="explorer.eyebrow">{content.explorer.eyebrow}</CmsField></p>
            <h2><CmsField page={slug} field="explorer.heading">{content.explorer.heading}</CmsField></h2>
            <p><CmsField page={slug} field="explorer.body">{content.explorer.body}</CmsField></p>
            <div className="explorer-note">
              <span aria-hidden="true">◎</span>
              <p>
                <strong><CmsField page={slug} field="explorer.noteTitle">{content.explorer.noteTitle}</CmsField></strong>
                <CmsField page={slug} field="explorer.noteBody">{content.explorer.noteBody}</CmsField>
              </p>
            </div>
          </div>
          <PanoramaViewer location={abbeyRoadLocation} />
        </section>

        <section
          className="nursery-life section-pad"
          id="nursery-life"
          aria-label="Life at Abbey Road"
        >
          <div className="nursery-life-intro"><h2><CmsField page={slug} field="life.heading">{content.life.heading}</CmsField></h2></div>
          <div className="nursery-life-grid">{content.life.cards.map((card,index) => <article className="life-photo-card" key={index}>
            <CmsImage page={slug} field={((""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".image")).replace(/^\./, '')} {...card.image} alt={card.image.alt} sizes="(min-width: 700px) 33vw, 100vw" />
            <h3><CmsField page={slug} field={(""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".title").replace(/^\./, '')}>{card.title}</CmsField></h3><p><CmsField page={slug} field={(""+".life"+".cards"+"["+content.life.cards.indexOf(card)+"]"+".body").replace(/^\./, '')}>{card.body}</CmsField></p>
          </article>)}</div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2><CmsField page={slug} field="locationsHeading">{content.locationsHeading}</CmsField></h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section
          className="home-highlights section-pad"
          aria-label="Abbey Road nursery highlights"
        >
          <div className="home-highlights-intro">
            {content.highlights.paragraphs.map((p,index) => <p key={index}><CmsField page={slug} field={(""+".highlights"+".paragraphs"+"["+content.highlights.paragraphs.indexOf(p)+"]").replace(/^\./, '')}>{p}</CmsField></p>)}
            {content.highlights.linkLabel && <Link className="text-link" href="/beckett-house"><CmsField page={slug} field="highlights.linkLabel">{content.highlights.linkLabel}</CmsField></Link>}
          </div>
          <div className="home-highlight-cards">{content.highlights.cards.map((card,index) => <article key={index}>
            <CardAnimation name={abbeyHighlights[index]} />
            <h3><CmsField page={slug} field={(""+".highlights"+".cards"+"["+content.highlights.cards.indexOf(card)+"]"+".title").replace(/^\./, '')}>{card.title}</CmsField></h3><p><CmsField page={slug} field={(""+".highlights"+".cards"+"["+content.highlights.cards.indexOf(card)+"]"+".body").replace(/^\./, '')}>{card.body}</CmsField></p>
          </article>)}</div>
        </section>

        <Testimonials cmsPage={slug} testimonials={content.testimonials} />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2><CmsField page={slug} field="faqs.heading">{content.faqs.heading}</CmsField></h2>
            <a
              className="text-link answers-contact-link"
              href={`mailto:${abbeyRoadLocation.email}`}
            >
              <CmsField page={slug} field="faqs.contactLabel">{content.faqs.contactLabel}</CmsField>
            </a>
            <a
              className="text-link answers-contact-link"
              href={`tel:${abbeyRoadLocation.phoneHref}`}
            >
              {abbeyRoadLocation.phone}
            </a>
          </div>
          <FAQList cmsPage={slug} cmsField="faqs.items" items={content.faqs.items} />
        </section>
      </main>
      <SiteFooter />
      {!previewOnly && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />}
    </>
  );
}
