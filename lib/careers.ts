export type Job = {
  _id: string;
  title: string;
  slug: { current: string };
  location: "angel" | "abbey-road";
  department: string;
  employmentType: string;
  salary: string;
  hours: string;
  postedAt: string;
  closingDate?: string;
  summary: string;
  sections: { _key: string; heading: string; body: string }[];
  status: "open" | "closed";
  isSample?: boolean;
};
export const careersPage = {
  title: "Work with us",
  eyebrow: "Careers at Beckett House",
  introduction:
    "A rewarding career starts with a place where you belong. Join our nursery teams and help children grow in confidence, curiosity and independence.",
  benefits: [
    {
      title: "A close-knit team",
      description:
        "Work alongside colleagues who care about children and support one another.",
    },
    {
      title: "Room to grow",
      description:
        "Bring your ideas, share your experience and develop your early years practice.",
    },
    {
      title: "Meaningful work",
      description: "Make a difference to children and families, every day.",
    },
  ],
  safeguarding:
    "Beckett House is committed to safeguarding and promoting the welfare of children. Successful applicants will be subject to appropriate pre-employment checks, including references and an enhanced DBS check.",
};
export const locationName = (location: string) =>
  location === "angel" ? "Angel, Islington" : "Abbey Road, St John’s Wood";
export function isOpenJob(job: Job, now = new Date()) {
  return (
    job.status === "open" &&
    (!job.closingDate ||
      (/^\d{4}-\d{2}-\d{2}$/.test(job.closingDate) &&
        job.closingDate >=
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/London",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(now)))
  );
}
export const careerQuestions = [
  "Do you hold a Level 3 (or above) Early Years Qualification?",
  "Can you work our shifts of either 8am–4pm or 10am–6pm, 5 days a week?",
];
