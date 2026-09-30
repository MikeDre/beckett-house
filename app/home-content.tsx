import Image from "next/image";
import Link from "next/link";
import Testimonials from "./testimonials";
import Announcements from "./announcements";
import HomeMotion from "./home-motion";
import HeroSlideshow, { type HeroSlide } from "./hero-slideshow";
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
  "principle-sun": "rings",
  "principle-blue": "tower",
  "principle-lilac": "shapes",
};

const heroSlides: HeroSlide[] = [
  { src: "/images/angel/montessori-nursery-angel-classroom-islington.webp", alt: "A wide view across the Beckett House Montessori classroom in Angel", width: 2000, height: 1332 },
  { src: "/images/angel/montessori-nursery-angel-classroom-planets.webp", alt: "The Angel classroom with hanging planets, cardboard rockets and child-sized tables", width: 2000, height: 1333 },
  { src: "/images/angel/montessori-nursery-angel-classroom-reading-area.webp", alt: "A sofa, rugs and bookshelves in the Angel reading area", width: 2000, height: 1333 },
  { src: "/images/angel/montessori-nursery-angel-reading-loft.webp", alt: "A wooden reading loft with cushions in the Angel classroom", width: 2000, height: 1333 },
]

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
        url: `${SITE_URL}/images/angel/montessori-nursery-angel-classroom-islington.webp`,
        width: 2000,
        height: 1332,
      },
    },
    ...locations.map(getLocationSchema),
    getFaqSchema(homeFaqs, `${SITE_URL}/angel#answers`),
  ],
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="home-page">
        <HomeMotion />
        <section
          className="wide-photo-break homepage-photo-hero"
          aria-labelledby="home-hero-title"
        >
          <HeroSlideshow slides={heroSlides} />
          <div className="wide-photo-caption">
            <span>Welcome to Beckett House Montessori</span>
            <h1 id="home-hero-title">
              Calm spaces. Beautiful materials. Everything within reach.
            </h1>
            <p className="photo-hero-lede">
              A home from home where your children learn, in Angel and Abbey Road.
            </p>
            <div className="photo-hero-actions">
              <Link className="button button-light" href="/visit?location=angel">
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
            <Link className="text-link" href="/montessori">
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
                src="/images/angel/montessori-nursery-angel-cosy-book-corner.webp"
                unoptimized
                alt="A cosy book corner with a sofa, rugs and bookshelves"
                width={2000}
                height={1333}
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
                src="/images/angel/montessori-nursery-angel-music-and-interactive-screen.webp"
                unoptimized
                alt="A keyboard, puzzles and an interactive screen beside colourful rugs"
                width={2000}
                height={1333}
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
                src="/images/angel/montessori-nursery-angel-earth-day-artwork.webp"
                unoptimized
                alt="Children’s Earth Day artwork with handprints and magnetic shapes"
                width={2000}
                height={1333}
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
            <Link className="text-link" href="/beckett-house">
              Discover our approach
            </Link>
          </div>
          <div className="home-highlight-cards">
            <article>
              <CardAnimation name="family" />
              <h3>Family-run since 1996</h3>
              <p>Second-generation care with the same home-from-home feeling.</p>
            </article>
            <article>
              <CardAnimation name="badge" />
              <h3>Montessori accredited</h3>
              <p>Genuine materials, trained teachers and purposeful independence.</p>
            </article>
            <article>
              <CardAnimation name="coins" />
              <h3>Funded places available</h3>
              <p>Eligible families can access 15 or 30 funded hours.</p>
            </article>
          </div>
        </section>

        <Testimonials />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2>Have a question?</h2>
            <a className="text-link answers-contact-link" href="mailto:info@beckett-house.co.uk">
              Get in contact
            </a>
          </div>
          <FAQList items={homeFaqs} />
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
    </>
  );
}
