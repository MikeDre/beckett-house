"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNursery, nurseryNames, readNurseryChoice, rememberNursery, useNurseryChangeListener, useActiveNursery, useNurseryChoice, useSwitchNursery } from "./nursery-choice";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Viewer as PhotoSphereViewer } from "@photo-sphere-viewer/core";
import { locations, type Location } from "../lib/content";
import { Turnstile, TURNSTILE_SITE_KEY, postForm } from "./turnstile";
import {
  GOOGLE_MAPS_API_KEY,
  calmGoogleMapStyles,
  capGoogleMapZoom,
  createGoogleHtmlMarker,
  loadGoogleMaps,
  observeNearViewport,
  subscribeToGoogleMapsAuthFailure,
  type GoogleHtmlMarker,
  type GoogleMap,
  type GoogleMapsApi,
} from "./google-maps";

// CARTO basemaps now watermark keyless requests, so use standard OSM tiles.
const MAP_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const navItems = [
  { title: "FAQ", href: "/faq" },
  { title: "Register", href: "/register" },
];

const aboutItems = [
  { title: "About Beckett House", href: "/beckett-house", image: "/images/children-circle-time.jpg", description: "Get to know our family-run, Montessori-accredited preschool, individual care and home-cooked food." },
  { title: "History", href: "/history", image: "/images/angel/montessori-nursery-angel-classroom-and-kitchen.webp", description: "Discover our beginnings in Barnsbury in 1996 and the home-from-home care that sets Beckett House apart." },
  { title: "About Montessori", href: "/montessori", image: "/images/angel/montessori-nursery-angel-sensorial-corner.webp", description: "Explore Montessori’s prepared environment, hands-on materials and freedom to learn independently." },
];

const nurseryLifeItems = [
  { title: "Virtual Tour", href: "/virtual-tour", image: "/images/angel/montessori-nursery-angel-classroom-reading-area.webp", description: "Step inside Angel and Abbey Road with interactive 360° views of our nursery spaces." },
  { title: "Gallery", href: "/gallery", image: "/images/abbey-road/main-room-2.webp", description: "Browse photos of our Angel and Abbey Road classrooms and spaces." },
];

const timetableItems = [
  { title: "Daily timetable", href: "/timetable?location=angel", image: "/images/angel/montessori-nursery-angel-classroom-planets.webp", description: "Explore Angel’s morning and afternoon sessions, from Montessori activities to meals and rest time." },
  { title: "Term dates", href: "/timetable?location=angel#term-dates", image: "/images/angel/montessori-nursery-angel-rocket-display-and-materials.webp", description: "Plan ahead with Angel’s nursery term dates and the start and end of each term." },
  { title: "Opening Hours & Fees", href: "/opening-hours-fees", image: "/images/angel/montessori-nursery-angel-snack-tables.webp", description: "Explore nursery opening hours, flexible sessions, fees and funded childcare options." },
];

const abbeyRoadTimetableItems = [
  { title: "Daily timetable", href: "/timetable?location=abbey-road", image: "/images/abbey-road/main-room.webp", description: "Explore Abbey Road’s morning, afternoon and full-day session times." },
  { title: "Term dates", href: "/timetable?location=abbey-road#abbey-road-term-dates", image: "/images/abbey-road/reading-corner.webp", description: "Plan ahead with Abbey Road’s nursery term dates and the start and end of each term." },
  timetableItems[2],
];

