"use client";

import { useState } from "react";

type Wish = { id: string; name: string; message: string; at: string; status: "pending" | "approved" | "hidden" };

const badge: Record<Wish["status"], string> = {
  pending: "bg-rose/40 text-wine",
  approved: "bg-wine text-ivory",
  hidden: "bg-wine/10 text-wine/60",
};

/** Private moderation page: the password lives only in this tab's memory. */
export default function AdminWishes() {
  const [password, setPassword] = useState("");
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(extra: Partial<{ id: string; status: Wish["status"] }> = {}) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/wishes/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setWishes(data.wishes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "border border-wine/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-wine transition hover:bg-wine hover:text-ivory disabled:opacity-40";
  const pending = wishes?.filter((w) => w.status === "pending").length ?? 0;

  return (
    <main className="min-h-screen bg-blush px-5 py-16 text-wine">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow text-center text-rose-deep">Private</p>
        <h1 className="mt-3 text-center font-script text-6xl text-wine-soft">Wishes</h1>

        {!wishes ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              call();
            }}
            className="mx-auto mt-10 max-w-sm border border-wine/30 bg-ivory p-8"
          >
            <label className="eyebrow block text-[0.68rem] text-rose-deep">
              Admin password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="mt-3 w-full border-0 border-b border-wine/30 bg-transparent px-1 py-2 text-lg focus:border-wine focus:outline-none"
              />
            </label>
            <button type="submit" disabled={busy} className="btn-wine mt-8 w-full">
              {busy ? "Checking" : "Open"}
            </button>
            <p role="alert" className="mt-4 min-h-[1.5rem] text-center">
              {error}
            </p>
          </form>
        ) : (
          <>
            <p className="mt-6 text-center text-lg italic">
              {wishes.length} {wishes.length === 1 ? "wish" : "wishes"} &middot; {pending} waiting for approval
            </p>
            <p role="alert" className="mt-2 min-h-[1.5rem] text-center">
              {error}
            </p>
            {wishes.length === 0 && (
              <p className="mt-10 text-center text-xl italic text-wine/70">No wishes yet.</p>
            )}
            <ul className="mt-6 space-y-4">
              {wishes.map((w) => (
                <li key={w.id} className="border border-wine/25 bg-ivory p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xl font-semibold">{w.name}</p>
                    <span className={`px-3 py-1 text-xs uppercase tracking-[0.18em] ${badge[w.status]}`}>{w.status}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-lg italic">&ldquo;{w.message}&rdquo;</p>
                  <p className="mt-2 text-sm text-wine/60">{w.at}</p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      className={btn}
                      disabled={busy || w.status === "approved"}
                      onClick={() => call({ id: w.id, status: "approved" })}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={btn}
                      disabled={busy || w.status === "hidden"}
                      onClick={() => call({ id: w.id, status: "hidden" })}
                    >
                      Hide
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
