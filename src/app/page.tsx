import { WishStudio } from "@/components/WishStudio";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-10 sm:py-16">
      <header className="flex flex-col items-center gap-3 text-center sm:gap-4">
        <p className="font-body text-[10px] tracking-[0.3em] text-[var(--color-gold)] uppercase sm:text-xs sm:tracking-[0.5em]">
          One Jamat &middot; 12th October
        </p>
        <h1 className="font-display text-4xl leading-tight text-[var(--color-cream)] sm:text-6xl">
          Salgirah Mubarak
        </h1>
        <p className="max-w-xl font-body text-sm text-[var(--color-cream)]/75 sm:text-base">
          Celebrate the birthday of Mawlana Hazir Imam, Prince Rahim Aga Khan V. Write your
          personal wish below and download a keepsake card to share.
        </p>
      </header>

      <WishStudio />
    </main>
  );
}
