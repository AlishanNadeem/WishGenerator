"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { WishesPage, WishRecord } from "@/types/wish";

type AuthState = "checking" | "authed" | "anon";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

type FetchWishesResult =
  | { status: "ok"; data: WishesPage }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

async function fetchWishesPage(page: number, search: string): Promise<FetchWishesResult> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (search) {
      params.set("search", search);
    }

    const response = await fetch(`/api/wishes?${params.toString()}`, { cache: "no-store" });

    if (response.status === 401) {
      return { status: "unauthorized" };
    }

    if (!response.ok) {
      return { status: "error", message: "Could not load wishes. Please try again." };
    }

    const data = (await response.json()) as WishesPage;
    return { status: "ok", data };
  } catch {
    return { status: "error", message: "Could not load wishes. Please check your connection." };
  }
}

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function applyWishesResult(result: FetchWishesResult) {
    if (result.status === "unauthorized") {
      setAuthState("anon");
      return;
    }

    if (result.status === "error") {
      setLoadError(result.message);
      setAuthState("authed");
      return;
    }

    setWishes(result.data.wishes);
    setTotal(result.data.total);
    setTotalPages(result.data.totalPages);
    setLoadError("");
    setAuthState("authed");
  }

  async function loadWishes() {
    setIsLoading(true);
    const result = await fetchWishesPage(page, search);
    applyWishesResult(result);
    setIsLoading(false);
  }

  // Debounce the raw search input before it triggers a server request.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch (or re-fetch) whenever the page or the debounced search term changes.
  useEffect(() => {
    let ignore = false;

    // Data-fetching effect: the loading flag is set from within the async
    // resolution below, not synchronously in the effect body.
    Promise.resolve().then(() => {
      if (!ignore) setIsLoading(true);
    });

    fetchWishesPage(page, search).then((result) => {
      if (!ignore) {
        applyWishesResult(result);
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [page, search]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setLoginError(data.error || "Incorrect password.");
        return;
      }

      setPassword("");
      setAuthState("checking");
      setPage(1);
      await loadWishes();
    } catch {
      setLoginError("Could not sign in. Please try again.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setWishes([]);
    setAuthState("anon");
  }

  async function handleToggleFlag(wishItem: WishRecord) {
    const nextFlagged = !wishItem.flagged;

    setWishes((prev) =>
      prev.map((item) => (item.id === wishItem.id ? { ...item, flagged: nextFlagged } : item))
    );
    setLoadError("");

    try {
      const response = await fetch(`/api/wishes/${wishItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged: nextFlagged }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flag.");
      }
    } catch {
      setWishes((prev) =>
        prev.map((item) =>
          item.id === wishItem.id ? { ...item, flagged: wishItem.flagged } : item
        )
      );
      setLoadError("Could not update the flag. Please try again.");
    }
  }

  async function handleDelete(wishItem: WishRecord) {
    const confirmed = window.confirm(
      `Delete the wish from "${wishItem.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoadError("");

    try {
      const response = await fetch(`/api/wishes/${wishItem.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete wish.");
      }

      // If this was the last item on a page beyond the first, step back a page;
      // otherwise just refresh the current page from the server.
      if (wishes.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadWishes();
      }
    } catch {
      setLoadError("Could not delete the wish. Please try again.");
    }
  }

  if (authState === "checking") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center">
        <p className="font-body text-[var(--color-cream)]/70">Loading&hellip;</p>
      </main>
    );
  }

  if (authState === "anon") {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[var(--color-gold)]/20 bg-black/15 p-6 sm:p-8"
        >
          <h1 className="font-display text-2xl text-[var(--color-cream)]">Admin Access</h1>
          <p className="font-body text-sm text-[var(--color-cream)]/60">
            Enter the admin password to view submitted Salgirah wishes.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoFocus
            className="rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-emerald-950)]/60 px-4 py-3 font-body text-[var(--color-cream)] outline-none focus:border-[var(--color-gold)]"
          />
          {loginError && <p className="font-body text-sm text-red-300">{loginError}</p>}
          <button
            type="submit"
            className="rounded-full bg-[var(--color-gold)] px-6 py-3 font-body text-sm font-semibold tracking-[0.15em] text-[var(--color-emerald-950)] uppercase transition hover:bg-[var(--color-gold-soft)]"
          >
            Sign In
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-cream)] sm:text-3xl">
            Submitted Wishes
          </h1>
          <p className="font-body text-sm text-[var(--color-cream)]/60">
            {total} wish{total === 1 ? "" : "es"} received
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-[var(--color-gold)]/40 px-5 py-2 font-body text-sm text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/10"
        >
          Log Out
        </button>
      </div>

      <input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search by name..."
        className="w-full rounded-lg border border-[var(--color-gold)]/30 bg-[var(--color-emerald-950)]/60 px-4 py-2 font-body text-[var(--color-cream)] outline-none focus:border-[var(--color-gold)] sm:max-w-sm"
      />

      {loadError && <p className="font-body text-sm text-red-300">{loadError}</p>}
      {isLoading && (
        <p className="font-body text-sm text-[var(--color-cream)]/50">Loading&hellip;</p>
      )}

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-4 sm:hidden">
        {wishes.map((wishItem) => (
          <div
            key={wishItem.id}
            className={`rounded-xl border p-4 ${
              wishItem.flagged
                ? "border-red-400/40 bg-red-500/10"
                : "border-[var(--color-gold)]/20 bg-black/15"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg text-[var(--color-cream)]">{wishItem.name}</p>
                {wishItem.flagged && (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-body text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                    Flagged
                  </span>
                )}
              </div>
              <p className="font-body text-xs whitespace-nowrap text-[var(--color-cream)]/50">
                {new Date(wishItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="mt-2 font-body text-sm whitespace-pre-wrap text-[var(--color-cream)]/85">
              {wishItem.wish}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleToggleFlag(wishItem)}
                className="flex-1 rounded-full border border-[var(--color-gold)]/40 px-3 py-1.5 font-body text-xs text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/10"
              >
                {wishItem.flagged ? "Unflag" : "Flag"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(wishItem)}
                className="flex-1 rounded-full border border-red-400/40 px-3 py-1.5 font-body text-xs text-red-300 transition hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!isLoading && wishes.length === 0 && (
          <p className="rounded-xl border border-[var(--color-gold)]/20 bg-black/15 px-4 py-6 text-center font-body text-sm text-[var(--color-cream)]/50">
            No wishes found.
          </p>
        )}
      </div>

      {/* Tablet and up: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--color-gold)]/20 sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left font-body text-sm">
          <thead>
            <tr className="border-b border-[var(--color-gold)]/20 text-[var(--color-gold)] uppercase tracking-wide">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Wish</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishes.map((wishItem) => (
              <tr
                key={wishItem.id}
                className={`border-b align-top text-[var(--color-cream)]/90 ${
                  wishItem.flagged
                    ? "border-red-400/20 bg-red-500/10"
                    : "border-[var(--color-gold)]/10"
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {wishItem.name}
                    {wishItem.flagged && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-body text-[10px] font-semibold tracking-wide text-red-300 uppercase">
                        Flagged
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-pre-wrap">{wishItem.wish}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--color-cream)]/60">
                  {new Date(wishItem.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(wishItem)}
                      className="rounded-full border border-[var(--color-gold)]/40 px-3 py-1 font-body text-xs whitespace-nowrap text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/10"
                    >
                      {wishItem.flagged ? "Unflag" : "Flag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(wishItem)}
                      className="rounded-full border border-red-400/40 px-3 py-1 font-body text-xs whitespace-nowrap text-red-300 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && wishes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-cream)]/50">
                  No wishes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 font-body text-sm text-[var(--color-cream)]/70">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || isLoading}
            className="rounded-full border border-[var(--color-gold)]/30 px-4 py-2 text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages || isLoading}
            className="rounded-full border border-[var(--color-gold)]/30 px-4 py-2 text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
