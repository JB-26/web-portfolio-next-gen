import Layout, { siteTitle } from "../components/layout";
import Footer from "../components/footer";
import Head from "next/head";
import Image from "next/image";
import photo1 from "../public/images/about_photo_3.png";
import photo2 from "../public/images/resume_1.png";
import photo3 from "../public/images/resume_2.png";

export default function Resume() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta
          charSet="utf-8"
          name="The personal website of IT Professional, Joshua Blewitt"
        />
      </Head>
      <section>
        <h1 className="text-2xl/9 font-extrabold tracking-tighter mb-3.5 md:text-3xl/9">
          Resume
        </h1>
        <div className="flex flex-row justify-center items-center sm:p-8 md:gap-0">
          <div className="relative -rotate-6 hover:rotate-0 hover:scale-105 transition-transform duration-300 md:-mr-8 z-10 md:p-4">
            <Image
              priority
              src={photo3}
              alt="Top Golf"
              width={500}
              height={500}
            />
          </div>
          <div className="relative p-4 rotate-2 hover:rotate-0 hover:scale-105 transition-transform duration-300 z-20 hidden sm:flex ">
            <Image
              priority
              src={photo2}
              alt="Natural History Museum"
              width={500}
              height={500}
            />
          </div>
          <div className="relative rotate-6 hover:rotate-0 hover:scale-105 transition-transform duration-300 md:-ml-8 z-10 md:p-4">
            <Image
              priority
              src={photo1}
              alt="Louvre"
              width={500}
              height={500}
            />
          </div>
        </div>
        <p className="font-medium text-sm mt-2.5 mb-2.5">
          Full resume available upon request in a PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-4">
          <h2 className="text-2xl/9 font-extrabold tracking-tighter md:text-2xl/9 md:mb-3.5">
            Work Experience
          </h2>
          <div className="relative pt-4 pb-4">
            {/* Vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
            {/* Timeline items container */}
            <div className="space-y-8">
              {/* Single timeline item */}
              <div className="relative pl-8">
                {/* Blue dot */}
                <div className="absolute -left-[5px] top-2 w-[11px] h-[11px] rounded-full bg-blue-500 ring-4 ring-white"></div>
                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Institute of Chartered Accountants in England and Wales
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Assessment Systems Executive
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                      <li>
                        Managed releases for key systems, defect lists and
                        resolutions, to ensure that the product meets the needs
                        of the institute.
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-nowrap">
                    August 2024 - Present
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                {/* Blue dot */}
                <div className="absolute -left-[5px] top-2 w-[11px] h-[11px] rounded-full bg-blue-500 ring-4 ring-white"></div>
                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Rightmove</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Application Analyst
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                      <li>
                        Hired to analyse business problems that would result in
                        increased revenue, inform the design and development of
                        technical solutions
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-nowrap">
                    September 2023 - April 2024
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                {/* Blue dot */}
                <div className="absolute -left-[5px] top-2 w-[11px] h-[11px] rounded-full bg-blue-500 ring-4 ring-white"></div>
                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">IQVIA</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Software Test Engineer
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                      <li>
                        Worked in an Agile team, to ensure a quality product for
                        the users, on the Human Assisted Review Tool
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-nowrap">
                    November 2021 - September 2023
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                {/* Blue dot */}
                <div className="absolute -left-[5px] top-2 w-[11px] h-[11px] rounded-full bg-blue-500 ring-4 ring-white"></div>
                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Domino&apos;s Pizza Group
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Software Test Engineer
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                      <li>
                        Championed quality for customers on Domino&apos;s
                        ecommerce platform by manually testing releases.
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-nowrap">
                    October 2016 - November 2021
                  </p>
                </div>
              </div>
              <div className="relative pl-8">
                {/* Blue dot */}
                <div className="absolute -left-[5px] top-2 w-[11px] h-[11px] rounded-full bg-blue-500 ring-4 ring-white"></div>
                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">EDW Technology</p>
                    <p className="text-sm text-gray-400 mt-1">
                      System Test Analyst
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                      <li>
                        Tested new releases of ERS (Energy Retail Suite -
                        EDW&apos;s bespoke application, written in Java) and
                        provided support to users.
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-nowrap">
                    July 2014 - October 2016
                  </p>
                </div>
              </div>
              {/* Add more timeline items here by repeating the structure above */}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-4">
          <h2 className="text-2xl/9 font-extrabold tracking-tighter md:text-2xl/9 md:mb-3.5">
            Certifications
          </h2>
          <div className="p-4">
            <div className="space-y-4">
              <div className="relative overflow-visible">
                <a
                  className="block group py-2"
                  href="https://verify.skilljar.com/c/5ah5hmesr4gq"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        AI Fluency: Framework &amp; Foundations
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        AI
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500 text-white">
                        Prompts
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://www.coursera.org/account/accomplishments/verify/LGPKX3EFN3M9"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        Digital Product Management: Modern Fundamentals
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Product
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        Innovation
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white">
                        Stakeholder Management
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://s3.amazonaws.com/scruminc-certs/RSM-8823626"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        Scrum Master
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Agile
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        Scrum
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white">
                        Team Management
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://www.linkedin.com/in/jblewitt/details/certifications/1719413746906/single-media-viewer/?profileId=ACoAABNnSV0BPiMy5z3Y7_cW0HdDAuKeIs7pH0A"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        ISTQB-BCS Certified Tester Foundation Level
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Manual Testing
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        Regression Testing
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white">
                        Test Planning
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500 text-white">
                        Test Execution
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://www.freecodecamp.org/certification/fcc2927573c-68b6-4b92-954b-d97d1ea76b7f/responsive-web-design"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        Responsive Web Design
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        HTML
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        CSS
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://www.linkedin.com/learning/certificates/2780b24ee8c41fc0465b74e61e83af34af75e9bbb2d54401e76c26140726ffcb"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        Getting Started as a Business Analyst
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Business Analysis
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        Business Strategy
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white">
                        Business Process Analysis
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-4">
          <h2 className="text-2xl/9 font-extrabold tracking-tighter md:text-2xl/9 md:mb-3.5">
            Projects
          </h2>
          <div className="p-4">
            <div className="space-y-4">
              <div className="relative overflow-visible">
                <a
                  className="block group py-2"
                  href="https://www.joshblewitt.dev/"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        This website
                      </h3>
                      <p className="text-sm text-gray-600">
                        My portfolio website.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-white">
                        JavaScript
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black text-white">
                        Vercel
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black text-white">
                        Next.js
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Tailwind CSS
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-500 text-white">
                        Markdown
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">
                        Playwright
                      </span>
                    </div>
                  </div>
                </a>
                <a
                  className="block group py-2"
                  href="https://github.com/JB-26/video-game-api-nextjs"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium text-lg text-black group-hover:text-blue-500 sm:w-96">
                        Video Game API
                      </h3>
                      <p className="text-sm text-gray-600">
                        A RESTful API for video games.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        TypeScript
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                        MongoDB
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black text-white">
                        Vercel
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-black text-white">
                        Next.js
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                        Tailwind CSS
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500 text-white">
                        DaisyUI
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-4">
          <h2 className="text-2xl/9 font-extrabold tracking-tighter md:text-2xl/9 md:mb-3.5">
            Hobbies
          </h2>
          <div className="p-4">
            <div className="space-y-4">
              <div className="relative overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <h3 className="font-medium text-lg text-black group-hover:text-blue-500">
                      Programming
                    </h3>
                    <p className="text-sm text-gray-600">
                      Let&apos;s me exercise my creativity and problem-solving
                      skills.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <h3 className="font-medium text-lg text-black group-hover:text-blue-500">
                      Photography
                    </h3>
                    <p className="text-sm text-gray-600">
                      Really enjoy using my Ricoh GR IIIX HDF to capture the
                      world around me.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <h3 className="font-medium text-lg text-black group-hover:text-blue-500">
                      Traveling
                    </h3>
                    <p className="text-sm text-gray-600">
                      Love exploring new places and cultures.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <h3 className="font-medium text-lg text-black group-hover:text-blue-500">
                      Writing
                    </h3>
                    <p className="text-sm text-gray-600">
                      Getting thoughts down on paper.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </Layout>
  );
}
