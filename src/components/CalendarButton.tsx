"use client";

import { calendarLinks, downloadIcs } from "@/lib/ics";

const { google, outlook } = calendarLinks();

/** Google and Outlook open in a new tab; Apple / other calendars get an .ics download. */
export default function CalendarButton() {
  const option =
    "inline-flex min-w-[190px] items-center justify-center gap-3 border border-wine/40 px-6 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-wine transition duration-300 hover:border-wine hover:bg-wine hover:text-ivory";
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row" role="group" aria-label="Add to calendar">
      <a href={google} target="_blank" rel="noopener noreferrer" className={option}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        Google
        <span className="sr-only"> Calendar (opens in a new tab)</span>
      </a>
      <a href={outlook} target="_blank" rel="noopener noreferrer" className={option}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        Outlook
        <span className="sr-only"> Calendar (opens in a new tab)</span>
      </a>
      <button type="button" onClick={downloadIcs} className={option}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
        Apple / Other
        <span className="sr-only"> (downloads a calendar file)</span>
      </button>
    </div>
  );
}
