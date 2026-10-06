"use client";

import { useRef, useState, type FormEvent } from "react";
import { toPng } from "html-to-image";
import { WishCard } from "./WishCard";
import { ResponsiveCardPreview } from "./ResponsiveCardPreview";
import { MAX_NAME_LENGTH, MAX_WISH_LENGTH } from "@/types/wish";

type Step = "form" | "preview";
type Status = "idle" | "saving" | "saved" | "error";

export function WishStudio() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const exportCardRef = useRef<HTMLDivElement>(null);

  async function downloadCard() {
    const node = exportCardRef.current;
    if (!node) return;

    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }

    const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
    const safeName =
      name.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") ||
      "salgirah-wish";

    const link = document.createElement("a");
    link.download = `${safeName}-salgirah-mubarak.png`;
    link.href = dataUrl;
    link.click();
  }

  function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedWish = wish.trim();

    if (!trimmedName || !trimmedWish) {
      setStatus("error");
      setErrorMessage("Please enter both your name and your wish.");
      return;
    }

    if (trimmedName.length > MAX_NAME_LENGTH || trimmedWish.length > MAX_WISH_LENGTH) {
      setStatus("error");
      setErrorMessage("Please shorten your name or wish.");
      return;
    }

    setStatus("idle");
    setErrorMessage("");
    setStep("preview");
  }

  function handleEdit() {
    setStep("form");
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSaveAndDownload() {
    setStatus("saving");
    setErrorMessage("");

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), wish: wish.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      await downloadCard();
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {step === "form" && (
        <form
          onSubmit={handlePreview}
          className="flex flex-col gap-5 rounded-2xl border border-[var(--color-gold)]/20 bg-black/15 p-5 backdrop-blur-sm sm:gap-6 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="font-body text-sm tracking-[0.2em] text-[var(--color-gold)] uppercase"
            >
              Your Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="e.g. Alishan Karim"
              className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-emerald-950)]/60 px-4 py-3 font-body text-[var(--color-cream)] outline-none placeholder:text-[var(--color-cream)]/40 focus:border-[var(--color-gold)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="wish"
                className="font-body text-sm tracking-[0.2em] text-[var(--color-gold)] uppercase"
              >
                Your Wish
              </label>
              <span className="font-body text-xs text-[var(--color-cream)]/50">
                {wish.length}/{MAX_WISH_LENGTH}
              </span>
            </div>
            <textarea
              id="wish"
              value={wish}
              onChange={(event) => setWish(event.target.value)}
              maxLength={MAX_WISH_LENGTH}
              rows={6}
              placeholder="Write your Salgirah wish for Mawlana Hazir Imam..."
              className="resize-none rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-emerald-950)]/60 px-4 py-3 font-body text-[var(--color-cream)] outline-none placeholder:text-[var(--color-cream)]/40 focus:border-[var(--color-gold)]"
            />
          </div>

          {status === "error" && (
            <p className="font-body text-sm text-red-300">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-gold)] px-8 py-3 font-body text-sm font-semibold tracking-[0.15em] text-[var(--color-emerald-950)] uppercase transition hover:bg-[var(--color-gold-soft)] sm:w-auto"
          >
            Preview My Card
          </button>
        </form>
      )}

      {step === "preview" && (
        <div className="flex flex-col items-center gap-6">
          <ResponsiveCardPreview name={name} wish={wish} />

          {status === "error" && (
            <p className="font-body text-sm text-red-300">{errorMessage}</p>
          )}
          {status === "saved" && (
            <p className="font-body text-sm text-[var(--color-gold-soft)]">
              Saved! Your card has been downloaded &mdash; check your downloads folder.
            </p>
          )}

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-gold)] px-8 py-3 font-body text-sm tracking-[0.15em] text-[var(--color-gold)] uppercase transition hover:bg-[var(--color-gold)]/10 sm:w-auto"
            >
              Edit Wish
            </button>

            {status === "saved" ? (
              <button
                type="button"
                onClick={downloadCard}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-gold)] px-8 py-3 font-body text-sm font-semibold tracking-[0.15em] text-[var(--color-emerald-950)] uppercase transition hover:bg-[var(--color-gold-soft)] sm:w-auto"
              >
                Download Again
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndDownload}
                disabled={status === "saving"}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-gold)] px-8 py-3 font-body text-sm font-semibold tracking-[0.15em] text-[var(--color-emerald-950)] uppercase transition hover:bg-[var(--color-gold-soft)] disabled:opacity-60 sm:w-auto"
              >
                {status === "saving" ? "Saving..." : "Save & Download Card"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Off-screen full-resolution copy used only for PNG export */}
      <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
        <WishCard ref={exportCardRef} name={name} wish={wish} />
      </div>
    </section>
  );
}