function TimetableNavigation({ mobile = false, onNavigate, items = timetableItems, label = "Key information", href = "/timetable", menuId = "timetable" }: { mobile?: boolean; onNavigate?: () => void; items?: typeof timetableItems; label?: string; href?: string; menuId?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = `${mobile ? "mobile" : "desktop"}-${menuId}-menu`;
  useEffect(() => {
    if (!expanded) return;
    const close = (event: PointerEvent) => { if (!groupRef.current?.contains(event.target as Node)) setExpanded(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [expanded]);
  const item = items[active];
  return <div ref={groupRef} className={`timetable-nav-group ${mobile ? "is-mobile" : "is-desktop"}`}
    onMouseEnter={() => { if (!mobile) setExpanded(true); }}
    onMouseLeave={() => { if (!mobile && !groupRef.current?.contains(document.activeElement)) setExpanded(false); }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setExpanded(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { setExpanded(false); toggleRef.current?.focus(); } }}>
    <div className="timetable-nav-trigger"><Link href={href} onClick={() => { setExpanded(false); onNavigate?.(); }}>{label}</Link>
      <button ref={toggleRef} type="button" aria-label={`${expanded ? "Close" : "Open"} ${label.toLowerCase()} submenu`} aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(!expanded)}>
        <svg className="timetable-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </div>
    <div id={panelId} className="timetable-mega-menu" hidden={!expanded}>
      <div className="timetable-mega-links">{items.map((entry, index) => <Link key={entry.title} href={entry.href} className={active === index ? "is-active" : ""} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => { setExpanded(false); onNavigate?.(); }}>
        {mobile && <Image src={entry.image} alt="" width={180} height={135} unoptimized />}
        <div><span>{entry.title}</span>{mobile && <p>{entry.description}</p>}</div>
      </Link>)}</div>
      {!mobile && <div className="timetable-mega-preview"><Image key={item.image} src={item.image} alt="" width={640} height={400} unoptimized /><h3>{item.title}</h3><p>{item.description}</p></div>}
    </div>
  </div>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [preferredNursery, setPreferredNursery] = useState<string | null>(null);
  const routeNursery = pathname?.match(/^\/(angel|abbey-road)(?:\/|$)/)?.[1];
  const activeNursery = routeNursery ?? preferredNursery;
  const currentNursery = activeNursery === "abbey-road" ? "Abbey Road" : "Angel";
  const [open, setOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const homeHref = activeNursery ? `/${activeNursery}` : "/";
  const visitHref = activeNursery ? `/visit?location=${activeNursery}` : "/visit";
  const keyInformationItems = activeNursery === "abbey-road" ? abbeyRoadTimetableItems : timetableItems;

  useEffect(() => {
    const nursery = isNursery(routeNursery) ? routeNursery : readNurseryChoice();
    setPreferredNursery(nursery);
    if (isNursery(routeNursery)) rememberNursery(routeNursery);
  }, [routeNursery, pathname]);
  useNurseryChangeListener(setPreferredNursery);
  const switchNursery = useSwitchNursery();
  const switchToOther = () => switchNursery(activeNursery === "abbey-road" ? "angel" : "abbey-road");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let travelled = 0;
    let frame = 0;
    setHeaderHidden(false);

    const updateHeader = () => {
      frame = 0;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = Math.min(maxY, Math.max(0, window.scrollY));
      const delta = currentY - previousY;
      previousY = currentY;
      const header = headerRef.current;
      // Stuck to the top of the screen once the notice bar has scrolled away.
      setHeaderStuck(currentY > 0 && (header?.getBoundingClientRect().top ?? 1) <= 0);
      const interacting = header?.querySelector(":focus-visible") ||
        header?.querySelector('.timetable-mega-menu:not([hidden])');

      if (open || currentY <= (header?.offsetHeight ?? 76) + 34 || interacting) {
        travelled = 0;
        setHeaderHidden(false);
        return;
      }
      if (delta === 0) return;
      travelled = Math.sign(delta) === Math.sign(travelled) ? travelled + delta : delta;
      if (Math.abs(travelled) >= 8) {
        setHeaderHidden(travelled > 0);
        travelled = 0;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <>
      <div className="notice-bar">
        <span className="notice-dot" aria-hidden="true" />
        <span className="notice-text"><span className="notice-long">Taking registrations</span><span className="notice-short">Registering</span> for 2026{activeNursery && ` at ${currentNursery}`}</span>
        <Link href={visitHref}>Arrange a visit</Link>
      </div>
      <header ref={headerRef} className={`site-header${headerHidden ? " is-scroll-hidden" : ""}${headerStuck ? " is-stuck" : ""}`} onFocusCapture={() => setHeaderHidden(false)}>
        <Link className="wordmark" href={homeHref} aria-label="Beckett House home">
          <Image
            src="/images/beckett-house-logo-dark.svg"
            alt=""
            width="1428"
            height="1071"
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <TimetableNavigation items={keyInformationItems} />
          <TimetableNavigation items={aboutItems} label="About us" href="/beckett-house" menuId="about" />
          <TimetableNavigation items={nurseryLifeItems} label="Nursery life" href="/virtual-tour" menuId="nursery-life" />
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="header-visit-group">
          <NurseryLabel name={currentNursery} onSwitch={switchToOther} />
          <Link className="header-cta" href={visitHref}>
            Book a visit
          </Link>
        </div>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </header>
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="Mobile navigation">
          <TimetableNavigation mobile onNavigate={() => setOpen(false)} items={keyInformationItems} />
          <TimetableNavigation mobile onNavigate={() => setOpen(false)} items={aboutItems} label="About us" href="/beckett-house" menuId="about" />
          <TimetableNavigation mobile onNavigate={() => setOpen(false)} items={nurseryLifeItems} label="Nursery life" href="/virtual-tour" menuId="nursery-life" />
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.title}
            </Link>
          ))}
          <div className="mobile-visit-group">
            <NurseryLabel name={currentNursery} onSwitch={switchToOther} />
            <Link className="mobile-visit" href={visitHref} onClick={() => setOpen(false)}>
              Book a visit
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

function NurseryLabel({ name, onSwitch }: { name: string; onSwitch: () => void }) {
  const other = name === "Abbey Road" ? "Angel" : "Abbey Road";
  return <button type="button" className="nav-nursery-label" onClick={onSwitch} aria-label={`${name} nursery. Switch to ${other}`} title={`Switch to ${other}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>{name}</button>;
}

export function SiteFooter() {
  const activeSlug = useActiveNursery();
  const nursery = locations.find((location) => location.slug === activeSlug) ?? locations[0];

  return (
    <>
      <div className="footer-accreditations" role="group" aria-label="Nursery accreditation and inspection logos">
        <Image src="/images/meab-accreditation.avif" alt="Montessori Evaluation and Accreditation Board accreditation" width={137} height={63} loading="lazy" unoptimized />
        <Image src="/images/meab.avif" alt="MEAB" width={63} height={63} loading="lazy" unoptimized />
        <Image src="/images/ofsted.avif" alt="Ofsted" width={74} height={74} loading="lazy" unoptimized />
        <Image src="/images/food-hygiene.avif" alt="Food hygiene rating" width={101} height={52} loading="lazy" unoptimized />
      </div>
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Image
            className="footer-logo"
            src="/images/beckett-house-logo-light.svg"
            alt="Beckett House Montessori"
            width="1428"
            height="1071"
          />
          <div className="footer-intro">
            <p>A family-run Montessori nursery in Angel and Abbey Road, London.</p>
            <p className="footer-review-note">
              Leave us a{" "}
              <a href="https://g.page/r/CVdsknk9EQetEBM/review" target="_blank" rel="noopener noreferrer">
                review on Google
              </a>
            </p>
            <div className="footer-social">
              <a href="https://www.instagram.com/becketthousemontessori/" target="_blank" rel="noopener noreferrer" aria-label="Beckett House Montessori on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61578163062797" target="_blank" rel="noopener noreferrer" aria-label="Beckett House Montessori on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <Link href={"/montessori"}>Our approach</Link>
            <Link href={"/angel"}>Angel</Link>
            <Link href={"/abbey-road"}>Abbey Road</Link>
          </div>
          <div>
            <span>Visit {nursery.name}</span>
            <a className="footer-address" href={nursery.mapsUrl} target="_blank" rel="noopener noreferrer">
              {nursery.address}, {nursery.postcode.replace(" ", "\u00a0")}
            </a>
            <a href={`tel:${nursery.phoneHref}`}>{nursery.phone}</a>
            <a href={`mailto:${nursery.email}`}>{nursery.email}</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Beckett House Montessori</span>
        <span>Learning with head, hands & heart.</span>
      </div>
    </footer>
    </>
  );
}

export function MontessoriTower({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`tower-scene ${compact ? "compact" : ""}`} aria-hidden="true">
      <div className="tower-sun" />
      <div className="tower">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="tower-shadow" />
      <div className="wood-ball" />
      <div className="wood-ring" />
    </div>
  );
}

function locationPopupHtml(location: Location, disableLinks: boolean) {
  const externalLinkAttributes = disableLinks
    ? ""
    : 'target="_blank" rel="noreferrer"';

  return `
    <div class="map-popup">
      <span>${location.area}</span>
      <strong>${location.name}</strong>
      <p>${location.address}<br>${location.postcode}</p>
      <p>${location.opening}<br>Ages ${location.ages}<br>${location.phone}</p>
      <div>
        <a href="${disableLinks ? "#" : location.mapsUrl}" ${externalLinkAttributes}>Google Maps</a>
      </div>
    </div>
  `;
}

function LeafletLocationsMap({
  locations,
  disableLinks,
}: {
  locations: Location[];
  disableLinks: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let disposed = false;

    async function createMap() {
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer(MAP_TILE_URL, {
        attribution: disableLinks ? "&copy; OpenStreetMap contributors" : MAP_TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      locations.forEach((location) => {
        const point = L.latLng(location.latitude, location.longitude);
        bounds.extend(point);
        const marker = L.marker(point, {
          icon: L.divIcon({
            className: "bh-leaflet-marker-wrap",
            html: `<span class="bh-leaflet-marker marker-${location.colour}"></span>`,
            iconAnchor: [24, 52],
            iconSize: [48, 52],
            popupAnchor: [0, -48],
          }),
          title: `Beckett House Montessori ${location.name}`,
        }).addTo(map!);

        marker.bindPopup(locationPopupHtml(location, disableLinks));
      });

      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 12 });
    }

    createMap();

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [disableLinks, locations]);

  return <div
    className="locations-map"
    ref={containerRef}
    aria-label="Interactive map showing Beckett House Montessori in Angel and Abbey Road"
  />;
}

function GoogleLocationsMap({
  locations,
  disableLinks,
  onFailure,
}: {
  locations: Location[];
  disableLinks: boolean;
  onFailure: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let mapsApi: GoogleMapsApi | undefined;
    let map: GoogleMap | undefined;
    let infoWindow: InstanceType<GoogleMapsApi["InfoWindow"]> | undefined;
    const markers: GoogleHtmlMarker[] = [];
    const fail = () => {
      if (!disposed) onFailure();
    };
    const unsubscribeFromAuthFailure = subscribeToGoogleMapsAuthFailure(fail);

    async function createMap() {
      try {
        const maps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
        if (disposed) return;
        mapsApi = maps;

        map = new maps.Map(container!, {
          center: { lat: locations[0].latitude, lng: locations[0].longitude },
          zoom: 12,
          styles: calmGoogleMapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: "cooperative",
          scrollwheel: false,
          clickableIcons: false,
        });

        infoWindow = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();
        locations.forEach((location) => {
          const position = { lat: location.latitude, lng: location.longitude };
          bounds.extend(position);
          markers.push(createGoogleHtmlMarker({
            maps,
            map: map!,
            position,
            colour: location.colour,
            ariaLabel: `Beckett House Montessori ${location.name}`,
            onActivate: () => {
              infoWindow?.close();
              infoWindow?.setContent(locationPopupHtml(location, disableLinks));
              infoWindow?.setPosition(position);
              infoWindow?.open({ map: map! });
            },
          }));
        });

        map.fitBounds(bounds, 52);
        capGoogleMapZoom(maps, map, 12);
      } catch {
        fail();
      }
    }

    const stopObserving = observeNearViewport(container, () => { void createMap(); });
    return () => {
      disposed = true;
      stopObserving();
      unsubscribeFromAuthFailure();
      markers.forEach((marker) => marker.setMap(null));
      infoWindow?.close();
      if (mapsApi && infoWindow) mapsApi.event.clearInstanceListeners(infoWindow);
      if (mapsApi && map) mapsApi.event.clearInstanceListeners(map);
    };
  }, [disableLinks, locations, onFailure]);

  return <div
    className="locations-map"
    ref={containerRef}
    aria-label="Interactive map showing Beckett House Montessori in Angel and Abbey Road"
  />;
}

export function LocationsMap({
  locations,
  disableLinks = false,
}: {
  locations: Location[];
  disableLinks?: boolean;
}) {
  const [googleMapsFailed, setGoogleMapsFailed] = useState(false);
  const handleGoogleMapsFailure = useCallback(() => setGoogleMapsFailed(true), []);
  const useGoogleMaps = Boolean(GOOGLE_MAPS_API_KEY) && !googleMapsFailed;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${locations[0].address}, ${locations[0].postcode}`,
  )}&destination=${encodeURIComponent(
    `${locations[1].address}, ${locations[1].postcode}`,
  )}`;

  return (
    <div className="locations-map-shell">
      <div className="map-toolbar">
        <span>Interactive map · drag or pinch to explore</span>
        <a
          href={disableLinks ? "#" : directionsUrl}
          target={disableLinks ? undefined : "_blank"}
          rel={disableLinks ? undefined : "noreferrer"}
        >
          View in Google Maps
        </a>
      </div>
      {useGoogleMaps
        ? <GoogleLocationsMap key="google" locations={locations} disableLinks={disableLinks} onFailure={handleGoogleMapsFailure} />
        : <LeafletLocationsMap key="leaflet" locations={locations} disableLinks={disableLinks} />}
      <noscript>
        <p>
          Beckett House Angel and Abbey Road:
        </p>
        {locations.map((location) => (
          <p key={location.slug}>
            <strong>{location.name}</strong> · {location.address}, {location.postcode}
            {" · "}
            <a href={disableLinks ? "#" : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.address}, ${location.postcode}`)}`}>
              Google Maps
            </a>
          </p>
        ))}
      </noscript>
    </div>
  );
}

type NurseryMapController = {
  focus(location: Location): void;
};

type NurseryMapProps = {
  locations: Location[];
  controllerRef: { current: NurseryMapController | null };
  pendingFocusRef: { current: Location | null };
  onSelect: (location: Location) => void;
};

function LeafletNurseryChooserMap({
  locations,
  controllerRef,
  pendingFocusRef,
  onSelect,
}: NurseryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let controller: NurseryMapController | undefined;

    async function createMap() {
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;

      map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        zoomControl: false,
      });
      controller = {
        focus(location) {
          map?.flyTo([location.latitude, location.longitude], 12, { duration: 0.7 });
        },
      };
      controllerRef.current = controller;

      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer(MAP_TILE_URL, {
        attribution: MAP_TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      locations.forEach((location) => {
        const point = L.latLng(location.latitude, location.longitude);
        bounds.extend(point);
        const marker = L.marker(point, {
          icon: L.divIcon({
            className: "bh-leaflet-marker-wrap",
            html: `<span class="bh-leaflet-marker marker-${location.colour}"></span>`,
            iconAnchor: [24, 52],
            iconSize: [48, 52],
          }),
          title: `Choose Beckett House Montessori ${location.name}`,
        }).addTo(map!);

        marker.on("click", () => {
          onSelect(location);
          map?.flyTo(point, 12, { duration: 0.7 });
        });
      });

      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
      if (pendingFocusRef.current) {
        controller.focus(pendingFocusRef.current);
        pendingFocusRef.current = null;
      }
    }

    createMap();
    return () => {
      disposed = true;
      map?.remove();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [controllerRef, locations, onSelect, pendingFocusRef]);

  return <div
    className="nursery-chooser-map"
    ref={containerRef}
    aria-label="Full-screen map showing Beckett House Montessori in Angel and Abbey Road"
  />;
}

function GoogleNurseryChooserMap({
  locations,
  controllerRef,
  pendingFocusRef,
  onSelect,
  onFailure,
}: NurseryMapProps & { onFailure: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let mapsApi: GoogleMapsApi | undefined;
    let map: GoogleMap | undefined;
    let controller: NurseryMapController | undefined;
    const markers: GoogleHtmlMarker[] = [];
    const fail = () => {
      if (!disposed) onFailure();
    };
    const unsubscribeFromAuthFailure = subscribeToGoogleMapsAuthFailure(fail);

    async function createMap() {
      try {
        const maps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
        if (disposed) return;
        mapsApi = maps;

        map = new maps.Map(container!, {
          center: { lat: locations[0].latitude, lng: locations[0].longitude },
          zoom: 12,
          styles: calmGoogleMapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: { position: maps.ControlPosition.RIGHT_TOP },
          gestureHandling: "greedy",
          scrollwheel: true,
          clickableIcons: false,
        });

        controller = {
          focus(location) {
            map?.panTo({ lat: location.latitude, lng: location.longitude });
            map?.setZoom(13);
          },
        };
        controllerRef.current = controller;

        const bounds = new maps.LatLngBounds();
        locations.forEach((location) => {
          const position = { lat: location.latitude, lng: location.longitude };
          bounds.extend(position);
          markers.push(createGoogleHtmlMarker({
            maps,
            map: map!,
            position,
            colour: location.colour,
            ariaLabel: `Beckett House Montessori ${location.name}`,
            onActivate: () => {
              onSelect(location);
              map?.panTo(position);
              map?.setZoom(13);
            },
          }));
        });

        map.fitBounds(bounds, 80);
        capGoogleMapZoom(maps, map, 12);
        if (pendingFocusRef.current) {
          controller.focus(pendingFocusRef.current);
          pendingFocusRef.current = null;
        }
      } catch {
        fail();
      }
    }

    const stopObserving = observeNearViewport(container, () => { void createMap(); });
    return () => {
      disposed = true;
      stopObserving();
      unsubscribeFromAuthFailure();
      markers.forEach((marker) => marker.setMap(null));
      if (map && mapsApi) mapsApi.event.clearInstanceListeners(map);
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [controllerRef, locations, onFailure, onSelect, pendingFocusRef]);

  return <div
    className="nursery-chooser-map"
    ref={containerRef}
    aria-label="Full-screen map showing Beckett House Montessori in Angel and Abbey Road"
  />;
}

function chooseNursery(location: Location) {
  try { window.localStorage.setItem("beckett-house-nursery", location.slug); } catch { /* Selection still works without browser storage. */ }
  document.cookie = `bh_preferred_nursery=${location.slug}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.assign(`/${location.slug}`);
}

