import {getSanityContent as readSeoContent} from "../../lib/sanity/server";

import {CmsText} from "../cms-content";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import CookieSettingsButton from "./cookie-settings-button";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "Privacy & Cookies";
const description = "How Beckett House Montessori collects, uses and protects personal information from our website, visit requests and registrations, and how we use cookies.";
const updated = "14 October 2026";

const defaultMetadata: Metadata = {
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
        <h1><CmsText page="privacy" field="copy.privacyCookies" fallback={"Privacy & cookies"} /></h1>
        <p><CmsText page="privacy" field="copy.thisNoticeExplainsHowBeckettHouseLimited" fallback={"This notice explains how Beckett House Limited (“Beckett House”, “we”, “us”) collects and uses personal information when you use this website, ask to visit, or register your child at our Angel or Abbey Road nursery."} /></p>
        <p className="policy-updated"><CmsText page="privacy" field="copy.lastUpdated" fallback={"Last updated "} />{updated}</p>
      </header>

      <section aria-labelledby="who-title">
        <h2 id="who-title"><CmsText page="privacy" field="copy.whoWeAre" fallback={"Who we are"} /></h2>
        <p><CmsText page="privacy" field="copy.beckettHouseLimitedIsTheDataController" fallback={"Beckett House Limited is the data controller for the personal information described here. If you have any questions about this notice or your information, contact us:"} /></p>
        <ul>
          <li><CmsText page="privacy" field="copy.angel" fallback={"Angel: "} /><a href="mailto:info@beckett-house.co.uk"><CmsText page="privacy" field="copy.infobecketthousecouk" fallback={"info@beckett-house.co.uk"} /></a><CmsText page="privacy" field="copy.text0207278882498RichmondAvenueLondon" fallback={", 020 7278 8824, 98 Richmond Avenue, London N1 0LL"} /></li>
          <li><CmsText page="privacy" field="copy.abbeyRoad" fallback={"Abbey Road: "} /><a href="mailto:abbeyroad@beckett-house.co.uk"><CmsText page="privacy" field="copy.abbeyroadbecketthousecouk" fallback={"abbeyroad@beckett-house.co.uk"} /></a><CmsText page="privacy" field="copy.text02045687042AbbeyHive8486Abbey" fallback={", 020 4568 7042, Abbey Hive, 84–86 Abbey Road, London NW8 0QA"} /></li>
        </ul>
      </section>

      <section aria-labelledby="collect-title">
        <h2 id="collect-title"><CmsText page="privacy" field="copy.whatWeCollect" fallback={"What we collect"} /></h2>
        <h3><CmsText page="privacy" field="copy.whenYouBookAVisit" fallback={"When you book a visit"} /></h3>
        <p><CmsText page="privacy" field="copy.yourNameEmailAddressTheNurseryYoure" fallback={"Your name, email address, the nursery you’re interested in, your child’s age and anything you include in your message."} /></p>
        <h3><CmsText page="privacy" field="copy.whenYouRegisterYourChild" fallback={"When you register your child"} /></h3>
        <p><CmsText page="privacy" field="copy.yourChildsFullNameAndDateOf" fallback={"Your child’s full name and date of birth; each parent or carer’s name and mobile number; your email address, home address and home phone number; the start date you’d like; and the sessions you’d like your child to attend."} /></p>
        <h3><CmsText page="privacy" field="copy.whenYouBrowseTheWebsite" fallback={"When you browse the website"} /></h3>
        <p><CmsText page="privacy" field="copy.technicalInformationSuchAsYourIPAddress" fallback={"Technical information such as your IP address, browser and device, which our hosting and security providers need to deliver the site and protect it from abuse. If you accept analytics cookies, we also collect information about how you use the site (see "} /><a href="#cookies"><CmsText page="privacy" field="copy.cookies" fallback={"Cookies"} /></a><CmsText page="privacy" field="copy.text" fallback={")."} /></p>
      </section>

      <section aria-labelledby="use-title">
        <h2 id="use-title"><CmsText page="privacy" field="copy.howWeUseItAndOurLawful" fallback={"How we use it, and our lawful basis"} /></h2>
        <ul>
          <li><strong><CmsText page="privacy" field="copy.toReplyToYourEnquiryAndArrange" fallback={"To reply to your enquiry and arrange a visit."} /></strong> <CmsText page="privacy" field="copy.thisIsInOurLegitimateInterestsIn" fallback={" This is in our legitimate interests in responding to people who contact us, and the steps you ask us to take before entering into a contract."} /></li>
          <li><strong><CmsText page="privacy" field="copy.toProcessARegistrationAndIfA" fallback={"To process a registration and, if a place is offered, to provide childcare."} /></strong> <CmsText page="privacy" field="copy.thisIsNecessaryToTakeStepsTowards" fallback={" This is necessary to take steps towards, and then perform, our contract with you."} /></li>
          <li><strong><CmsText page="privacy" field="copy.toMeetOurLegalObligations" fallback={"To meet our legal obligations"} /></strong><CmsText page="privacy" field="copy.forExampleUnderTheEarlyYearsFoundation" fallback={", for example under the Early Years Foundation Stage and Ofsted requirements once your child attends."} /></li>
          <li><strong><CmsText page="privacy" field="copy.toKeepTheWebsiteSecure" fallback={"To keep the website secure"} /></strong> <CmsText page="privacy" field="copy.andStopSpamWhichIsInOur" fallback={" and stop spam, which is in our legitimate interests."} /></li>
          <li><strong><CmsText page="privacy" field="copy.toUnderstandHowTheWebsiteIsUsed" fallback={"To understand how the website is used"} /></strong> <CmsText page="privacy" field="copy.soWeCanImproveItOnlyIf" fallback={" so we can improve it, only if you consent to analytics cookies."} /></li>
        </ul>
        <p><CmsText page="privacy" field="copy.weSendYouAnAutomaticEmailConfirming" fallback={"We send you an automatic email confirming what you submitted. We don’t sell your information or use it for marketing without your permission."} /></p>
      </section>

      <section aria-labelledby="share-title">
        <h2 id="share-title"><CmsText page="privacy" field="copy.whoWeShareItWith" fallback={"Who we share it with"} /></h2>
        <p><CmsText page="privacy" field="copy.onlyTheNurseryTeamHandlesYourEnquiry" fallback={"Only the nursery team handles your enquiry or registration. We use a small number of service providers who process information on our behalf, under contract and only on our instructions:"} /></p>
        <ul>
          <li><strong><CmsText page="privacy" field="copy.cloudflare" fallback={"Cloudflare"} /></strong> <CmsText page="privacy" field="copy.hostsTheWebsiteAndProvidesTurnstileWhich" fallback={" hosts the website and provides Turnstile, which checks that forms are sent by a person rather than a bot."} /></li>
          <li><strong><CmsText page="privacy" field="copy.resend" fallback={"Resend"} /></strong> <CmsText page="privacy" field="copy.sendsTheFormEmailsToTheNursery" fallback={" sends the form emails to the nursery and your confirmation email. Emails are sent from its European (Ireland) region."} /></li>
          <li><strong><CmsText page="privacy" field="copy.google" fallback={"Google"} /></strong> <CmsText page="privacy" field="copy.storesFormSubmissionsInGoogleSheetsFor" fallback={" stores form submissions in Google Sheets for the nursery team, provides Google Analytics if you consent, and supplies the maps and the website’s font."} /></li>
        </ul>
        <p><CmsText page="privacy" field="copy.someOfTheseProvidersAreBasedIn" fallback={"Some of these providers are based in, or may access information from, the United States. Where information leaves the UK, it’s protected by the UK’s adequacy arrangements (including the UK–US Data Bridge) or by the UK International Data Transfer Addendum to the standard contractual clauses."} /></p>
        <p><CmsText page="privacy" field="copy.weMayAlsoShareInformationWhereThe" fallback={"We may also share information where the law requires it, for example with Ofsted or the local authority, including for funded childcare."} /></p>
      </section>

      <section aria-labelledby="keep-title">
        <h2 id="keep-title"><CmsText page="privacy" field="copy.howLongWeKeepIt" fallback={"How long we keep it"} /></h2>
        <ul>
          <li><CmsText page="privacy" field="copy.visitRequestsUpTo12MonthsAfter" fallback={"Visit requests: up to 12 months after our last contact, unless you go on to register."} /></li>
          <li><CmsText page="privacy" field="copy.registrationsThatDontLeadToAPlace" fallback={"Registrations that don’t lead to a place: up to 12 months after the planned start date."} /></li>
          <li><CmsText page="privacy" field="copy.onceYourChildAttendsTheirRecordsAre" fallback={"Once your child attends, their records are kept for the periods set out in our nursery data protection and record-keeping policy, which follows statutory guidance."} /></li>
          <li><CmsText page="privacy" field="copy.analyticsDataUpTo14Months" fallback={"Analytics data: up to 14 months."} /></li>
        </ul>
      </section>

      <section aria-labelledby="rights-title">
        <h2 id="rights-title"><CmsText page="privacy" field="copy.yourRights" fallback={"Your rights"} /></h2>
        <p><CmsText page="privacy" field="copy.youCanAskUsForACopy" fallback={"You can ask us for a copy of your information, to correct it, to delete it, to restrict or object to how we use it, or to move it to another provider. Where we rely on your consent, you can withdraw it at any time. To make a request, contact the nursery using the details above. We’ll reply within one month."} /></p>
        <p><CmsText page="privacy" field="copy.ifYoureUnhappyWithHowWeveHandled" fallback={"If you’re unhappy with how we’ve handled your information, please tell us first so we can put it right. You can also complain to the Information Commissioner’s Office at "} /><a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer"><CmsText page="privacy" field="copy.icoorguk" fallback={"ico.org.uk"} /></a> <CmsText page="privacy" field="copy.orOn03031231113" fallback={" or on 0303 123 1113."} /></p>
      </section>

      <section aria-labelledby="cookies-title" id="cookies">
        <h2 id="cookies-title"><CmsText page="privacy" field="copy.cookiesAndSimilarStorage" fallback={"Cookies and similar storage"} /></h2>
        <p><CmsText page="privacy" field="copy.weOnlyUseAnalyticsCookiesIfYou" fallback={"We only use analytics cookies if you choose Accept on our cookie banner. Everything else is needed for the site to work."} /></p>
        <div className="policy-table-wrap">
          <table>
            <thead><tr><th scope="col"><CmsText page="privacy" field="copy.name" fallback={"Name"} /></th><th scope="col"><CmsText page="privacy" field="copy.purpose" fallback={"Purpose"} /></th><th scope="col"><CmsText page="privacy" field="copy.type" fallback={"Type"} /></th><th scope="col"><CmsText page="privacy" field="copy.lasts" fallback={"Lasts"} /></th></tr></thead>
            <tbody>
              <tr><td><code><CmsText page="privacy" field="copy.ga" fallback={"_ga"} /></code><CmsText page="privacy" field="copy.text2" fallback={", "} /><code><CmsText page="privacy" field="copy.ga2" fallback={"_ga_*"} /></code></td><td><CmsText page="privacy" field="copy.googleAnalyticsCountsVisitsAndShowsHow" fallback={"Google Analytics: counts visits and shows how the site is used"} /></td><td><CmsText page="privacy" field="copy.analyticsOnlyWithConsent" fallback={"Analytics, only with consent"} /></td><td><CmsText page="privacy" field="copy.upTo2Years" fallback={"Up to 2 years"} /></td></tr>
              <tr><td><code><CmsText page="privacy" field="copy.bhanalyticsconsent" fallback={"bh_analytics_consent"} /></code></td><td><CmsText page="privacy" field="copy.remembersYourCookieChoice" fallback={"Remembers your cookie choice"} /></td><td><CmsText page="privacy" field="copy.essentialBrowserStorage" fallback={"Essential (browser storage)"} /></td><td><CmsText page="privacy" field="copy.untilYouClearIt" fallback={"Until you clear it"} /></td></tr>
              <tr><td><code><CmsText page="privacy" field="copy.bhpreferrednursery" fallback={"bh_preferred_nursery"} /></code></td><td><CmsText page="privacy" field="copy.remembersWhichNurseryYouChoseSoThe" fallback={"Remembers which nursery you chose so the site shows the right information"} /></td><td><CmsText page="privacy" field="copy.essentialCookieAndBrowserStorage" fallback={"Essential (cookie and browser storage)"} /></td><td><CmsText page="privacy" field="copy.text1Year" fallback={"1 year"} /></td></tr>
              <tr><td><code><CmsText page="privacy" field="copy.bhpendinglead" fallback={"bh_pending_lead"} /></code></td><td><CmsText page="privacy" field="copy.recordsAFormSubmissionOnTheThankyou" fallback={"Records a form submission on the thank-you page, only if you accepted analytics"} /></td><td><CmsText page="privacy" field="copy.sessionStorage" fallback={"Session storage"} /></td><td><CmsText page="privacy" field="copy.untilYouCloseTheTab" fallback={"Until you close the tab"} /></td></tr>
              <tr><td><CmsText page="privacy" field="copy.cloudflareTurnstile" fallback={"Cloudflare Turnstile"} /></td><td><CmsText page="privacy" field="copy.checksFormsAreSentByAPerson" fallback={"Checks forms are sent by a person, not a bot"} /></td><td><CmsText page="privacy" field="copy.essentialSecurity" fallback={"Essential (security)"} /></td><td><CmsText page="privacy" field="copy.session" fallback={"Session"} /></td></tr>
            </tbody>
          </table>
        </div>
        <p><CmsText page="privacy" field="copy.googleMapsMaySetItsOwnCookies" fallback={"Google Maps may set its own cookies when a map is shown. You can change your analytics choice at any time:"} /></p>
        <CookieSettingsButton />
      </section>

      <section aria-labelledby="changes-title">
        <h2 id="changes-title"><CmsText page="privacy" field="copy.changesToThisNotice" fallback={"Changes to this notice"} /></h2>
        <p><CmsText page="privacy" field="copy.wellUpdateThisPageIfTheWay" fallback={"We’ll update this page if the way we use personal information changes. The date at the top shows when it was last revised. See also our "} /><Link href="/register"><CmsText page="privacy" field="copy.registrationTerms" fallback={"registration terms"} /></Link><CmsText page="privacy" field="copy.text3" fallback={"."} /></p>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("privacy");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
