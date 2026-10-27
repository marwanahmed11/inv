import { invitation } from "@/config/invitation";

const pad = (n: number) => String(n).padStart(2, "0");

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** RFC 5545 line folding at 75 octets (ASCII-safe approximation by characters). */
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
};

/**
 * Builds an .ics file. The start time is a floating local time bound to the
 * Africa/Cairo TZID, with a VTIMEZONE describing Egypt's DST rules.
 * No end time is set because none has been confirmed.
 */
export function buildIcs(): string {
  const { event, venue, couple } = invitation;
  const s = event.startsAtLocal;
  const dt = `${s.year}${pad(s.month)}${pad(s.day)}T${pad(s.hour)}${pad(s.minute)}00`;
  const now = new Date();
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mohamed and Rawan//Engagement Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    `TZID:${event.timeZone}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0300",
    "TZNAME:EEST",
    "DTSTART:19700101T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=-1FR",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0200",
    "TZNAME:EET",
    "DTSTART:19701030T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1FR",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:engagement-${dt}@mohamed-rawan.invitation`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${event.timeZone}:${dt}`,
    `SUMMARY:${escapeText(`${couple.first} & ${couple.second} - ${event.title}`)}`,
    `LOCATION:${escapeText(`${venue.name}, ${venue.area}`)}`,
    `DESCRIPTION:${escapeText(
      `${event.setting}. Starts at ${event.timeLabel} (${event.timeNote}).\nDirections: ${venue.mapsUrl}`,
    )}`,
    `URL:${venue.mapsUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/**
 * One-tap links for web calendars. No end time has been confirmed, so the
 * event is created with end = start; guests can adjust it in their calendar.
 */
export function calendarLinks() {
  const { event, venue, couple } = invitation;
  const s = event.startsAtLocal;
  const local = `${s.year}${pad(s.month)}${pad(s.day)}T${pad(s.hour)}${pad(s.minute)}00`;
  const title = `${couple.first} & ${couple.second} - ${event.title}`;
  const location = `${venue.name}, ${venue.area}`;
  const details = `${event.setting}. Starts at ${event.timeLabel} (${event.timeNote}).\nDirections: ${venue.mapsUrl}`;

  const google =
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${local}/${local}`,
      ctz: event.timeZone,
      location,
      details,
    }).toString();

  const outlook =
    "https://outlook.live.com/calendar/0/action/compose?" +
    new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: title,
      startdt: event.startsAtISO,
      enddt: event.startsAtISO,
      location,
      body: details,
    }).toString();

  return { google, outlook };
}

export function downloadIcs() {
  const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Mohamed-and-Rawan-Engagement.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
