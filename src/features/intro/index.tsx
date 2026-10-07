import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store";
import { INTRO_PAGES } from "./introPages";
import { completeIntro } from "./introState";
import { useIntroNavigation } from "./hooks/useIntroNavigation";
import { useIntroKeyboard } from "./hooks/useIntroKeyboard";
import PaginationDots from "./components/pagination-dots";
import IntroControls from "./components/intro-controls";

const PAGE_LABELS = INTRO_PAGES.map((page) => page.label);

/* A page slides in from the side it comes from. */
const SLIDE_VARIANTS = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -32 }),
};

/*
  The intro dialog: backdrop, card, the current page, and the controls that stay on top of it (pagination dots, skip, back / next). IntroGate renders it only while settings.introCompleted is false, so finishing or skipping is just completeIntro().
*/
export default function IntroDialog() {
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const nav = useIntroNavigation(INTRO_PAGES.length);
  const page = INTRO_PAGES[nav.index];
  const Page = page.Component;

  useIntroKeyboard({
    onNext: nav.next,
    onBack: nav.back,
    onSkip: completeIntro,
  });

  const handleNext = () => {
    if (nav.isLast) completeIntro();
    else nav.next();
  };

  const slideDuration = reducedMotion ? 0 : 0.2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: slideDuration }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4 pb-10 backdrop-blur-[6px]"
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Chaidoro introduction"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{
          duration: reducedMotion ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="bg-brown-50 dark:bg-dark-600 border-brown-200 shadow-brown-900/20 relative h-full max-h-144 w-full max-w-4xl rounded-3xl border shadow-2xl dark:border-black dark:shadow-black"
      >
        {/* The page: everything inside the card changes with each step */}
        <div className="h-full w-full overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait" custom={nav.direction} initial={false}>
            <motion.div
              key={page.id}
              custom={nav.direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: slideDuration, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Page step={nav.index + 1} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls: they stay on top while the pages change */}
        <div className="absolute right-6 bottom-6">
          <IntroControls
            isFirst={nav.isFirst}
            isLast={nav.isLast}
            onBack={nav.back}
            onNext={handleNext}
            onSkip={completeIntro}
          />
        </div>
        {/* Sits on the card's bottom edge, under the column divider */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <PaginationDots
            labels={PAGE_LABELS}
            current={nav.index}
            onSelect={nav.goTo}
          />
        </div>
      </motion.section>
    </motion.div>
  );
}