export function NurseryChooser({ locations, homepage = false }: { locations: Location[]; homepage?: boolean }) {
  const mapControllerRef = useRef<NurseryMapController | null>(null);
  const pendingMapFocusRef = useRef<Location | null>(null);
  const [googleMapsFailed, setGoogleMapsFailed] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<Location["slug"]>(
    locations[0].slug,
  );

  const selected =
    locations.find((location) => location.slug === selectedSlug) ?? locations[0];
  const handleMapSelect = useCallback((location: Location) => {
    setSelectedSlug(location.slug);
    if (homepage) chooseNursery(location);
  }, [homepage]);
  const handleGoogleMapsFailure = useCallback(() => setGoogleMapsFailed(true), []);
  const useGoogleMaps = Boolean(GOOGLE_MAPS_API_KEY) && !googleMapsFailed;

  function preview(location: Location) {
    setSelectedSlug(location.slug);
    if (mapControllerRef.current) mapControllerRef.current.focus(location);
    else pendingMapFocusRef.current = location;
  }

  return (
    <section className="nursery-chooser" aria-labelledby="nursery-chooser-title">
      {useGoogleMaps
        ? <GoogleNurseryChooserMap
            key="google"
            locations={locations}
            controllerRef={mapControllerRef}
            pendingFocusRef={pendingMapFocusRef}
            onSelect={handleMapSelect}
            onFailure={handleGoogleMapsFailure}
          />
        : <LeafletNurseryChooserMap
            key="leaflet"
            locations={locations}
            controllerRef={mapControllerRef}
            pendingFocusRef={pendingMapFocusRef}
            onSelect={handleMapSelect}
          />}
      <div className="nursery-chooser-intro">
        {homepage ? <Image className="map-home-logo" src="/images/beckett-house-logo-dark.svg" alt="Beckett House Montessori" width={1428} height={1071} priority /> : <p className="eyebrow">Switch schools here</p>}
        <h1 id="nursery-chooser-title">{homepage ? "Switch schools here" : "Which nursery feels like home?"}</h1>
        <p className={homepage ? "map-home-introduction" : undefined}>
          {homepage ? "Beckett House is a family-run Montessori nursery with warm, welcoming spaces in Angel and Abbey Road, where children can learn, explore and grow in confidence." : "Select a pin to compare the two settings. Your choice will take you into the right nursery experience and be remembered on this device."}
        </p>
        {homepage && <div className="map-home-location-links" aria-label="Enter your nursery">
          {locations.map((location) => <button className="button button-dark" type="button" key={location.slug} onClick={() => chooseNursery(location)}>{location.name}</button>)}
        </div>}
      </div>
      {homepage && <details className="map-home-menu" onKeyDown={(event) => {
        if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); }
      }}>
        <summary aria-label="Site navigation"><span className="map-menu-icon" aria-hidden="true"><span /><span /><span /></span><span className="map-menu-label">Menu</span></summary>
        <nav aria-label="Site navigation" className="map-home-menu-panel">
          <div><h2>Our nurseries</h2>{locations.map((location) => <button type="button" key={location.slug} onClick={() => chooseNursery(location)}>{location.name}</button>)}</div>
          <div><h2>About us</h2>{aboutItems.map((item) => <Link key={item.href} href={item.href}>{item.title}</Link>)}</div>
          <div><h2>Key information</h2>{timetableItems.map((item) => <Link key={item.href} href={item.href}>{item.title}</Link>)}</div>
          <Link href="/virtual-tour">Virtual Tour</Link>
          <Link href="/gallery">Gallery</Link>
          <Link className="button button-dark" href="/visit">Book a visit</Link>
        </nav>
      </details>}
      <div className="nursery-chooser-panel nursery-accordion" aria-label="Nursery locations">
        {locations.map((location) => {
          const expanded = location.slug === selected.slug;
          const panelId = `nursery-card-${location.slug}`;
          return <article className={`nursery-location-card chooser-${location.colour}${expanded ? " is-expanded" : ""}`} key={location.slug}>
            <h2><button id={`${panelId}-trigger`} className="nursery-card-trigger" type="button" onClick={() => preview(location)} aria-expanded={expanded} aria-controls={panelId}>
              <span><strong>{location.name}</strong><small>{location.area}</small></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button></h2>
            <div id={panelId} className="nursery-card-expansion" role="region" aria-labelledby={`${panelId}-trigger`} aria-hidden={!expanded} inert={!expanded}>
              <div className="nursery-card-overflow">
                <Image className="nursery-card-photo" src={location.image} alt={location.imageAlt} width={900} height={600} sizes="(min-width: 900px) 31vw, 100vw" unoptimized />
                <div className="nursery-card-details">
                  <div className="nursery-card-facts"><span>{location.ages}</span><span>{location.opening}</span></div>
                  <p>{location.strapline}</p>
                  <p>{location.address}<br />{location.postcode}</p>
                  <button className="button button-dark" type="button" onClick={() => chooseNursery(location)}>Choose {location.name}</button>
                </div>
              </div>
            </div>
          </article>;
        })}
      </div>
      {!homepage && <Link className="nursery-chooser-back" href="/">
        Back to Beckett House
      </Link>}
    </section>
  );
}

