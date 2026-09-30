import Image from "next/image";
import Link from "next/link";
import Testimonials from "./testimonials";
import Announcements from "./announcements";
import HomeMotion from "./home-motion";
import CardAnimation, { type CardAnimationName } from "./card-animation";
import {
  FAQList,
  LocationsMap,
  PanoramaViewer,
  SiteFooter,
  SiteHeader,
} from "./components";
import { homeAnnouncements, homeFaqs, locations, principles } from "../lib/content";
import {
  CONTENT_LAST_REVIEWED,
  getFaqSchema,
  getLocationSchema,
  getOrganizationSchema,
  getWebsiteSchema,
  jsonLd,
  SITE_URL,
} from "../lib/seo";

const principleAnimations: Record<string, CardAnimationName> = {
  "principle-sun": "bouncing",
  "principle-blue": "joy",
  "principle-lilac": "shapes",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    getOrganizationSchema(locations),
    getWebsiteSchema(),
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/angel#webpage`,
      url: `${SITE_URL}/angel`,
      name: "Beckett House Montessori | Nursery in Angel & Abbey Road",
      description:
        "A warm, family-run Montessori nursery for children from 3 months to 5 years, with settings in Angel, Islington and Abbey Road, St John's Wood.",
      inLanguage: "en-GB",
      dateModified: CONTENT_LAST_REVIEWED,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organisation` },
      mainEntity: { "@id": `${SITE_URL}/#organisation` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/hero-classroom.webp`,
        width: 1800,
        height: 1199,
      },
    },
    ...locations.map(getLocationSchema),
    getFaqSchema(homeFaqs, `${SITE_URL}/angel#answers`),
  ],
};

export default function Home() {
  return (
    <>
      <SiteHeader homepageOnly />
      <main className="home-page">
        <HomeMotion />
        <section
          className="wide-photo-break homepage-photo-hero"
          aria-labelledby="home-hero-title"
        >
          <Image
            src="/images/hero-classroom.webp"
            unoptimized
            alt="A wide view across a prepared Beckett House Montessori classroom"
            width={1800}
            height={1199}
            sizes="100vw"
            priority
          />
          <div className="wide-photo-caption">
            <span>Welcome to Beckett House Montessori</span>
            <h1 id="home-hero-title">
              Calm spaces. Beautiful materials. Everything within reach.
            </h1>
            <p className="photo-hero-lede">
              A home from home where your children learn, in Angel and Abbey Road.
            </p>
            <div className="photo-hero-actions">
              <Link className="button button-light" href="#">
                Book a visit
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={homeAnnouncements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2>Happy, confident and enjoying every moment.</h2>
            <div className="manifesto-copy">
            <p>
              Language, numbers and social development matter. More than
              anything, we want children to feel happy and confident, with the
              freedom to discover and do things for themselves.
            </p>
            <Link className="text-link" href="#">
              How Montessori works
            </Link>
            </div>
          </div>
          <Image
            className="manifesto-photo"
            src="/images/children-circle-time.jpg"
            alt="Children sitting together on the classroom floor and raising their hands during a group activity"
            width={900}
            height={590}
            loading="lazy"
            unoptimized
          />
        </section>

        <section className="principles section-pad" aria-label="Our principles">
          {principles.map((principle) => (
            <article className={`principle-card ${principle.className}`} key={principle.title}>
              <CardAnimation name={principleAnimations[principle.className]} />
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </section>

        <section className="room-explorer section-pad" id="virtual-tour">
          <div className="explorer-copy">
            <p className="eyebrow">Step inside</p>
            <h2>See the room at their level, before you visit.</h2>
            <p>
              Our classrooms are calm, safe and carefully prepared with genuine
              Montessori materials, beautiful, mainly wooden and made for
              hands-on independent learning.
            </p>
            <div className="explorer-note">
              <span aria-hidden="true">◎</span>
              <p>
                <strong>Interactive room explorer</strong>
                Drag the view, then book a real walkthrough with the team.
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
          <div className="nursery-life-intro">
            <h2>A familiar rhythm, with something new to discover.</h2>
          </div>
          <div className="nursery-life-grid">
            <article className="life-photo-card">
              <Image
                src="/images/calm-corner.webp"
                unoptimized
                alt="A calm, welcoming nursery corner"
                width={1400}
                height={934}
                sizes="(min-width: 700px) 33vw, 100vw"
              />
              <h3>Calm spaces to concentrate</h3>
              <p>
                Children choose purposeful Montessori activities, repeat them
                at their own pace and learn to return each material with care.
              </p>
            </article>
            <article className="life-photo-card">
              <Image
                src="/images/classroom-detail.webp"
                unoptimized
                alt="Low shelves and child-sized furniture in a Montessori classroom"
                width={1400}
                height={1050}
                sizes="(min-width: 700px) 33vw, 100vw"
              />
              <h3>Learning through movement</h3>
              <p>
                Music, dance, drama, yoga and sport sit alongside outdoor time
                and neighbourhood visits to local parks and garden squares.
              </p>
            </article>
            <article className="life-photo-card">
              <Image
                src="/images/sensory-room.webp"
                unoptimized
                alt="Montessori resources arranged for preschool discovery"
                width={1400}
                height={934}
                sizes="(min-width: 700px) 33vw, 100vw"
              />
              <h3>Families stay involved</h3>
              <p>
                Key workers know their children well, share observations and
                keep conversations with parents part of the everyday routine.
              </p>
            </article>
          </div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2>Where to find us</h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section className="home-highlights section-pad" aria-label="Why families choose Beckett House">
          <div className="home-highlights-intro">
            <p>
              A close-knit, family-run nursery where children are known as
              individuals and parents remain part of the everyday conversation.
            </p>
            <Link className="text-link" href="#">
              Discover our approach
            </Link>
          </div>
          <div className="home-highlight-cards">
            <article>
              <span className="highlight-shape highlight-ring" aria-hidden="true" />
              <h3>Family-run since 1996</h3>
              <p>Second-generation care with the same home-from-home feeling.</p>
            </article>
            <article>
              <span className="highlight-shape highlight-circle" aria-hidden="true" />
              <h3>Montessori accredited</h3>
              <p>Genuine materials, trained teachers and purposeful independence.</p>
            </article>
            <article>
              <span className="highlight-shape highlight-bars" aria-hidden="true"><i /><i /><i /></span>
              <h3>Funded places available</h3>
              <p>Eligible families can access 15 or 30 funded hours.</p>
            </article>
          </div>
        </section>

        <Testimonials />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2>Have a question?</h2>
            <Link className="text-link answers-contact-link" href="#">
              Get in contact
            </Link>
          </div>
          <FAQList items={homeFaqs} />
        </section>
      </main>
      <SiteFooter homepageOnly />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
    </>
  );
}
