import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import CookieSettingsButton from "./cookie-settings-button";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "Privacy & Cookies";
const description = "How Beckett House Montessori collects, uses and protects personal information from our website, visit requests and registrations, and how we use cookies.";
const updated = "14 October 2026";

export const metadata: Metadata = {
  title, description, alternates: { canonical: "/privacy" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/privacy", type: "website", locale: "en_GB" },
};

export default function PrivacyPage() {
  const url = `${SITE_URL}/privacy`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };

  return <>
    <SiteHeader />
    <main className="policy-page">
      <header className="policy-intro">
        <h1>Privacy &amp; cookies</h1>
        <p>This notice explains how Beckett House Limited (“Beckett House”, “we”, “us”) collects and uses personal information when you use this website, ask to visit, or register your child at our Angel or Abbey Road nursery.</p>
        <p className="policy-updated">Last updated {updated}</p>
      </header>

      <section aria-labelledby="who-title">
        <h2 id="who-title">Who we are</h2>
        <p>Beckett House Limited is the data controller for the personal information described here. If you have any questions about this notice or your information, contact us:</p>
        <ul>
          <li>Angel: <a href="mailto:info@beckett-house.co.uk">info@beckett-house.co.uk</a>, 020 7278 8824, 98 Richmond Avenue, London N1 0LL</li>
          <li>Abbey Road: <a href="mailto:abbeyroad@beckett-house.co.uk">abbeyroad@beckett-house.co.uk</a>, 020 4568 7042, Abbey Hive, 84–86 Abbey Road, London NW8 0QA</li>
        </ul>
      </section>

      <section aria-labelledby="collect-title">
        <h2 id="collect-title">What we collect</h2>
        <h3>When you book a visit</h3>
        <p>Your name, email address, the nursery you’re interested in, your child’s age and anything you include in your message.</p>
        <h3>When you register your child</h3>
        <p>Your child’s full name and date of birth; each parent or carer’s name and mobile number; your email address, home address and home phone number; the start date you’d like; and the sessions you’d like your child to attend.</p>
        <h3>When you browse the website</h3>
        <p>Technical information such as your IP address, browser and device, which our hosting and security providers need to deliver the site and protect it from abuse. If you accept analytics cookies, we also collect information about how you use the site (see <a href="#cookies">Cookies</a>).</p>
      </section>

      <section aria-labelledby="use-title">
        <h2 id="use-title">How we use it, and our lawful basis</h2>
        <ul>
          <li><strong>To reply to your enquiry and arrange a visit.</strong> This is in our legitimate interests in responding to people who contact us, and the steps you ask us to take before entering into a contract.</li>
          <li><strong>To process a registration and, if a place is offered, to provide childcare.</strong> This is necessary to take steps towards, and then perform, our contract with you.</li>
          <li><strong>To meet our legal obligations</strong>, for example under the Early Years Foundation Stage and Ofsted requirements once your child attends.</li>
          <li><strong>To keep the website secure</strong> and stop spam, which is in our legitimate interests.</li>
          <li><strong>To understand how the website is used</strong> so we can improve it, only if you consent to analytics cookies.</li>
        </ul>
        <p>We send you an automatic email confirming what you submitted. We don’t sell your information or use it for marketing without your permission.</p>
      </section>

      <section aria-labelledby="share-title">
        <h2 id="share-title">Who we share it with</h2>
        <p>Only the nursery team handles your enquiry or registration. We use a small number of service providers who process information on our behalf, under contract and only on our instructions:</p>
        <ul>
          <li><strong>Cloudflare</strong> hosts the website and provides Turnstile, which checks that forms are sent by a person rather than a bot.</li>
          <li><strong>Resend</strong> sends the form emails to the nursery and your confirmation email. Emails are sent from its European (Ireland) region.</li>
          <li><strong>Google</strong> stores form submissions in Google Sheets for the nursery team, provides Google Analytics if you consent, and supplies the maps and the website’s font.</li>
        </ul>
        <p>Some of these providers are based in, or may access information from, the United States. Where information leaves the UK, it’s protected by the UK’s adequacy arrangements (including the UK–US Data Bridge) or by the UK International Data Transfer Addendum to the standard contractual clauses.</p>
        <p>We may also share information where the law requires it, for example with Ofsted or the local authority, including for funded childcare.</p>
      </section>

      <section aria-labelledby="keep-title">
        <h2 id="keep-title">How long we keep it</h2>
        <ul>
          <li>Visit requests: up to 12 months after our last contact, unless you go on to register.</li>
          <li>Registrations that don’t lead to a place: up to 12 months after the planned start date.</li>
          <li>Once your child attends, their records are kept for the periods set out in our nursery data protection and record-keeping policy, which follows statutory guidance.</li>
          <li>Analytics data: up to 14 months.</li>
        </ul>
      </section>

      <section aria-labelledby="rights-title">
        <h2 id="rights-title">Your rights</h2>
        <p>You can ask us for a copy of your information, to correct it, to delete it, to restrict or object to how we use it, or to move it to another provider. Where we rely on your consent, you can withdraw it at any time. To make a request, contact the nursery using the details above. We’ll reply within one month.</p>
        <p>If you’re unhappy with how we’ve handled your information, please tell us first so we can put it right. You can also complain to the Information Commissioner’s Office at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or on 0303 123 1113.</p>
      </section>

      <section aria-labelledby="cookies-title" id="cookies">
        <h2 id="cookies-title">Cookies and similar storage</h2>
        <p>We only use analytics cookies if you choose Accept on our cookie banner. Everything else is needed for the site to work.</p>
        <div className="policy-table-wrap">
          <table>
            <thead><tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">Type</th><th scope="col">Lasts</th></tr></thead>
            <tbody>
              <tr><td><code>_ga</code>, <code>_ga_*</code></td><td>Google Analytics: counts visits and shows how the site is used</td><td>Analytics, only with consent</td><td>Up to 2 years</td></tr>
              <tr><td><code>bh_analytics_consent</code></td><td>Remembers your cookie choice</td><td>Essential (browser storage)</td><td>Until you clear it</td></tr>
              <tr><td><code>bh_preferred_nursery</code></td><td>Remembers which nursery you chose so the site shows the right information</td><td>Essential (cookie and browser storage)</td><td>1 year</td></tr>
              <tr><td><code>bh_pending_lead</code></td><td>Records a form submission on the thank-you page, only if you accepted analytics</td><td>Session storage</td><td>Until you close the tab</td></tr>
              <tr><td>Cloudflare Turnstile</td><td>Checks forms are sent by a person, not a bot</td><td>Essential (security)</td><td>Session</td></tr>
            </tbody>
          </table>
        </div>
        <p>Google Maps may set its own cookies when a map is shown. You can change your analytics choice at any time:</p>
        <CookieSettingsButton />
      </section>

      <section aria-labelledby="changes-title">
        <h2 id="changes-title">Changes to this notice</h2>
        <p>We’ll update this page if the way we use personal information changes. The date at the top shows when it was last revised. See also our <Link href="/register">registration terms</Link>.</p>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
