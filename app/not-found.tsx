import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components";
import CardAnimation from "./card-animation";
import { locations } from "../lib/content";
import PageTitle from "./page-title";

const links = [
  { href: "/angel", label: "Angel nursery" },
  { href: "/abbey-road", label: "Abbey Road nursery" },
  { href: "/virtual-tour", label: "Virtual tour" },
  { href: "/opening-hours-fees", label: "Opening hours and fees" },
  { href: "/faq", label: "Frequently asked questions" },
];

export default function NotFound() {
  return (
    <>
      <PageTitle title="Page not found | Beckett House Montessori" />
      <SiteHeader />
      <main>
        <section className="visit-hero">
          <CardAnimation name="shapehop" />
          <div>
            <p className="eyebrow">Page not found</p>
            <h1>Sorry, we can’t find that page.</h1>
          </div>
          <p>It may have moved, or the link may be out of date. These pages might help instead.</p>
        </section>
        <section className="visit-layout section-pad">
          <div className="visit-form thank-you-card">
            <h2>Where would you like to go?</h2>
            <ul>{links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            <div className="thank-you-actions">
              <Link className="button button-dark" href="/">Back to home<span aria-hidden="true">→</span></Link>
              <Link className="button button-light" href="/visit">Book a visit<span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <aside className="visit-aside">
            <p className="eyebrow">Get in touch</p>
            {locations.map((location) => (
              <div className={`visit-location visit-${location.colour}`} key={location.slug}>
                <span>{location.area}</span>
                <h2>{location.name}</h2>
                <a href={`tel:${location.phoneHref}`}>{location.phone}</a>
                <a href={`mailto:${location.email}`}>{location.email}</a>
              </div>
            ))}
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
