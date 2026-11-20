"use client";
import Link from "next/link";
import { useState } from "react";
import { createDataAttribute } from "@sanity/visual-editing-standalone";
import { CmsText, useCmsContent } from "../cms-content";
import CardAnimation from "../card-animation";
import {
  careersPage,
  locationName,
  isOpenJob,
  type Job,
} from "../../lib/careers";
import {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  STUDIO_URL,
} from "../../lib/sanity/config";
export function JobField({
  job,
  field,
  children,
}: {
  job: Job;
  field: string;
  children: React.ReactNode;
}) {
  // Attributes are inert on the public site; Presentation activates overlays in authenticated preview.
  return (
    <span
      data-sanity={createDataAttribute({
        id: job._id,
        type: "job",
        path: field,
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        baseUrl: STUDIO_URL,
      }).toString()}
    >
      {children}
    </span>
  );
}
const londonToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const daysBetween = (from: string, to: string) =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000;
// First number in the salary text, e.g. "£27,000–£31,000 per year" → 27000.
const salaryValue = (salary = "") =>
  Number(salary.replace(/,/g, "").match(/\d+(\.\d+)?/)?.[0] ?? 0);
const postedLabel = (postedAt: string, today: string) => {
  const days = Math.round(daysBetween(postedAt, today));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return formatDate(postedAt);
};
const sorters = {
  newest: (a: Job, b: Job) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""),
  oldest: (a: Job, b: Job) => (a.postedAt ?? "").localeCompare(b.postedAt ?? ""),
  closing: (a: Job, b: Job) =>
    (a.closingDate ?? "9999").localeCompare(b.closingDate ?? "9999"),
  salary: (a: Job, b: Job) => salaryValue(b.salary) - salaryValue(a.salary),
  title: (a: Job, b: Job) => a.title.localeCompare(b.title),
};
export function CareersListing({ jobs }: { jobs: Job[] }) {
  const content = useCmsContent("careers", careersPage);
  const [search, setSearch] = useState(""),
    [location, setLocation] = useState(""),
    [type, setType] = useState(""),
    [posted, setPosted] = useState(""),
    [sort, setSort] = useState("newest");
  const open = jobs.filter(
    (job) => job.slug?.current && job.title && isOpenJob(job),
  );
  const types = [...new Set(open.map((j) => j.employmentType).filter(Boolean))];
  const today = londonToday();
  const filtered = open
    .filter(
      (job) =>
        (!location || job.location === location) &&
        (!type || job.employmentType === type) &&
        (!posted ||
          (job.postedAt && daysBetween(job.postedAt, today) <= Number(posted))) &&
        `${job.title} ${job.summary} ${job.department} ${locationName(job.location)}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort(sorters[sort as keyof typeof sorters] ?? sorters.newest);
  const filtersActive = Boolean(search || location || type || posted);
  const count = (value: string) =>
    open.filter((job) => !value || job.location === value).length;
  return (
    <>
      <header className="careers-hero">
        <div className="careers-hero-copy">
          <p className="eyebrow">
            <CmsText
              page="careers"
              field="eyebrow"
              fallback={content.eyebrow}
            />
          </p>
          <h1>
            <CmsText page="careers" field="title" fallback={content.title} />
          </h1>
          <p className="careers-lead">
            <CmsText
              page="careers"
              field="introduction"
              fallback={content.introduction}
            />
          </p>
          <div className="careers-hero-actions">
            <a className="button button-dark" href="#opportunities">
              {open.length
                ? `View ${open.length} open ${open.length === 1 ? "role" : "roles"}`
                : "Explore opportunities"}{" "}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="careers-hero-art">
          <CardAnimation name="shapehop" />
        </div>
      </header>
      <section id="opportunities" className="careers-opportunities">
        <div className="careers-section-heading">
          <p className="eyebrow">Find your next chapter</p>
          <h2>Our opportunities</h2>
          <p>Two nurseries. One shared commitment to childhood.</p>
        </div>
        {open.length > 0 && (
          <div className="career-filters">
            <div
              className="career-chips"
              role="group"
              aria-label="Filter by nursery"
            >
              {[
                ["", "All nurseries"],
                ["angel", "Angel"],
                ["abbey-road", "Abbey Road"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={location === value}
                  onClick={() => setLocation(value)}
                >
                  {label} <span>{count(value)}</span>
                </button>
              ))}
            </div>
            <div className="career-filter-fields">
              <label className="career-search">
                <span className="career-filter-label">Search</span>
                <input
                  type="search"
                  placeholder="Job title or keyword"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                <span className="career-filter-label">Date posted</span>
                <select
                  value={posted}
                  onChange={(e) => setPosted(e.target.value)}
                >
                  <option value="">Any time</option>
                  <option value="3">Last 3 days</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </label>
              {types.length > 1 && (
                <label>
                  <span className="career-filter-label">Working pattern</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">All patterns</option>
                    {types.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                <span className="career-filter-label">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="closing">Closing soonest</option>
                  <option value="salary">Highest salary</option>
                  <option value="title">Job title A–Z</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <div className="career-results">
          <p role="status">
            Showing {filtered.length}{" "}
            {filtered.length === 1 ? "opportunity" : "opportunities"}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLocation("");
                setType("");
                setPosted("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <ul className="career-jobs">
          {filtered.map((job) => (
            <li
              className={`career-job-card career-job-${job.location}`}
              key={job._id}
            >
              <div className="career-job-main">
                <p className="career-job-location">
                  <span aria-hidden="true" className="career-dot" />
                  {locationName(job.location)}
                  {job.isSample && (
                    <span className="career-badge">Sample role</span>
                  )}
                </p>
                <h3>
                  <a href={`/careers/${job.slug.current}`}>
                    <JobField job={job} field="title">
                      {job.title}
                    </JobField>
                  </a>
                </h3>
                <p>{job.summary}</p>
                <ul className="career-tags" aria-label="Role details">
                  {[job.salary, job.employmentType, job.hours]
                    .filter(Boolean)
                    .map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                </ul>
                <p className="career-job-dates">
                  {job.postedAt && <>Posted {postedLabel(job.postedAt, today)}</>}
                  {job.postedAt && " · "}
                  {job.closingDate
                    ? `Closes ${formatDate(job.closingDate)}`
                    : "Ongoing recruitment"}
                </p>
              </div>
              <span className="career-card-cta" aria-hidden="true">
                View role <span>→</span>
              </span>
            </li>
          ))}
        </ul>
        {!filtered.length && (
          <div className="career-empty">
            <h3>
              {open.length
                ? "No matching opportunities"
                : "No open opportunities right now"}
            </h3>
            <p>
              {open.length
                ? "Try another keyword or clear your filters."
                : "Please check back soon for future roles with our nursery teams."}
            </p>
          </div>
        )}
      </section>
      <aside className="career-safeguarding">
        <h2>A safe and welcoming place</h2>
        <p>
          <CmsText
            page="careers"
            field="safeguarding"
            fallback={content.safeguarding}
          />
        </p>
      </aside>
    </>
  );
}
// Adverts are plain text in Sanity; lines starting with a bullet become a list.
function AdvertText({ text }: { text: string }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const raw of (text || "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      blocks.push({ list: false, lines: [] });
      continue;
    }
    const item = line.match(/^[•\-*–]\s*(.+)$/);
    const last = blocks.at(-1);
    if (item) {
      if (last?.list) last.lines.push(item[1]);
      else blocks.push({ list: true, lines: [item[1]] });
    } else if (last && !last.list && last.lines.length) last.lines.push(line);
    else blocks.push({ list: false, lines: [line] });
  }
  return (
    <>
      {blocks
        .filter((block) => block.lines.length)
        .map((block, i) =>
          block.list ? (
            <ul key={i}>
              {block.lines.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>
              {block.lines.map((line, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          ),
        )}
    </>
  );
}
const formatDate = (value: string) =>
  new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
export function JobDetails({ job }: { job: Job }) {
  const content = useCmsContent("careers", careersPage),
    open = isOpenJob(job);
  const applyHref = `/careers/${job.slug.current}/apply`;
  const applyLabel = job.isSample ? "Preview application" : "Apply for this role";
  return (
    <div className="career-detail">
      <header className="career-job-heading">
        <div className="career-job-heading-inner">
          <Link className="career-back" href="/careers">
            <span aria-hidden="true">←</span> All opportunities
          </Link>
          <p className="career-job-location">
            <span aria-hidden="true" className="career-dot" />
            {locationName(job.location)}
            {job.isSample && <span className="career-badge">Sample role</span>}
          </p>
          <h1>
            <JobField job={job} field="title">
              {job.title}
            </JobField>
          </h1>
          <p className="careers-lead">
            <JobField job={job} field="summary">
              {job.summary}
            </JobField>
          </p>
          <ul className="career-tags" aria-label="Role details">
            {[job.salary, job.employmentType, job.hours]
              .filter(Boolean)
              .map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
          </ul>
          {open && (
            <a className="career-button career-heading-apply" href={applyHref}>
              {applyLabel} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </header>
      <div className="career-detail-grid">
        <article className="career-advert">
          {job.isSample && (
            <p className="career-notice">
              This sample vacancy is for reviewing the careers section.
              Applications are not being accepted for this role.
            </p>
          )}
          {!open && (
            <p className="career-notice">
              Applications for this role are closed.{" "}
              <Link href="/careers">See our current opportunities</Link>.
            </p>
          )}
          {job.sections?.map((section) => (
            <section key={section._key}>
              <h2>
                <JobField
                  job={job}
                  field={`sections[_key=="${section._key}"].heading`}
                >
                  {section.heading}
                </JobField>
              </h2>
              <div
                className="career-prose"
                data-sanity={createDataAttribute({
                  id: job._id,
                  type: "job",
                  path: `sections[_key=="${section._key}"].body`,
                  projectId: SANITY_PROJECT_ID,
                  dataset: SANITY_DATASET,
                  baseUrl: STUDIO_URL,
                }).toString()}
              >
                <AdvertText text={section.body} />
              </div>
            </section>
          ))}
          <section className="career-advert-safeguarding">
            <h2>Safeguarding and equal opportunities</h2>
            <p>
              <CmsText
                page="careers"
                field="safeguarding"
                fallback={content.safeguarding}
              />
            </p>
            <p>
              We welcome applications from people of all backgrounds. Please
              tell us if you need an adjustment during the recruitment process.
            </p>
          </section>
          {open && (
            <section className="career-apply-panel">
              <div>
                <h2>Sounds like you?</h2>
                <p>
                  Answer two quick questions, then tell us about your
                  experience and upload your CV.
                </p>
              </div>
              <a className="career-button" href={applyHref}>
                {applyLabel} <span aria-hidden="true">→</span>
              </a>
            </section>
          )}
        </article>
        <aside className="career-summary" aria-label="Role summary">
          <h2 className="eyebrow">At a glance</h2>
          <dl>
            {[
              ["Location", locationName(job.location), "location"],
              ["Salary", job.salary, "salary"],
              ["Contract", job.employmentType, "employmentType"],
              ["Hours", job.hours, "hours"],
              [
                "Posted",
                job.postedAt ? formatDate(job.postedAt) : "Not specified",
                "postedAt",
              ],
              [
                "Closing date",
                job.closingDate
                  ? formatDate(job.closingDate)
                  : "Ongoing recruitment",
                "closingDate",
              ],
            ].map(([label, value, field]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <JobField job={job} field={field}>
                    {value}
                  </JobField>
                </dd>
              </div>
            ))}
          </dl>
          {open ? (
            <>
              <a className="career-button" href={applyHref}>
                {applyLabel} <span aria-hidden="true">→</span>
              </a>
              <p className="career-small">
                Two quick questions, then your details and CV.
              </p>
            </>
          ) : (
            <p className="career-small">Applications for this role are closed.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
