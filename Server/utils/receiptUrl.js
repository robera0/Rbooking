const MAX_LENGTH = 500;
const INVISIBLE = /[​-‍⁠﻿ ]/g;
const URL_IN_TEXT = /(?:https?:\/\/|(?:[a-z0-9-]+\.)+[a-z]{2,}\/)[^\s"'<>]+/i;
const TRAILING_JUNK = /[.,;:!?)\]}"'>]+$/;

// Turns whatever the buyer pasted into a bare receipt link: removes spaces,
// invisible characters, wrapping quotes/brackets and trailing punctuation,
// finds the link inside a pasted message, and adds https:// when missing.
// Returns null when there is no usable link.
export function cleanReceiptUrl(input) {
  if (typeof input !== "string") return null;

  const text = input.replace(INVISIBLE, "").trim();
  const match = text.match(URL_IN_TEXT);
  if (!match) return null;

  let url = match[0].replace(TRAILING_JUNK, "");
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  if (url.length > MAX_LENGTH) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;
  } catch {
    return null;
  }
  return url;
}
