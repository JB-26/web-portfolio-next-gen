import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Polaroid from "../components/Polaroid";
import ResumeSection from "../components/ResumeSection";
import TagPill from "../components/TagPill";
import photoLouvre from "../public/images/resume-louvre.jpg";
import photoMuseum from "../public/images/resume-museum.jpg";
import photoTopGolf from "../public/images/resume-topgolf.jpg";

// Content lives in data rather than repeated JSX. The previous version of this
// page hand-wrote every entry, tag and link as markup — ~585 lines for what is
// really four lists.

const PHOTOS = [
  { src: photoTopGolf, alt: "Top Golf", rotate: -3 },
  { src: photoMuseum, alt: "Natural History Museum", rotate: 1.5 },
  { src: photoLouvre, alt: "Louvre", rotate: 3.5 },
];

const WORK = [
  {
    company: "Institute of Chartered Accountants in England and Wales",
    role: "Assessment Systems Executive",
    dates: "August 2024 - Present",
    blurb:
      "Managed releases for key systems, defect lists and resolutions, to ensure that the product meets the needs of the institute.",
  },
  {
    company: "Rightmove",
    role: "Application Analyst",
    dates: "September 2023 - April 2024",
    blurb:
      "Hired to analyse business problems that would result in increased revenue, inform the design and development of technical solutions",
  },
  {
    company: "IQVIA",
    role: "Software Test Engineer",
    dates: "November 2021 - September 2023",
    blurb:
      "Worked in an Agile team, to ensure a quality product for the users, on the Human Assisted Review Tool",
  },
  {
    company: "Domino's Pizza Group",
    role: "Software Tester",
    dates: "October 2016 - November 2021",
    blurb:
      "Championed quality for customers on Domino's ecommerce platform by manually testing releases.",
  },
  {
    company: "EDW Technology",
    role: "System Test Analyst",
    dates: "July 2014 - October 2016",
    blurb:
      "Tested new releases of ERS (Energy Retail Suite - EDW's bespoke application, written in Java) and provided support to users.",
  },
];

const CERTIFICATIONS = [
  {
    name: "Google AI Professional Certificate",
    href: "https://www.udemy.com/certificate/UC-4aae4450-bd4b-4592-953b-2179cdcda331/",
    tags: ["AI", "Prompts", "Generative AI"],
  },
  {
    name: "AI Fluency: Framework & Foundations",
    href: "https://verify.skilljar.com/c/5ah5hmesr4gq",
    tags: ["AI"],
  },
  {
    name: "Digital Product Management: Modern Fundamentals",
    href: "https://www.coursera.org/account/accomplishments/verify/LGPKX3EFN3M9",
    tags: ["Product", "Innovation", "Stakeholder Management"],
  },
  {
    name: "Scrum Master",
    href: "https://s3.amazonaws.com/scruminc-certs/RSM-8823626",
    tags: ["Agile", "Scrum", "Team Management"],
  },
  {
    name: "ISTQB-BCS Certified Tester Foundation Level",
    href: "https://www.linkedin.com/in/jblewitt/details/certifications/1719413746906/single-media-viewer/?profileId=ACoAABNnSV0BPiMy5z3Y7_cW0HdDAuKeIs7pH0A",
    tags: [
      "Manual Testing",
      "Regression Testing",
      "Test Planning",
      "Test Execution",
    ],
  },
  {
    name: "Responsive Web Design",
    href: "https://www.freecodecamp.org/certification/fcc2927573c-68b6-4b92-954b-d97d1ea76b7f/responsive-web-design",
    tags: ["HTML", "CSS"],
  },
  {
    name: "Getting Started as a Business Analyst",
    href: "https://www.linkedin.com/learning/certificates/2780b24ee8c41fc0465b74e61e83af34af75e9bbb2d54401e76c26140726ffcb",
    tags: ["Business Analysis", "Business Strategy", "Business Process Analysis"],
  },
];

