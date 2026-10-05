import { lazy, Suspense } from "react";
import { AnimatePresence } from "motion/react";
import { useIntroOpen } from "./introState";

const IntroDialog = lazy(() => import("./index"));

/*
  Mounted once in RootLayout. While the intro is not completed it lazy-loads and shows the dialog; everyone who finished or skipped it never downloads its code.
*/
export default function IntroGate() {
  const open = useIntroOpen();

  return (
    <AnimatePresence>
      {open && (
        <Suspense key="intro" fallback={null}>
          <IntroDialog />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
