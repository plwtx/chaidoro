import SectionHeading from "./section-heading";
import DevelopmentRoadmap from "./development-roadmap";
import StageDetail from "./stage-detail";
import { ROADMAP } from "./roadmap";

const GITHUB_ISSUES_URL = "https://github.com/plwtx/chai.study/issues";
const CONTACT_EMAIL = "dev@chaidoro.study";

export default function DevelopmentSection() {
  return (
    <section id="development" className="scroll-mt-9">
      <SectionHeading>Development</SectionHeading>
      <div className="mt-3 flex flex-col gap-3 leading-6">
        <p>
          The app is at very early stages and still under development. Hence it
          is possible to encounter bugs and issues. I would ask you to either
          submit a{" "}
          <a
            href={GITHUB_ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            className="text-brown-900 dark:text-dark-100 underline-offset-2 hover:underline"
          >
            GitHub issue
          </a>{" "}
          or (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-brown-900 dark:text-dark-100 underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          ) mail me any bugs issues you encounter so I can fix them. Thank you
          in advance.
        </p>
        <DevelopmentRoadmap />
        {/* Stage informations */}
        {ROADMAP.map((stage) => (
          <StageDetail key={stage.number} stage={stage} />
        ))}
        <section>
          <SectionHeading>Contribution</SectionHeading>
          <p>
            Chaidoro is open for contributions and would welcome any input on
            direction of development.
          </p>
        </section>
      </div>
    </section>
  );
}