const PROJECTS = [
  {
    name: "This website",
    description: "My portfolio website.",
    href: "https://www.joshblewitt.dev/",
    tags: [
      "JavaScript",
      "Vercel",
      "Next.js",
      "Tailwind CSS",
      "Markdown",
      "Playwright",
    ],
  },
  {
    name: "Video Game API",
    description: "A RESTful API for video games.",
    href: "https://github.com/JB-26/video-game-api-nextjs",
    tags: ["TypeScript", "MongoDB", "Vercel", "Next.js", "Tailwind CSS", "DaisyUI"],
  },
  {
    name: "Haiku Check",
    description: "Is that a haiku? Check it!",
    href: "https://github.com/JB-26/haiku-check",
    tags: ["TypeScript", "Vercel", "Next.js", "Tailwind CSS", "Playwright", "Jest"],
  },
  {
    name: "Ask Astronaut",
    description: "Ask questions about space! Powered by NASA's API and Claude",
    href: "https://github.com/JB-26/ask-astronaut",
    tags: ["Claude", "AI", "TypeScript", "Bun", "Tailwind CSS", "Google Cloud"],
  },
];

const HOBBIES = [
  {
    name: "Programming",
    description: "Let's me exercise my creativity and problem-solving skills.",
  },
  {
    name: "Photography",
    description:
      "Really enjoy using my Ricoh GR IIIX HDF to capture the world around me.",
  },
  { name: "Traveling", description: "Love exploring new places and cultures." },
  { name: "Writing", description: "Getting thoughts down on paper." },
];

// Certifications and projects share a row shape: a name (and optional
// description) on the left, monochrome tag pills on the right.
function LinkedRow({ name, description, href, tags }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line py-4 no-underline"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[16px] font-semibold text-ink group-hover:text-accent">
          {name}
        </span>
        {description ? (
          <span className="text-[14.5px] leading-[1.5] text-muted">
            {description}
          </span>
        ) : null}
      </span>
      <span className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagPill key={tag} label={tag} size="xs" />
        ))}
      </span>
    </a>
  );
}

export default function Resume() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>

      <header className="max-w-[720px] pt-10 pb-2">
        <h1 className="m-0 mb-2.5 text-[clamp(30px,4vw,38px)] font-bold tracking-[-0.03em] text-ink">
          Resume
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.6] text-muted">
          Full resume available upon request as a PDF.
        </p>
      </header>

      <div
        data-testid="resume-photos"
        className="flex flex-wrap items-center justify-center gap-7 py-10"
      >
        {PHOTOS.map((photo, i) => (
          <Polaroid
            key={photo.alt}
            src={photo.src}
            alt={photo.alt}
            size={180}
            rotate={photo.rotate}
            // Exactly one priority image per page — the same rule the previous
            // version followed, preserving the recent LCP work.
            priority={i === 0}
          />
        ))}
      </div>

      <ResumeSection heading="Work experience">
        <ol className="m-0 flex list-none flex-col gap-7 p-0">
          {WORK.map(({ company, role, dates, blurb }) => (
            <li key={company} className="border-l-2 border-line pl-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="m-0 text-[17px] font-semibold text-ink">
                  {company}
                </h3>
                <span className="font-mono text-[12.5px] whitespace-nowrap text-faint">
                  {dates}
                </span>
              </div>
              <p className="m-0 mt-1 text-[15px] font-semibold text-accent">
                {role}
              </p>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.6] text-muted">
                {blurb}
              </p>
            </li>
          ))}
        </ol>
      </ResumeSection>

      <ResumeSection heading="Certifications">
        <div className="flex flex-col">
          {CERTIFICATIONS.map((cert) => (
            <LinkedRow key={cert.name} {...cert} />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection heading="Projects">
        <div className="flex flex-col">
          {PROJECTS.map((project) => (
            <LinkedRow key={project.name} {...project} />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection heading="Hobbies">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {HOBBIES.map(({ name, description }) => (
            <div key={name} className="flex flex-col gap-1">
              <h3 className="m-0 text-[16px] font-semibold text-ink">{name}</h3>
              <p className="m-0 text-[14.5px] leading-[1.5] text-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </ResumeSection>
    </Layout>
  );
}
