"use client";

import { forwardRef, useLayoutEffect, useRef } from "react";

export const CARD_WIDTH = 540;
export const CARD_HEIGHT = 675;

interface WishCardProps {
  name: string;
  wish: string;
}

function GoldDivider() {
  return (
    <div className="flex shrink-0 items-center justify-center gap-3 text-[var(--color-gold)]">
      <span className="h-px w-14 bg-current/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current" />
      <span className="h-px w-14 bg-current/60" />
    </div>
  );
}

function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`h-8 w-8 text-[var(--color-gold)] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 3 H37 M3 3 V37" strokeOpacity={0.7} />
      <path d="M3 13 H21 M13 3 V21" strokeOpacity={0.45} />
      <circle cx="3" cy="3" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MAX_QUOTE_SIZE = 28;
const MIN_QUOTE_SIZE = 14;

export const WishCard = forwardRef<HTMLDivElement, WishCardProps>(function WishCard(
  { name, wish },
  ref
) {
  const displayName = name.trim() || "Your Name";
  const displayWish =
    wish.trim() || "Your heartfelt Salgirah wish for Mawlana Hazir Imam will appear here.";

  const quoteAreaRef = useRef<HTMLDivElement>(null);
  const quoteTextRef = useRef<HTMLParagraphElement>(null);

  // Grow the quote as large as will fit in the middle band, then keep it centered.
  useLayoutEffect(() => {
    const area = quoteAreaRef.current;
    const text = quoteTextRef.current;
    if (!area || !text) return;

    let cancelled = false;

    async function fitQuote() {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
      if (cancelled || !area || !text) return;

      let size = MAX_QUOTE_SIZE;
      text.style.fontSize = `${size}px`;
      text.style.lineHeight = "1.35";

      while (size > MIN_QUOTE_SIZE && text.scrollHeight > area.clientHeight) {
        size -= 0.5;
        text.style.fontSize = `${size}px`;
      }
    }

    fitQuote();

    return () => {
      cancelled = true;
    };
  }, [displayWish]);

  return (
    <div
      ref={ref}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="wish-card-surface relative shrink-0 overflow-hidden text-[var(--color-cream)]"
    >
      <CornerOrnament className="absolute top-4 left-4" />
      <CornerOrnament className="absolute top-4 right-4 -scale-x-100" />
      <CornerOrnament className="absolute bottom-4 left-4 -scale-y-100" />
      <CornerOrnament className="absolute bottom-4 right-4 -scale-x-100 -scale-y-100" />

      <div className="pointer-events-none absolute inset-[14px] border border-[var(--color-gold)]/35" />

      <div className="relative z-10 flex h-full flex-col px-10 pt-9 pb-8 text-center">
        <div className="shrink-0 space-y-1.5">
          <p className="font-body text-sm font-semibold tracking-[0.4em] text-[var(--color-gold)] uppercase">
            Salgirah Mubarak
          </p>
          <h1 className="font-display leading-[1.15] text-[var(--color-cream)]">
            <span className="block text-sm tracking-[0.1em] text-[var(--color-gold-soft)] uppercase">
              His Highness
            </span>
            <span className="block text-[2.15rem]">Prince Rahim</span>
            <span className="block text-[2.15rem]">Aga Khan V</span>
          </h1>
          <p className="font-body text-[10px] tracking-[0.3em] text-[var(--color-gold-soft)] uppercase">
            12th October
          </p>
        </div>

        <div className="mt-3 mb-2 shrink-0">
          <GoldDivider />
        </div>

        <div
          ref={quoteAreaRef}
          className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-0.5"
        >
          <p
            ref={quoteTextRef}
            className="font-display w-full text-[var(--color-cream)]/95 italic"
            style={{
              fontSize: `${MAX_QUOTE_SIZE}px`,
              lineHeight: 1.35,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            &ldquo;{displayWish}&rdquo;
          </p>
        </div>

        <div className="mt-2 shrink-0 space-y-1">
          <GoldDivider />
          <p className="font-body pt-1 text-[11px] tracking-[0.28em] text-[var(--color-gold)] uppercase">
            With Love &amp; Unity
          </p>
          <p className="font-display max-w-full break-words text-xl leading-tight text-[var(--color-cream)]">
            {displayName}
          </p>
        </div>
      </div>
    </div>
  );
});
