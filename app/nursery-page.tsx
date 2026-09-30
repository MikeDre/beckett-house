import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FAQList,
  LocationTimeline,
  PanoramaViewer,
  SiteFooter,
  SiteHeader,
} from "./components";
import { getLocation, getLocationFaqs, locations } from "../lib/content";
import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  getFaqSchema,
  getLocationSchema,
  jsonLd,
  locationId,
  locationUrl,
  SITE_URL, DEFAULT_OPEN_GRAPH } from "../lib/seo";

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  const title =
    location.slug === "angel"
      ? "Montessori Nursery in Angel, Islington"
      : "Montessori Nursery on Abbey Road, St John's Wood";
  const description = `Beckett House ${location.name} is a family-run Montessori nursery for ${location.ages}, open Monday to Friday, 8am–6pm. Explore the rooms and book a visit.`;
  return {
    title,
    description,
    alternates: { canonical: `/${location.slug}` },
    openGraph: { ...DEFAULT_OPEN_GRAPH,
      title: `${title} | Beckett House`,
      description,
      url: `/${location.slug}`,
      locale: "en_GB",
      type: "website",
      images: [location.image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Beckett House`,
      description,
      images: [location.image],
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  const locationFaqs = getLocationFaqs(location);
  const url = locationUrl(location);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      getLocationSchema(location),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `Beckett House Montessori ${location.name}`,
        description: location.ageDetail,
        inLanguage: "en-GB",
        dateModified: CONTENT_LAST_REVIEWED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": locationId(location) },
        mainEntity: { "@id": locationId(location) },
      },
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Nursery locations", url: `${SITE_URL}/find-your-nursery` },
        { name: location.name, url },
      ]),
      getFaqSchema(locationFaqs, `${url}#parent-questions`),
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className={`location-hero location-theme-${location.colour}`}>
          <div className="location-hero-copy">
            <Link className="back-link" href="/">
              Both locations
            </Link>
            <p className="eyebrow">{location.area}</p>
            <h1>{location.name}</h1>
            <p className="location-intro">{location.strapline}</p>
            <div className="location-badges">
              <span>{location.ages}</span>
              <span>{location.status}</span>
              <span>{location.opening}</span>
            </div>
            <div className="hero-actions">
              <Link className="button button-dark" href={`/visit?location=${location.slug}`}>
                Book a visit
              </Link>
              <a className="text-link" href={`tel:${location.phoneHref}`}>
                {location.phone}
              </a>
            </div>
          </div>
          <div className="location-hero-image">
            <Image
              src={location.image}
              unoptimized
              alt={location.imageAlt}
              width={location.slug === "angel" ? 1800 : 1600}
              height={location.slug === "angel" ? 1199 : 1067}
              sizes="(min-width: 700px) 48vw, 100vw"
              priority
            />
            <span>{location.year}</span>
          </div>
        </section>

        <section className="location-facts section-pad">
          <div>
            <span>Who it&apos;s for</span>
            <strong>{location.ages}</strong>
            <p>{location.ageDetail}</p>
          </div>
          <div>
            <span>Where to find us</span>
            <strong>{location.postcode}</strong>
            <p>{location.address}</p>
          </div>
          <div>
            <span>Close to</span>
            <strong>{location.nearby[0]}</strong>
            <p>{location.nearby.join(" · ")}</p>
          </div>
        </section>

        <section className="location-welcome section-pad">
          <div>
            <p className="eyebrow">Not so much a school…</p>
            <h2>More a home from home where your children learn.</h2>
          </div>
          <div className="location-welcome-copy">
            {location.welcome.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {location.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </section>

        {location.roomStages && (
          <section className="location-room-stages section-pad">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Growing through every stage</p>
                <h2>Dedicated rooms, shaped around each child.</h2>
              </div>
              <p>
                Our youngest children receive the care, routines and activities
                appropriate to their stage, then move forward when they are ready.
              </p>
            </div>
            <div className="location-stage-grid">
              {location.roomStages.map((stage) => (
                <article key={stage.name}>
                  <p>{stage.age}</p>
                  <h3>{stage.name}</h3>
                  <p>{stage.copy}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="location-care section-pad">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Care, learning and confidence</p>
              <h2>A sound introduction to education.</h2>
            </div>
            <p>
              Experienced, friendly and responsible staff make school feel safe,
              warm and welcoming from the beginning.
            </p>
          </div>
          <div className="location-care-grid">
            {location.carePillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="location-gallery section-pad">
          <div className="gallery-main">
            <Image
              src="/images/learning-room.webp"
              unoptimized
              alt="A carefully ordered Montessori classroom"
              width={1400}
              height={934}
              sizes="(min-width: 700px) 64vw, 100vw"
            />
          </div>
          <div className="gallery-side">
            <Image
              src="/images/sensory-room.webp"
              unoptimized
              alt="Montessori materials ready for children to explore"
              width={1400}
              height={934}
              sizes="(min-width: 700px) 36vw, 100vw"
            />
            <div className="gallery-caption">
              <span>Prepared for independence</span>
              <p>Real objects, natural materials and a place for everything.</p>
            </div>
          </div>
        </section>

        <section className="typical-day section-pad">
          <div>
            <p className="eyebrow">A typical day</p>
            <h2>A steady rhythm, with room to follow their curiosity.</h2>
          </div>
          <LocationTimeline location={location} />
        </section>

        <section className="location-practical section-pad">
          <div>
            <p className="eyebrow">Opening hours & funded places</p>
            <h2>Flexible care for family life.</h2>
          </div>
          <div className="location-practical-grid">
            <article>
              <span>Open</span>
              <strong>{location.opening}</strong>
              <p>{location.weeksOpen}</p>
            </article>
            <article>
              <span>Sessions & funding</span>
              <strong>15 and 30 hours</strong>
              <p>{location.sessionDetail}</p>
            </article>
            {location.localDetail && (
              <article>
                <span>Beyond the classroom</span>
                <strong>Our local neighbourhood</strong>
                <p>{location.localDetail}</p>
              </article>
            )}
          </div>
        </section>

        <section className="location-history section-pad">
          <p className="eyebrow">A brief history</p>
          <blockquote>{location.history}</blockquote>
          <p>
            Learning matters here, but so do care, nurturing, family values,
            parental involvement and an encouragement to embrace the world and
            all its wonders.
          </p>
        </section>

        <section className="location-explorer section-pad">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Look around</p>
              <h2>Explore before you visit.</h2>
            </div>
            <p>
              Drag across the room to see how the environment is arranged at a
              child&apos;s height.
            </p>
          </div>
          <PanoramaViewer location={location} />
        </section>

        <section className="answers location-answers section-pad" id="parent-questions">
          <div className="answers-heading">
            <p className="eyebrow">{location.name} nursery questions</p>
            <h2>What parents ask us.</h2>
            <p>
              Clear answers about ages, opening hours, funded childcare,
              Montessori learning and arranging a visit.
            </p>
          </div>
          <FAQList items={locationFaqs} />
        </section>

        <section className={`location-contact location-theme-${location.colour}`}>
          <div>
            <p className="eyebrow">Meet the team</p>
            <h2>We&apos;d love to show you around {location.name}.</h2>
          </div>
          <div>
            <a href={`mailto:${location.email}`}>{location.email}</a>
            <a href={`tel:${location.phoneHref}`}>{location.phone}</a>
            <Link className="button button-dark" href={`/visit?location=${location.slug}`}>
              Arrange a visit
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
    </>
  );
}
