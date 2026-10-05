import { useState } from "react";
import { useAppStore } from "@/store";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import HeaderDescription from "@/components/ui/header-description";
import AutomationToggle from "../components/automation-toggle";
import { showSettingsToast } from "../components/settings-toast";
import { cn } from "@/lib/utils";
import UserNotice from "../components/user-notice";
import ReplayIntroRow from "../components/replay-intro-row";

export default function General() {
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const dynamicTitlebar = useAppStore((s) => s.settings.dynamicTitlebar);
  const titlebarSeparator = useAppStore((s) => s.settings.titlebarSeparator);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [separatorDraft, setSeparatorDraft] = useState(titlebarSeparator);

  return (
    <>
      <main>
        <UserNotice />
        <HeaderDescription
          header={"General application settings"}
          description={
            "General settings that control the behavior of application itself. You can find accessibility related settings and more."
          }
          kaomoji={null}
        />
        <HorizontalDivider />
        <section className="mt-6 flex flex-col gap-6">
          <AutomationToggle
            label="Reduced motion"
            description="Disables animations, smoothed transitions and keeps the app minimal."
            checked={reducedMotion}
            onChange={() => {
              updateSettings({ reducedMotion: !reducedMotion });
              showSettingsToast(
                `Reduced motion ${reducedMotion ? "disabled" : "enabled"}.`
              );
            }}
          />
          <section className="flex h-full w-full justify-between">
            {/* CHAIN LINK */}
            <div
              className={cn(
                "bg-brown-500 dark:bg-dark-100 w-0 origin-top -translate-x-9 rounded-full transition-all delay-75 duration-500 ease-in-out",
                dynamicTitlebar && "mx-3 w-1 translate-x-0"
              )}
            ></div>
            {/* Dynamic titlebar */}
            <div className="flex h-fit w-full flex-col gap-3">
              <AutomationToggle
                label="Dynamic titlebar"
                description="Dynamic titlebar that shows time + mode."
                checked={dynamicTitlebar}
                onChange={() => {
                  updateSettings({ dynamicTitlebar: !dynamicTitlebar });
                  showSettingsToast(
                    `Dynamic titlebar ${dynamicTitlebar ? "disabled" : "enabled"}.`
                  );
                }}
              />
              {/* Custom titlebar seperator */}
              <section
                className={cn(
                  "pointer-events-none -z-10 -translate-y-9 touch-none opacity-0 transition-all duration-500 ease-in-out",
                  dynamicTitlebar &&
                    "pointer-events-auto z-10 translate-y-0 touch-auto opacity-100"
                )}
              >
                <div className="text-brown-900 dark:text-dark-100 flex w-full items-center justify-between">
                  <div className="text-base">
                    <h3 className="font-semibold">Custom titlebar separator</h3>
                    <p className="text-xs opacity-75">
                      Separates time and mode in the titlebar. You can choose
                      from: <br />
                      <span className="font-mono text-xs">
                        🕂 🕇 ❖ ✼ ✤ ✡ ✢ ✣ ⛨ ⚇ ⚜ ⚨ ⚧ ⚢ ♨ ☭ ☧ ☮ ☯☣ 🞬{" "}
                      </span>{" "}
                      <br />
                      {/* <span className="font-mono text-[9px]">
                    * I HAVE NO IDEA WHAT THOSE SYMBOLS ABOVE MEAN ＼(٥⁀▽⁀ )／
                  </span> */}
                    </p>
                  </div>
                  <div className="flex h-9 w-fit items-center justify-center gap-2">
                    <input
                      type="text"
                      value={separatorDraft}
                      maxLength={5}
                      onChange={(e) => setSeparatorDraft(e.target.value)}
                      className="bg-brown-100 dark:bg-dark-900/75 text-brown-900 dark:text-dark-100 shadow-brown-500 border-brown-300 h-full w-16 rounded-xl border px-3 py-1 text-center font-mono text-xs shadow-inner outline-none dark:border-black dark:shadow-black"
                      aria-label="Titlebar separator"
                    />
                    <button
                      onClick={() => {
                        const value = separatorDraft || "-";
                        setSeparatorDraft(value);
                        updateSettings({ titlebarSeparator: value });
                        showSettingsToast(
                          "Titlebar seperator saved as: " + value
                        );
                      }}
                      className="border-brown-200/75 shadow-brown-300 dark:bg-dark-900/45 bg-brown-100 dark:border-dark-900 hover:bg-brown-200/55 flex h-full w-32 cursor-pointer items-center justify-between gap-6 rounded-lg border p-2 px-4 text-left text-sm font-medium shadow-sm transition-all duration-150 ease-in-out active:scale-95 dark:shadow-black hover:dark:bg-black/50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </section>
          <HorizontalDivider />
          {/* First-run intro */}
          <ReplayIntroRow />
        </section>
      </main>
    </>
  );
}
