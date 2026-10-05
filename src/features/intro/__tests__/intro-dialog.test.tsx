import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import IntroDialog from "../index";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    settings: { get: vi.fn(), put: vi.fn(() => Promise.resolve()) },
  },
}));

function openIntro() {
  // Reduced motion: page transitions finish at once
  useAppStore.setState({
    status: "idle",
    settings: {
      ...DEFAULT_SETTINGS,
      introCompleted: false,
      reducedMotion: true,
    },
  });
  render(<IntroDialog />);
}

const heading = (name: string) => screen.findByRole("heading", { name });

const savedIntroFlag = () =>
  vi
    .mocked(db.settings.put)
    .mock.calls.map(([row]) => row.introCompleted)
    .at(-1);

describe("IntroDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts on the first page", async () => {
    openIntro();
    expect(await heading("Intro & setup")).toBeInTheDocument();
    expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
  });

  it("moves with next, back and the pagination dots", async () => {
    openIntro();

    fireEvent.click(screen.getByLabelText("Next page"));
    expect(await heading("How it works")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(await heading("Intro & setup")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("4. Appearance"));
    expect(await heading("Make it yours")).toBeInTheDocument();
  });

  it("moves with the arrow keys", async () => {
    openIntro();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(await heading("How it works")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(await heading("Intro & setup")).toBeInTheDocument();
  });

  it("skip completes the intro and saves it", async () => {
    openIntro();
    fireEvent.click(screen.getByText("skip"));

    await waitFor(() =>
      expect(useAppStore.getState().settings.introCompleted).toBe(true)
    );
    expect(savedIntroFlag()).toBe(true);
  });

  it("Escape skips too", async () => {
    openIntro();
    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() =>
      expect(useAppStore.getState().settings.introCompleted).toBe(true)
    );
  });

  it("finishes with Let's go on the last page", async () => {
    openIntro();
    fireEvent.click(screen.getByLabelText("6. Notifications"));
    expect(await heading("Stay in the loop")).toBeInTheDocument();
    expect(screen.queryByText("skip")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /let's go/i }));
    await waitFor(() =>
      expect(useAppStore.getState().settings.introCompleted).toBe(true)
    );
  });

  it("saves setup choices as they are made", async () => {
    openIntro();
    fireEvent.click(screen.getByLabelText("4. Appearance"));
    await heading("Make it yours");

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    await waitFor(() =>
      expect(useAppStore.getState().settings.theme).toBe("dark")
    );

    fireEvent.click(screen.getByLabelText("5. Timer"));
    await heading("Your rhythm");
    fireEvent.click(screen.getByRole("button", { name: /deep work/i }));
    await waitFor(() =>
      expect(useAppStore.getState().settings.focusDuration).toBe(3000)
    );
    // Still open: setup choices never close the intro
    expect(useAppStore.getState().settings.introCompleted).toBe(false);
  });
});
