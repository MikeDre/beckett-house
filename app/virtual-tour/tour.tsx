"use client";

import { locations } from "../../lib/content";
import { PanoramaViewer } from "../components";
import { useNurseryChoice } from "../nursery-choice";

export default function VirtualTour() {
  const [selected, setSelected] = useNurseryChoice();
  const location = locations.find((nursery) => nursery.slug === selected) ?? locations[0];
  return <div className="virtual-tour-experience">
    <div className="virtual-tour-toolbar">
    <div className="virtual-tour-location-switch" role="group" aria-label="Choose a nursery to explore">
      {locations.map((nursery) => <button key={nursery.slug} type="button" aria-pressed={selected === nursery.slug} className={selected === nursery.slug ? "is-selected" : ""} onClick={() => setSelected(nursery.slug)}>{nursery.name}</button>)}
    </div>
    <div className="virtual-tour-address" aria-live="polite"><strong>{location.name}</strong><span>{location.address}</span></div>
    </div>
    <PanoramaViewer key={location.slug} location={location} />
    <div className="virtual-tour-instructions">
      <p><strong>Look around</strong><span>Drag with your mouse, or use two fingers on a touch screen.</span></p>
      <p><strong>Explore every space</strong><span>Choose a room below the viewer to move between panoramas.</span></p>
      <p><strong>Take a closer look</strong><span>Use the zoom controls and fullscreen button inside the viewer.</span></p>
    </div>
  </div>;
}
