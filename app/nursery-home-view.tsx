import Image from "next/image";
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
import { locations } from "../lib/content";
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
import type { NurseryPageContent, NurseryPageSlug } from "../lib/nursery-pages";
const roomCardClasses = ["principle-sun", "principle-blue", "principle-lilac"];
const angelAnimations:CardAnimationName[] = ["rings", "tower", "shapes"];
const roomCardAnimations:CardAnimationName[] = ["bouncing", "joy", "morph"];
const angelHighlights:CardAnimationName[] = ["family", "badge", "coins"];
const abbeyHighlights:CardAnimationName[] = ["medal", "sun", "hours"];
export default function NurseryHomeView({slug,content,announcements,previewOnly=false}:{slug:NurseryPageSlug;content:NurseryPageContent;announcements:Announcement[];previewOnly?:boolean}) {
 const abbeyRoadLocation = locations.find(l => l.slug === "abbey-road")!;
 const location = locations.find(l => l.slug === slug)!;
 const url = `${SITE_URL}/${slug}`;
 const image = content.hero.slides[0];
 const subject = slug === "angel" ? `${SITE_URL}/#organisation` : locationId(location);
 const structuredData = {"@context":"https://schema.org", "@graph":[
 ...(slug === "angel" ? [getOrganizationSchema(locations),getWebsiteSchema()] : []),
 {"@type":"WebPage","@id":`${url}#webpage`,url,name:content.seoTitle,description:content.seoDescription,inLanguage:"en-GB",dateModified:CONTENT_LAST_REVIEWED,isPartOf:{"@id":`${SITE_URL}/#website`},about:{"@id":subject},mainEntity:{"@id":subject},primaryImageOfPage:{"@type":"ImageObject",url:`${SITE_URL}${image.src}`,width:image.width,height:image.height}},
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
          <HeroSlideshow slides={content.hero.slides} />
          <div className="wide-photo-caption">
            <h1 id="home-hero-title"><span>{content.hero.eyebrow}</span>{" "}{content.hero.heading}</h1>
            {content.hero.introduction && <p className="photo-hero-lede">{content.hero.introduction}</p>}
            <div className="photo-hero-actions">
              <Link className="button button-light" href="/visit?location=angel">
                {content.hero.buttonLabel}
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={announcements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2>{content.approach.heading}</h2>
            <div className="manifesto-copy">
            <p>{content.approach.body}</p>
            <Link className="text-link" href="/montessori">{content.approach.linkLabel}</Link>
            </div>
          </div>
          <Image
            className="manifesto-photo"
            {...content.approach.image} alt={content.approach.image.alt}
            loading="lazy"
          />
        </section>

        <section className="principles section-pad" aria-label={slug === "angel" ? "Our principles" : "Rooms at Abbey Road"}>
          {content.principles.map((p,index) => <article className={`principle-card ${roomCardClasses[index]}`} key={index}>
            {p.label && <span>{p.label}</span>}
            <CardAnimation name={(slug === "angel" ? angelAnimations : roomCardAnimations)[index]} />
            <h3>{p.title}</h3><p>{p.body}</p>
          </article>)}
        </section>

        <section className="room-explorer section-pad" id="virtual-tour">
          <div className="explorer-copy">
            <p className="eyebrow">{content.explorer.eyebrow}</p>
            <h2>{content.explorer.heading}</h2>
            <p>{content.explorer.body}</p>
            <div className="explorer-note">
              <span aria-hidden="true">◎</span>
              <p>
                <strong>{content.explorer.noteTitle}</strong>
                {content.explorer.noteBody}
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
          <div className="nursery-life-intro"><h2>{content.life.heading}</h2></div>
          <div className="nursery-life-grid">{content.life.cards.map((card,index) => <article className="life-photo-card" key={index}>
            <Image {...card.image} alt={card.image.alt} sizes="(min-width: 700px) 33vw, 100vw" />
            <h3>{card.title}</h3><p>{card.body}</p>
          </article>)}</div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2>{content.locationsHeading}</h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section className="home-highlights section-pad" aria-label="Why families choose Beckett House">
          <div className="home-highlights-intro">
            {content.highlights.paragraphs.map((p,index) => <p key={index}>{p}</p>)}
            {content.highlights.linkLabel && <Link className="text-link" href="/beckett-house">{content.highlights.linkLabel}</Link>}
          </div>
          <div className="home-highlight-cards">{content.highlights.cards.map((card,index) => <article key={index}>
            <CardAnimation name={(slug === "angel" ? angelHighlights : abbeyHighlights)[index]} />
            <h3>{card.title}</h3><p>{card.body}</p>
          </article>)}</div>
        </section>

        <Testimonials testimonials={content.testimonials} />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2>{content.faqs.heading}</h2>
            <a className="text-link answers-contact-link" href="mailto:info@beckett-house.co.uk">
              {content.faqs.contactLabel}
            </a>
          </div>
          <FAQList items={content.faqs.items} />
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
          <HeroSlideshow slides={content.hero.slides} />
          <div className="wide-photo-caption">
            <h1 id="abbey-road-hero-title"><span>{content.hero.eyebrow}</span>{" "}{content.hero.heading}</h1>
            {content.hero.introduction && <p className="photo-hero-lede">{content.hero.introduction}</p>}
            <div className="photo-hero-actions">
              <Link
                className="button button-light"
                href="/visit?location=abbey-road"
              >
                {content.hero.buttonLabel}
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={announcements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2>{content.approach.heading}</h2>
            <div className="manifesto-copy">
              <p>{content.approach.body}</p>
              <Link className="text-link" href="/montessori">{content.approach.linkLabel}</Link>
            </div>
          </div>
          <Image
            className="manifesto-photo"
            {...content.approach.image} alt={content.approach.image.alt}
            loading="lazy"
          />
        </section>

        <section className="principles section-pad" aria-label={"Rooms at Abbey Road"}>
          {content.principles.map((p,index) => <article className={`principle-card ${roomCardClasses[index]}`} key={index}>
            {p.label && <span>{p.label}</span>}
            <CardAnimation name={roomCardAnimations[index]} />
            <h3>{p.title}</h3><p>{p.body}</p>
          </article>)}
        </section>

        <section className="room-explorer section-pad" id="virtual-tour">
          <div className="explorer-copy">
            <p className="eyebrow">{content.explorer.eyebrow}</p>
            <h2>{content.explorer.heading}</h2>
            <p>{content.explorer.body}</p>
            <div className="explorer-note">
              <span aria-hidden="true">◎</span>
              <p>
                <strong>{content.explorer.noteTitle}</strong>
                {content.explorer.noteBody}
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
          <div className="nursery-life-intro"><h2>{content.life.heading}</h2></div>
          <div className="nursery-life-grid">{content.life.cards.map((card,index) => <article className="life-photo-card" key={index}>
            <Image {...card.image} alt={card.image.alt} sizes="(min-width: 700px) 33vw, 100vw" />
            <h3>{card.title}</h3><p>{card.body}</p>
          </article>)}</div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2>{content.locationsHeading}</h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section
          className="home-highlights section-pad"
          aria-label="Abbey Road nursery highlights"
        >
          <div className="home-highlights-intro">
            {content.highlights.paragraphs.map((p,index) => <p key={index}>{p}</p>)}
            {content.highlights.linkLabel && <Link className="text-link" href="/beckett-house">{content.highlights.linkLabel}</Link>}
          </div>
          <div className="home-highlight-cards">{content.highlights.cards.map((card,index) => <article key={index}>
            <CardAnimation name={abbeyHighlights[index]} />
            <h3>{card.title}</h3><p>{card.body}</p>
          </article>)}</div>
        </section>

        <Testimonials testimonials={content.testimonials} />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2>{content.faqs.heading}</h2>
            <a
              className="text-link answers-contact-link"
              href={`mailto:${abbeyRoadLocation.email}`}
            >
              {content.faqs.contactLabel}
            </a>
            <a
              className="text-link answers-contact-link"
              href={`tel:${abbeyRoadLocation.phoneHref}`}
            >
              {abbeyRoadLocation.phone}
            </a>
          </div>
          <FAQList items={content.faqs.items} />
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
