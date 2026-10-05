import { useRef, useState, useEffect } from "react";
import { Upload, X, Wallpaper, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store";
import { db } from "@/db";
import SubHeaderDescription from "@/components/ui/sub-header-description";
import { showSettingsToast } from "../../components/settings-toast";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function PctInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setRaw(String(value));
  }, [value, editing]);

  const commit = () => {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(Math.max(0, Math.min(100, n)));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
        className="dark:bg-dark-100 bg-brown-200 corner-l-bevel w-16 -translate-x-3 [appearance:textfield] rounded-l-full px-2 pl-4 text-black outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setRaw(String(value));
        setEditing(true);
      }}
      className="dark:bg-dark-100 bg-brown-200 corner-l-bevel -translate-x-3 cursor-text rounded-l-full px-2 pl-4 text-black"
    >
      {String(value).padStart(2, "0")}%
    </button>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-1">
      <p className="font-black">{label}</p>
      <div className="relative ml-6 flex w-full items-center">
        <div className="bg-brown-200 dark:bg-dark-100 accent:bg-accent/25 relative h-1 w-full rounded-full">
          <div
            className="bg-brown-500 dark:bg-dark-600 accent:bg-accent absolute left-0 h-full rounded-full"
            style={{ width: `${value}%` }}
          />
          <div
            className="bg-brown-700 dark:border-dark-900 border-brown-100 pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 dark:bg-white"
            style={{ left: `${value}%`, top: "50%" }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <PctInput value={value} onChange={onChange} />
    </div>
  );
}

