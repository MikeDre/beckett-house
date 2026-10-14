"use client";

import { OPEN_COOKIE_SETTINGS } from "../cookie-consent";

export default function CookieSettingsButton() {
  return <button className="button button-dark" type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>Change cookie settings</button>;
}
