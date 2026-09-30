import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "About Beckett House";
const description = "Discover Beckett House's family-run Montessori preschool in Barnsbury, Islington: individual attention, hands-on learning, home-cooked food and our history since 1996.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beckett-house" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/beckett-house", type: "website", locale: "en_GB" },
};

function AboutFeatureCard({ src, alt, width, height, children }: { src: string; alt: string; width: number; height: number; children: ReactNode }) {
  return <article>
    <Image className="about-feature-image" src={src} alt={alt} width={width} height={height} sizes="(min-width: 900px) 30vw, 100vw" loading="lazy" unoptimized />
    <div className="about-feature-body">{children}</div>
  </article>;
}

export default function AboutPage() {
  const url = `${SITE_URL}/beckett-house`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
      getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: "About us", url }]),
    ],
  };

  return <>
    <SiteHeader />
    <main className="about-page">
      <section className="about-beckett-hero" aria-labelledby="about-beckett-title">
        <div className="about-history-copy">
          <h1 id="about-beckett-title">About Beckett House</h1>
          <h2 className="about-accredited-heading">Montessori accredited</h2>
          <blockquote className="montessori-opening-quote"><p>“We believe education is important... we believe language, the command of numbers and social behaviour are important... but more than anything, we believe your children should be happy and confident and enjoy every moment of their time at nursery school.”</p></blockquote>
        </div>
        <div className="about-beckett-hero-image"><Image src="/images/children-circle-time.jpg" alt="Children sitting together and raising their hands during a classroom group activity" width={900} height={590} sizes="(min-width: 900px) 50vw, 100vw" priority unoptimized /></div>
      </section>
      <section className="about-school-introduction section-pad" aria-label="Our Montessori preschool">
        <p className="about-lede">Beckett House Montessori is a ‘good’ rated, and Montessori ‘MEAB’ <a className="text-link" href="https://www.montessori.org.uk/wp-content/uploads/2018/06/Beckett-House.pdf" target="_blank" rel="noopener noreferrer">accredited</a>, family run preschool.</p>
        <p>It is a calm and comfortable environment, where ages 2 to 5 play together in one room that is divided into the different Montessori areas, such as: language and math, art, etc. Children are free to choose their Montessori activities, with support from specialist staff. Care is child centered, and our attentive teachers have stayed here for years. Key workers especially relate to their assigned children. We work in partnership with parents, meeting once per term, and speaking throughout.</p>
      </section>
      <section className="about-home-from-home section-pad" aria-labelledby="home-from-home-title">
        <h2 id="home-from-home-title">Not so much a school...</h2>
        <p>More a <strong>home-from-home</strong> where your children learn</p>
      </section>
      <section className="about-school-philosophy section-pad" aria-label="Our approach to care and learning">
        <div>
          <p>The focus of Beckett House Nursery School is to provide the best possible environment for the children who attend.</p>
          <p>The nursery offers Montessori education in a very calm, safe, warm, home from home environment, where children aged between two to five years play and learn together.</p>
          <p>Through continuous observations and a tailored approach, we strive to meet each child&apos;s needs with emphasis on hands-on independent learning. This encourages children&apos;s natural curiosity and helps them to learn by doing things for themselves and with other children.</p>
        </div>
        <div>
          <p>In addition to the Montessori philosophy we follow the Early Years Foundation Stage (EYFS). The principles underlying the EYFS are ones with which Montessori teachers are familiar and which they enthusiastically endorse.</p>
          <p>Beckett House Montessori Nursery School has been established to give young pre-school children a very sound introduction to education. We believe that it is important for your child to spend this transitional period in a ‘home from home’ environment where the staff are experienced, friendly and responsible and the school safe, warm and welcoming.</p>
        </div>
      </section>
      <section className="about-feature-grid section-pad" aria-label="Care at Beckett House">
        <AboutFeatureCard src="/images/children-circle-time.jpg" alt="Children taking part in a classroom group activity" width={900} height={590}><h3>Individual attention</h3><p>Children are welcomed from the age of two and a quarter. Much time will be spent initially in accommodating the children and their <strong>individual needs</strong> while carefully introducing them to the concept of ‘school’ with its classroom layout, educational materials and daily routines.</p></AboutFeatureCard>
        <AboutFeatureCard src="/images/angel/montessori-nursery-angel-rocket-display-and-materials.webp" alt="Montessori learning materials on accessible shelves beneath the children’s rocket display" width={2000} height={1333}><h3>A love for learning creates confidence in their own abilities</h3><p>The curriculum is varied and follows the Montessori philosophy. The children are encouraged at all times to <strong>experience</strong>, to <strong>experiment</strong> and above all to develop a love for learning. The <strong>high ratio of staff</strong> to children, on average one to six, allows much one-to-one encouragement and guidance and ensures that the children are offered the best opportunity to find faith in themselves and to reach their full potential. The school also offers dance, music, drama, yoga and sport as part of the extracurricular activities.</p></AboutFeatureCard>
        <AboutFeatureCard src="/images/angel/montessori-nursery-angel-snack-tables.webp" alt="Child-sized tables and chairs beside the nursery kitchen area" width={2000} height={1333}><h3>Home-cooked food</h3><p>Lunch is home-cooked, prepared from <strong>fresh ingredients</strong> in our own kitchen. All meals are nutritionally balanced and varied and we can accommodate most <strong>dietary needs</strong>. The school will not provide sugar, sweets or crisps. Fresh and dried fruit, milk and low-sugar biscuits, will be given at snack time.</p></AboutFeatureCard>
      </section>
      <nav className="about-useful-links section-pad" aria-label="Find out more">
        <h2>Find out more</h2>
        <div>
          <Link href="/timetable">Daily timetable</Link>
          <Link href="/opening-hours-fees#funding">Funding</Link>
          <Link href="/timetable#term-dates">Term dates</Link>
          <Link href="/opening-hours-fees">Opening hours & fees</Link>
        </div>
      </nav>
      <nav id="history" className="about-useful-links section-pad" aria-label="Our history"><Link href="/history">Explore our history</Link></nav>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
