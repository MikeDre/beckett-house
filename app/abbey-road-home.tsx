import Image from "next/image";
import Link from "next/link";
import Announcements from "./announcements";
import Testimonials from "./testimonials";
import HomeMotion from "./home-motion";
import {
  FAQList,
  LocationsMap,
  PanoramaViewer,
  SiteFooter,
  SiteHeader,
} from "./components";
import {
  getLocation,
  getLocationFaqs,
  homeAnnouncements,
  locations,
} from "../lib/content";
import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  getFaqSchema,
  getLocationSchema,
  jsonLd,
  locationId,
  locationUrl,
  SITE_URL,
} from "../lib/seo";

function requireAbbeyRoadLocation() {
  const location = getLocation("abbey-road");
  if (!location) {
    throw new Error("Abbey Road location content is missing");
  }
  return location;
}

const abbeyRoadLocation = requireAbbeyRoadLocation();
const abbeyRoadFaqs = getLocationFaqs(abbeyRoadLocation);
const abbeyRoadUrl = locationUrl(abbeyRoadLocation);
const roomCardClasses = ["principle-sun", "principle-blue", "principle-lilac"];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    getLocationSchema(abbeyRoadLocation),
    {
      "@type": "WebPage",
      "@id": `${abbeyRoadUrl}#webpage`,
      url: abbeyRoadUrl,
      name: `Beckett House Montessori ${abbeyRoadLocation.name}`,
      description: abbeyRoadLocation.ageDetail,
      inLanguage: "en-GB",
      dateModified: CONTENT_LAST_REVIEWED,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": locationId(abbeyRoadLocation) },
      mainEntity: { "@id": locationId(abbeyRoadLocation) },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/abbey-road/main-room-hero.webp`,
        width: 2560,
        height: 1707,
      },
    },
    getBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Nursery locations", url: `${SITE_URL}/find-your-nursery` },
      { name: abbeyRoadLocation.name, url: abbeyRoadUrl },
    ]),
    getFaqSchema(abbeyRoadFaqs, `${abbeyRoadUrl}#answers`),
  ],
};

export default function AbbeyRoadHome() {
  return (
    <>
      <SiteHeader />
      <main className="home-page abbey-road-home">
        <HomeMotion />
        <section
          className="wide-photo-break homepage-photo-hero"
          aria-labelledby="abbey-road-hero-title"
        >
          <Image
            src="/images/abbey-road/main-room-hero.webp"
            unoptimized
            alt={abbeyRoadLocation.imageAlt}
            width={2560}
            height={1707}
            sizes="100vw"
            priority
          />
          <div className="wide-photo-caption">
            <span>Welcome to our new setting on Abbey Road</span>
            <h1 id="abbey-road-hero-title">
              A new home from home where your children learn.
            </h1>
            <div className="photo-hero-actions">
              <Link
                className="button button-light"
                href="/visit?location=abbey-road"
              >
                Book a visit
              </Link>
            </div>
          </div>
        </section>

        <Announcements items={homeAnnouncements} />

        <section className="manifesto section-pad" id="approach">
          <div className="manifesto-heading">
            <h2>Not so much a school… More a home-from-home where your children learn.</h2>
            <div className="manifesto-copy">
              <p>
                We believe education is important. We believe language, the
                command of numbers and social behaviour are important. But more
                than anything, we believe your children should be happy and
                confident and enjoy every moment of their time at nursery school.
              </p>
              <Link className="text-link" href="/montessori">
                Montessori education
              </Link>
            </div>
          </div>
          <Image
            className="manifesto-photo"
            src="/images/abbey-road/main-room-3.webp"
            alt="The Abbey Road main room, with a sofa, activity tables and low Montessori shelves"
            width={1600}
            height={1067}
            loading="lazy"
            unoptimized
          />
        </section>

        {abbeyRoadLocation.roomStages && (
          <section className="principles section-pad" aria-label="Rooms at Abbey Road">
            {abbeyRoadLocation.roomStages.map((stage, index) => (
              <article
                className={`principle-card ${roomCardClasses[index]}`}
                key={stage.name}
              >
                <span>{stage.age}</span>
                <div className="principle-shape" aria-hidden="true" />
                <h3>{stage.name}</h3>
                <p>{stage.copy}</p>
              </article>
            ))}
          </section>
        )}

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
          <PanoramaViewer location={abbeyRoadLocation} />
        </section>

        <section
          className="nursery-life section-pad"
          id="nursery-life"
          aria-label="Life at Abbey Road"
        >
          <div className="nursery-life-intro">
            <h2>A sound introduction to education.</h2>
          </div>
          <div className="nursery-life-grid">
            {abbeyRoadLocation.carePillars.map((pillar, index) => (
              <article className="life-photo-card" key={pillar.title}>
                <Image
                  src={[
                    "/images/abbey-road/nursery-room.webp",
                    "/images/abbey-road/montessori-puzzle.webp",
                    "/images/abbey-road/kitchen.webp",
                  ][index]}
                  unoptimized
                  alt=""
                  width={1600}
                  height={1067}
                  sizes="(min-width: 700px) 33vw, 100vw"
                />
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="locations section-pad" id="locations">
          <div className="section-heading">
            <h2>Where to find us</h2>
          </div>
          <LocationsMap locations={locations} />
        </section>

        <section
          className="home-highlights section-pad"
          aria-label="Abbey Road nursery highlights"
        >
          <div className="home-highlights-intro">
            <p>{abbeyRoadLocation.welcome[2]}</p>
            <p>{abbeyRoadLocation.history}</p>
          </div>
          <div className="home-highlight-cards">
            <article>
              <span className="highlight-shape highlight-ring" aria-hidden="true" />
              <h3>Montessori accredited</h3>
              <p>The head teacher and the core members of staff are Montessori qualified.</p>
            </article>
            <article>
              <span className="highlight-shape highlight-circle" aria-hidden="true" />
              <h3>Open 50 weeks a year</h3>
              <p>{abbeyRoadLocation.opening}</p>
            </article>
            <article>
              <span className="highlight-shape highlight-bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <h3>15 or 30 funded hours</h3>
              <p>{abbeyRoadLocation.sessionDetail}</p>
            </article>
          </div>
        </section>

        <Testimonials
          testimonials={[
            {
              quote: "Without hesitating I would recommend this nursery. The staff are fantastic, and the fact it's family run also gives you a warm, caring feeling. The children all seem really happy when you drop off and pick up.",
              author: "Georgina H · daynurseries.co.uk",
            },
          ]}
        />

        <section className="answers section-pad" id="answers">
          <div className="answers-heading">
            <h2>Have a question?</h2>
            <a
              className="text-link answers-contact-link"
              href={`mailto:${abbeyRoadLocation.email}`}
            >
              Get in contact
            </a>
            <a
              className="text-link answers-contact-link"
              href={`tel:${abbeyRoadLocation.phoneHref}`}
            >
              {abbeyRoadLocation.phone}
            </a>
          </div>
          <FAQList items={abbeyRoadFaqs} />
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
