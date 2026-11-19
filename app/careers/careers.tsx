"use client";
import Link from "next/link";
import { useState } from "react";
import { createDataAttribute } from "@sanity/visual-editing-standalone";
import { CmsText, CmsRegion, useCmsContent } from "../cms-content";
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
export function CareersListing({ jobs }: { jobs: Job[] }) {
  const content = useCmsContent("careers", careersPage);
  const [search, setSearch] = useState(""),
    [location, setLocation] = useState(""),
    [type, setType] = useState("");
  const open = jobs.filter(
    (job) => job.slug?.current && job.title && isOpenJob(job),
  );
  const filtered = open.filter(
    (job) =>
      (!location || job.location === location) &&
      (!type || job.employmentType === type) &&
      `${job.title} ${job.summary} ${job.department} ${locationName(job.location)}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <>
      <header className="careers-hero">
        <div>
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
          <a className="career-button" href="#opportunities">
            Explore opportunities <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="careers-hero-art" aria-hidden="true">
          <span>
            Small beginnings.
            <br />
            Bright futures.
          </span>
          <i>✳</i>
        </div>
      </header>
      <CmsRegion page="careers" field="benefits" className="careers-benefits">
        {content.benefits.map((benefit, i) => (
          <article key={i}>
            <span className="eyebrow">0{i + 1}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
          </article>
        ))}
      </CmsRegion>
      <section id="opportunities" className="careers-opportunities">
        <div className="careers-section-heading">
          <div>
            <p className="eyebrow">Find your next chapter</p>
            <h2>Our opportunities</h2>
          </div>
          <p>Two nurseries. One shared commitment to childhood.</p>
        </div>
        <div className="career-filters">
          <label>
            Search roles
            <input
              type="search"
              placeholder="Job title or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All locations</option>
              <option value="angel">Angel</option>
              <option value="abbey-road">Abbey Road</option>
            </select>
          </label>
          <label>
            Working pattern
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All working patterns</option>
              {[...new Set(open.map((j) => j.employmentType))].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="career-results">
          <p role="status">
            {filtered.length}{" "}
            {filtered.length === 1 ? "opportunity" : "opportunities"}
          </p>
          {(search || location || type) && (
            <button
              onClick={() => {
                setSearch("");
                setLocation("");
                setType("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="career-jobs">
          {filtered.map((job) => (
            <article className="career-job-card" key={job._id}>
              <div>
                <p className="eyebrow">
                  {locationName(job.location)}{" "}
                  {job.isSample && " · Sample role"}
                </p>
                <h3>
                  <a href={`/careers/${job.slug.current}`}>
                    <JobField job={job} field="title">
                      {job.title}
                    </JobField>
                  </a>
                </h3>
                <p>{job.summary}</p>
                <div className="career-tags">
                  <span>{job.employmentType}</span>
                  <span>{job.salary}</span>
                  <span>{job.hours}</span>
                </div>
              </div>
              <a
                className="career-card-link"
                href={`/careers/${job.slug.current}`}
                aria-label={`View ${job.title} at ${locationName(job.location)}`}
              >
                View role <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
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
                : "Please check back for future roles with our nursery teams."}
            </p>
          </div>
        )}
      </section>
      <div className="career-safeguarding">
        <h2>A safe and welcoming place</h2>
        <p>
          <CmsText
            page="careers"
            field="safeguarding"
            fallback={content.safeguarding}
          />
        </p>
      </div>
    </>
  );
}
export function JobDetails({ job }: { job: Job }) {
  const content = useCmsContent("careers", careersPage),
    open = isOpenJob(job);
  const date = (value: string) =>
    new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/London",
    });
  return (
    <div className="career-detail">
      <Link className="career-back" href="/careers">
        ← All opportunities
      </Link>
      <header className="career-job-heading">
        <p className="eyebrow">
          {locationName(job.location)}
          {job.isSample ? " · Sample role for review" : ""}
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
              Applications for this role are closed.
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
              <div className="career-prose">
                <JobField
                  job={job}
                  field={`sections[_key=="${section._key}"].body`}
                >
                  {section.body}
                </JobField>
              </div>
            </section>
          ))}
          <section>
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
        </article>
        <aside className="career-summary">
          <p className="eyebrow">At a glance</p>
          <dl>
            {[
              ["Location", locationName(job.location), "location"],
              ["Salary", job.salary, "salary"],
              ["Contract", job.employmentType, "employmentType"],
              ["Hours", job.hours, "hours"],
              [
                "Posted",
                job.postedAt ? date(job.postedAt) : "Not specified",
                "postedAt",
              ],
              [
                "Closing date",
                job.closingDate ? date(job.closingDate) : "Ongoing recruitment",
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
          {open && (
            <a
              className="career-button"
              href={`/careers/${job.slug.current}/apply`}
            >
              {job.isSample ? "Preview application" : "Apply for this role"}{" "}
              <span aria-hidden="true">→</span>
            </a>
          )}
          <p className="career-small">
            Start with two quick questions, then tell us about your experience.
          </p>
        </aside>
      </div>
    </div>
  );
}
