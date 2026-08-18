import SectionHeading from "./section-heading";
import { ChevronRight } from "lucide-react";
import chainet_logo from "@/assets/svg/chainet_logo.svg";
export default function IntroductionSection() {
  return (
    <section id="introduction" className="scroll-mt-9">
      <section className="flex w-full items-center justify-between">
        <div>
          <SectionHeading>Chaidoro</SectionHeading>
          <p className="font-poppins text-base font-light tracking-wide">
            /ˌtʃaɪˈdɔːroʊ/
          </p>
        </div>
        <a
          href="https://github.com/plwtx/chaidoro"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="fill-brown-600 dark:fill-brown-300 size-6 cursor-pointer stroke-0"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>GitHub</title>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
      </section>
      <p className="mt-3 leading-6">
        A focus timer. Chaidoro is a progress tracking, customizable, focus
        timer that works on your browser's local storage. It is designed to help
        you split long work into shorter focus intervals. Hopefully to help you
        get over procrastination and be more productive.
      </p>
      {/* Banner */}
      <a
        href="https://chainet.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brown-200/90 group dark:bg-dark-900 shadow-brown-600 relative mt-3 flex w-full cursor-pointer items-center justify-between gap-3 overflow-clip rounded-3xl px-9 py-3 shadow-sm transition-all hover:pr-6 dark:shadow-black dark:hover:bg-black/50"
      >
        <div className="z-10 flex w-full items-center justify-start gap-3">
          <img
            className="w-12 opacity-85 invert dark:brightness-75 dark:invert-0"
            src={chainet_logo}
            alt="Logo of Chainet"
          />
          <div>
            <h2 className="font-poppins">
              Chaidoro is a <span className="font-semibold">ChaiNET</span>{" "}
              project.
            </h2>
            <p className="text-xs">for more information visit chainet.dev</p>
          </div>
        </div>
        <ChevronRight className="z-10" />
        {/* absolutes */}
        <div className="bg-brown-400 dark:bg-brown-600 absolute top-1/2 -right-12 z-0 size-36 -translate-y-1/2 rounded-full blur-3xl transition-transform group-hover:-translate-x-9" />
      </a>
    </section>
  );
}