export default function BackgroundImageUpload() {
  const backgroundImageKey = useAppStore((s) => s.settings.backgroundImageKey);
  const backgroundOpacity = useAppStore((s) => s.settings.backgroundOpacity);
  const backgroundSaturation = useAppStore(
    (s) => s.settings.backgroundSaturation
  );
  const backgroundContrast = useAppStore((s) => s.settings.backgroundContrast);
  const setBackgroundImageKey = useAppStore((s) => s.setBackgroundImageKey);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!backgroundImageKey) {
      setPreviewUrl(null);
      return;
    }
    let url: string;
    let cancelled = false;
    db.backgroundImages.get(backgroundImageKey).then((record) => {
      if (!record || cancelled) return;
      url = URL.createObjectURL(record.blob);
      setPreviewUrl(url);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [backgroundImageKey]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 2MB.");
      return;
    }

    const startTime = Date.now();
    setIsUploading(true);
    setProgress(0);

    // Progress animation (Ofcourse it is fake, because the app is local there is no upload dumbass :P)
    const intervalId = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + 2));
    }, 20);

    // Delete old image if one exists
    if (backgroundImageKey) {
      await db.backgroundImages.delete(backgroundImageKey);
    }

    // Store in IndexedDB
    const key = await db.backgroundImages.add({
      blob: file,
      createdAt: Date.now(),
    });
    await setBackgroundImageKey(key as number);

    clearInterval(intervalId);

    // 1 second of loading bar, why not.
    const elapsed = Date.now() - startTime;
    if (elapsed < 1000) {
      await new Promise((r) => setTimeout(r, 1000 - elapsed));
    }

    setProgress(100);
    await new Promise((r) => setTimeout(r, 300));
    setIsUploading(false);
    setProgress(0);

    showSettingsToast("Background image updated.");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleRemoveBackground = async () => {
    if (backgroundImageKey) {
      await db.backgroundImages.delete(backgroundImageKey);
      await setBackgroundImageKey(null);
      showSettingsToast("Background image removed.");
    }
  };

  return (
    <section>
      <SubHeaderDescription
        header={"Background image"}
        description={
          "Set a custom background image for the clock screen. You can control the opacity and saturation of the background image so it fits as you wish. (Please keep in mind that due to the apps brownish colors it is advised to keep the opacity below ~65%.)"
        }
      />

      <div className="relative flex h-96 w-full items-end justify-center gap-3 py-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* D&Drop zone  preview when an image is loaded */}
        {previewUrl ? (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "shadow-brown-300 group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed shadow-inner dark:shadow-black",
              isDragging
                ? "border-brown-500 dark:border-dark-100"
                : "border-brown-600 dark:border-black"
            )}
          >
            {/* Preview: image layer */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                filter: `saturate(${backgroundSaturation}%) contrast(${backgroundContrast * 2}%)`,
              }}
            />
            {/* Preview: color overlay with user opacity */}
            <div
              className="bg-brown-50 dark:bg-dark-600 absolute inset-0 touch-none mix-blend-screen select-none dark:mix-blend-darken"
              style={{ opacity: backgroundOpacity / 100 }}
            />
            {/* Hover cue */}
            <div className="relative z-10 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Upload className="stroke-[1px]" size={28} />
              <span className="text-sm">Replace image</span>
            </div>

            {/* Loading progress bar */}
            {isUploading && (
              <div className="bg-brown-200 dark:bg-dark-100 absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-lg">
                <div
                  className="bg-brown-500 dark:bg-dark-600 h-full transition-[width] duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "shadow-brown-300 group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-dashed p-2 px-4 shadow-inner dark:shadow-black",
              isDragging
                ? "border-brown-500 bg-brown-100/50 dark:border-dark-100 dark:bg-dark-900/50"
                : "border-brown-600 dark:border-black"
            )}
          >
            <div className="-space-y-1">
              <Upload
                className="-translate-y-9 stroke-[1px] opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-6 group-hover:opacity-100"
                size={32}
              />
              <Wallpaper
                className="stroke-[1px] opacity-100 transition-all duration-300 ease-in-out group-hover:translate-y-9 group-hover:opacity-0"
                size={32}
              />
            </div>
            {isDragging
              ? "Drop to upload."
              : "Drop image here or click to browse."}

            {/* Loading progress bar */}
            {isUploading && (
              <div className="bg-brown-200 dark:bg-dark-100 absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-lg">
                <div
                  className="bg-brown-500 dark:bg-dark-600 h-full transition-[width] duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </button>
        )}

        {backgroundImageKey && (
          <>
            {/* Opacity slider and remove background button. */}
            <section className="flex h-full w-150 flex-col items-start justify-between gap-3 pl-3">
              <div className="flex w-full flex-col gap-3">
                {/* O.S.C title and reset to default button. */}
                <section className="flex w-full items-center justify-between gap-9 py-3">
                  <SubHeaderDescription
                    header={"Opacity, Saturation & Contrast"}
                    description={
                      "Adjust opacity and saturation of the uploaded background."
                    }
                  />
                  {/* Reset to default settings button */}
                  <button
                    onClick={() =>
                      updateSettings({
                        backgroundOpacity: 84,
                        backgroundSaturation: 100,
                        backgroundContrast: 50,
                      })
                    }
                    title="Reset to defaults"
                    className="cursor-pointer opacity-60 transition-opacity hover:opacity-100"
                  >
                    <RotateCcw className="size-6" />
                  </button>
                </section>

                {/* Sliders */}
                <section className="bg-brown-100/75 border-brown-200/75 shadow-brown-200 font-fragment-mono dark:bg-dark-900 text-brown-700 dark:text-dark-100 flex w-full flex-col items-center justify-between gap-5 rounded-lg border px-6 py-6 shadow-xs dark:border-black dark:shadow-black">
                  {/* Opacity: controls the bg color (solid) */}
                  <SliderRow
                    label="OPA."
                    value={backgroundOpacity}
                    onChange={(v) => updateSettings({ backgroundOpacity: v })}
                  />
                  {/* Saturation: controls the image layer */}
                  <SliderRow
                    label="SAT."
                    value={backgroundSaturation}
                    onChange={(v) =>
                      updateSettings({ backgroundSaturation: v })
                    }
                  />
                  {/* Contrast: controls the image layer (50 = normal) */}
                  <SliderRow
                    label="CON."
                    value={backgroundContrast}
                    onChange={(v) => updateSettings({ backgroundContrast: v })}
                  />
                </section>
              </div>

              {/* Remove button */}

              <button
                onClick={handleRemoveBackground}
                className="mt-3 flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-2 px-3 text-left text-xs font-medium text-red-700 shadow-sm shadow-red-600 transition-all duration-150 hover:bg-red-100 active:scale-95 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950"
              >
                <X size={20} />
                Remove the current background.
              </button>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