export function PanoramaViewer({ location }: { location: Location }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PhotoSphereViewer | null>(null);
  const selectedIndexRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  const selected = location.panoramas[selectedIndex];

  useEffect(() => {
    if (!isOpen || !containerRef.current || viewerRef.current) return;

    let disposed = false;

    async function createViewer() {
      try {
        const { Viewer } = await import("@photo-sphere-viewer/core");
        if (disposed || !containerRef.current) return;

        const initialRoom = location.panoramas[selectedIndexRef.current];
        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: initialRoom.src,
          caption: initialRoom.name,
          loadingTxt: "Preparing the room…",
          defaultZoomLvl: 34,
          minFov: 35,
          maxFov: 90,
          mousewheelCtrlKey: true,
          touchmoveTwoFingers: true,
          navbar: ["zoom", "move", "caption", "fullscreen"],
          canvasBackground: "#e2e8f6",
        });
      } catch {
        if (!disposed) setViewerError(true);
      }
    }

    createViewer();

    return () => {
      disposed = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [isOpen, location.panoramas]);

  async function chooseRoom(index: number) {
    if (index === selectedIndex) return;
    const nextRoom = location.panoramas[index];
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    setIsChangingRoom(true);
    setViewerError(false);

    try {
      await viewerRef.current?.setPanorama(nextRoom.src, {
        caption: nextRoom.name,
        transition: { effect: "fade", speed: "12rpm", rotation: true },
        zoom: 34,
      });
    } catch {
      setViewerError(true);
    } finally {
      setIsChangingRoom(false);
    }
  }

  return (
    <div className="panorama-tour">
      <div className={`panorama ${isOpen ? "is-open" : ""}`}>
        {!isOpen && (
          <>
            <Image
              className="panorama-poster"
              src={location.image}
              unoptimized
              alt={`Preview of Beckett House Montessori ${location.name}`}
              width={location.slug === "angel" ? 2000 : 1600}
              height={location.slug === "angel" ? 1332 : 1067}
              sizes="(min-width: 1040px) 62vw, 100vw"
              loading="lazy"
            />
            <div className="panorama-shade" />
            <div className="panorama-launch">
              <span className="panorama-badge">Interactive 360° tour</span>
              <h3>Step inside {location.name}.</h3>
              <p>
                Explore {location.panoramas.length} real spaces at your own pace.
              </p>
              <span className="button button-light" aria-hidden="true">
                Start exploring
              </span>
            </div>
            <button className="panorama-start-overlay" type="button" aria-label={`Start the interactive 360 degree tour of ${location.name}`} onClick={() => setIsOpen(true)} />
          </>
        )}
        <div
          className="panorama-canvas"
          ref={containerRef}
          aria-label={`Interactive 360 degree view of ${selected.name} at Beckett House ${location.name}`}
        />
        {isOpen && (
          <div className="panorama-top">
            <span className="panorama-badge">{selected.name}</span>
            <span className="panorama-angle">360°</span>
          </div>
        )}
        {isChangingRoom && (
          <span className="panorama-room-loading" role="status">
            Moving rooms…
          </span>
        )}
        {viewerError && (
          <div className="panorama-error" role="alert">
            <strong>We couldn&apos;t open this room.</strong>
            <p>Please try another room or refresh the page.</p>
          </div>
        )}
      </div>
      <div className="panorama-tour-meta">
        <div>
          <strong>{selected.name}</strong>
          <p>{selected.description}</p>
        </div>
        <p className="panorama-hint">
          {isOpen
            ? "Drag to look around · pinch or use the controls to zoom"
            : "The 360° viewer only loads when you choose to enter"}
        </p>
      </div>
      <div className="panorama-room-list" role="tablist" aria-label="Tour rooms">
        {location.panoramas.map((room, index) => (
          <button
            className={index === selectedIndex ? "is-selected" : ""}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            onClick={() => {
              if (isOpen) {
                chooseRoom(index);
              } else {
                selectedIndexRef.current = index;
                setSelectedIndex(index);
                setIsOpen(true);
              }
            }}
            key={room.src}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <strong>{room.name}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FAQList({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>
            <span>{item.question}</span>
            <span className="faq-plus" aria-hidden="true">
              +
            </span>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function VisitForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState("");
  const [resetCount, setResetCount] = useState(0);
  const [nursery, setNursery] = useNurseryChoice();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const location = String(data.get("location") || "Angel");
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const childAge = String(data.get("childAge") || "");
    const message = String(data.get("message") || "");
    if (TURNSTILE_SITE_KEY) {
      setSending(true);
      setStatus("Sending…");
      try {
        await postForm("visit", data, token);
        setStatus(`Thank you – we've received your request and sent a confirmation to ${email}.`);
        form.reset();
      } catch (error) {
        setStatus(error instanceof Error && error.name === "Error" ? error.message : "Sorry, we couldn't send your request. Please try again shortly.");
      } finally {
        setSending(false);
        setToken("");
        setResetCount((count) => count + 1);
      }
      return;
    }
    const destination =
      location === "Abbey Road"
        ? "abbeyroad@beckett-house.co.uk"
        : "info@beckett-house.co.uk";
    const subject = encodeURIComponent(`Visit request: ${location}, ${name}`);
    const body = encodeURIComponent(
      `Hello Beckett House,\n\nI'd like to arrange a visit.\n\nLocation: ${location}\nParent / carer: ${name}\nEmail: ${email}\nChild's age: ${childAge}\n\n${message}\n`,
    );
    setStatus("Your email app is opening with the visit details ready to send.");
    window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="visit-form" onSubmit={submit}>
      <div className="field-row">
        <label>
          Your name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <div className="field-row">
        <label>
          Preferred nursery
          <select name="location" value={nurseryNames[nursery]} onChange={(event) => setNursery(event.target.value === "Abbey Road" ? "abbey-road" : "angel")}>
            <option>Angel</option>
            <option>Abbey Road</option>
          </select>
        </label>
        <label>
          Child&apos;s age
          <input name="childAge" placeholder="e.g. 18 months" required />
        </label>
      </div>
      <label>
        Anything we should know?
        <textarea
          name="message"
          rows={4}
          placeholder="Days you need, ideal start date, or the best times to visit…"
        />
      </label>
      {TURNSTILE_SITE_KEY ? <Turnstile onToken={setToken} resetCount={resetCount} /> : null}
      <button className="button button-dark form-submit" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Request a visit"}
      </button>
      <p className="form-status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}

export function LocationTimeline({ location }: { location: Location }) {
  return (
    <div className="day-timeline">
      {location.day.map((item, index) => (
        <div className="day-point" key={`${item.time}-${item.label}`}>
          <span>{item.time}</span>
          <strong>{item.label}</strong>
          {index < location.day.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}
