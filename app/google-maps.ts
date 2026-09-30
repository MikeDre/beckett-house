export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleMapStyle = {
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string | number>>;
};

type GoogleMapOptions = {
  center: GoogleLatLngLiteral;
  zoom: number;
  styles: GoogleMapStyle[];
  mapTypeControl: boolean;
  streetViewControl: boolean;
  fullscreenControl: boolean;
  zoomControl: boolean;
  zoomControlOptions?: { position: number };
  gestureHandling: "cooperative" | "greedy";
  scrollwheel: boolean;
  clickableIcons: boolean;
};

export interface GoogleLatLngBounds {
  extend(position: GoogleLatLngLiteral): void;
}

export interface GoogleMap {
  fitBounds(bounds: GoogleLatLngBounds, padding?: number): void;
  getZoom(): number | undefined;
  panTo(position: GoogleLatLngLiteral): void;
  setZoom(zoom: number): void;
}

interface GoogleInfoWindow {
  close(): void;
  open(options: { map: GoogleMap }): void;
  setContent(content: string): void;
  setPosition(position: GoogleLatLngLiteral): void;
}

interface GoogleOverlayView {
  getPanes(): { overlayMouseTarget: HTMLElement } | null;
  getProjection(): {
    fromLatLngToDivPixel(position: GoogleLatLngLiteral): { x: number; y: number } | null;
  } | undefined;
  setMap(map: GoogleMap | null): void;
}

export interface GoogleMapsApi {
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMap;
  LatLngBounds: new () => GoogleLatLngBounds;
  InfoWindow: new () => GoogleInfoWindow;
  OverlayView: new () => GoogleOverlayView;
  ControlPosition: { RIGHT_TOP: number };
  event: {
    addListenerOnce(instance: object, eventName: string, handler: () => void): void;
    clearInstanceListeners(instance: object): void;
  };
}

interface GoogleMapsWindow extends Window {
  google?: { maps: GoogleMapsApi };
  gm_authFailure?: () => void;
  __beckettHouseGoogleMapsReady?: () => void;
}

export interface GoogleHtmlMarker {
  setMap(map: GoogleMap | null): void;
}

const SCRIPT_ID = "beckett-house-google-maps";
const CALLBACK_NAME = "__beckettHouseGoogleMapsReady";
let mapsPromise: Promise<GoogleMapsApi> | undefined;
let mapsLoadError: Error | undefined;
let authFailureHandlerInstalled = false;
const authFailureListeners = new Set<(error: Error) => void>();

export const GOOGLE_MAPS_API_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
    : "";

export const calmGoogleMapStyles: GoogleMapStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#eeeae2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4f5664" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f7f4ee" }] },
  { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#eeece5" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e3e8dc" }] },
  { featureType: "poi.business", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dce7d5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d9d5cd" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f5dfc8" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e1ed" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#657f90" }] },
];

function installAuthFailureHandler(mapsWindow: GoogleMapsWindow) {
  if (authFailureHandlerInstalled) return;
  authFailureHandlerInstalled = true;
  const previousHandler = mapsWindow.gm_authFailure;

  mapsWindow.gm_authFailure = () => {
    const error = new Error("Google Maps authentication failed");
    mapsLoadError = error;
    authFailureListeners.forEach((listener) => listener(error));
    previousHandler?.();
  };
}

export function subscribeToGoogleMapsAuthFailure(listener: (error: Error) => void) {
  authFailureListeners.add(listener);
  if (mapsLoadError) {
    const error = mapsLoadError;
    queueMicrotask(() => {
      if (authFailureListeners.has(listener)) listener(error);
    });
  }
  return () => authFailureListeners.delete(listener);
}

export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  if (mapsLoadError) return Promise.reject(mapsLoadError);

  const mapsWindow = window as GoogleMapsWindow;
  installAuthFailureHandler(mapsWindow);
  if (mapsWindow.google?.maps) return Promise.resolve(mapsWindow.google.maps);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const fail = (error: Error) => {
      mapsLoadError = error;
      reject(error);
    };

    mapsWindow[CALLBACK_NAME] = () => {
      delete mapsWindow[CALLBACK_NAME];
      const maps = mapsWindow.google?.maps;
      if (mapsLoadError) reject(mapsLoadError);
      else if (maps) resolve(maps);
      else fail(new Error("Google Maps loaded without exposing the Maps API"));
    };

    const script = document.createElement("script");
    const parameters = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      loading: "async",
      callback: CALLBACK_NAME,
    });
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${parameters.toString()}`;
    script.onerror = () => fail(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

export function observeNearViewport(element: Element, callback: () => void) {
  if (!("IntersectionObserver" in window)) {
    callback();
    return () => undefined;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  }, { rootMargin: "300px 0px" });

  observer.observe(element);
  return () => observer.disconnect();
}

export function createGoogleHtmlMarker({
  maps,
  map,
  position,
  colour,
  ariaLabel,
  onActivate,
}: {
  maps: GoogleMapsApi;
  map: GoogleMap;
  position: GoogleLatLngLiteral;
  colour: string;
  ariaLabel: string;
  onActivate: () => void;
}): GoogleHtmlMarker {
  class HtmlMarker extends maps.OverlayView {
    private element: HTMLDivElement | null = null;

    onAdd() {
      const element = document.createElement("div");
      const pin = document.createElement("span");
      element.className = "bh-leaflet-marker-wrap bh-google-marker-wrap";
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", ariaLabel);
      element.tabIndex = 0;
      pin.className = `bh-leaflet-marker marker-${colour}`;
      element.appendChild(pin);
      element.addEventListener("click", this.handleClick);
      element.addEventListener("keydown", this.handleKeyDown);
      this.element = element;
      this.getPanes()?.overlayMouseTarget.appendChild(element);
    }

    draw() {
      if (!this.element) return;
      const point = this.getProjection()?.fromLatLngToDivPixel(position);
      if (!point) return;
      this.element.style.left = `${point.x}px`;
      this.element.style.top = `${point.y}px`;
    }

    onRemove() {
      this.element?.removeEventListener("click", this.handleClick);
      this.element?.removeEventListener("keydown", this.handleKeyDown);
      this.element?.remove();
      this.element = null;
    }

    private handleClick = (event: MouseEvent) => {
      event.stopPropagation();
      onActivate();
    };

    private handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      event.stopPropagation();
      onActivate();
    };
  }

  const marker = new HtmlMarker();
  marker.setMap(map);
  return marker;
}

export function capGoogleMapZoom(maps: GoogleMapsApi, map: GoogleMap, maximumZoom: number) {
  maps.event.addListenerOnce(map, "idle", () => {
    const zoom = map.getZoom();
    if (zoom !== undefined && zoom > maximumZoom) map.setZoom(maximumZoom);
  });
}
