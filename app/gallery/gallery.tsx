"use client";

import Image from "next/image";
import { KeyboardEvent, MouseEvent, useRef, useState } from "react";
import type { NurserySlug } from "../nursery-choice";
import { useNurseryChoice } from "../nursery-choice";

type GalleryImage = {
  src: string;
  caption: string;
  alt: string;
  width: number;
  height: number;
};

const galleryImages: Record<NurserySlug, GalleryImage[]> = {
  angel: [
    { src: "/images/gallery/angel-classroom-1.webp", caption: "Angel classroom", alt: "The Angel classroom with child-sized tables and low Montessori shelves", width: 1600, height: 1067 },
    { src: "/images/gallery/angel-classroom-2.webp", caption: "Angel classroom", alt: "A carpeted learning area in the Angel classroom with low Montessori shelves", width: 1600, height: 1067 },
    { src: "/images/gallery/angel-classroom-3.webp", caption: "Angel classroom", alt: "The Angel classroom with activity tables and learning displays", width: 1600, height: 1067 },
    { src: "/images/gallery/angel-classroom-4.webp", caption: "Angel classroom", alt: "A practical activity area in the Angel classroom with low shelves", width: 1600, height: 1067 },
    { src: "/images/gallery/angel-main.webp", caption: "Main classroom", alt: "A wide view of the Angel main classroom with tables and low Montessori shelves", width: 1600, height: 745 },
    { src: "/images/gallery/angel-space1.webp", caption: "Learning space one", alt: "An Angel learning space with low shelves, activity tables and wall displays", width: 1600, height: 745 },
    { src: "/images/gallery/angel-space2.webp", caption: "Learning space two", alt: "An Angel learning space with Montessori materials and a carpeted activity area", width: 1600, height: 745 },
    { src: "/images/gallery/angel-space3.webp", caption: "Learning space three", alt: "An Angel learning space with a keyboard, low shelves and activity areas", width: 1600, height: 745 },
  ],
  "abbey-road": [
    { src: "/images/gallery/abbey-road-lobby.webp", caption: "Welcome lobby", alt: "The Abbey Road welcome lobby with an entrance and low display table", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-space-1.webp", caption: "Main learning space", alt: "The Abbey Road main learning space with tables, low shelves and seating", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-space-2.webp", caption: "Main learning space", alt: "A wide view of the Abbey Road main learning space and activity areas", width: 1600, height: 838 },
    { src: "/images/gallery/abbey-road-nursery-carpet.webp", caption: "Nursery room", alt: "The Abbey Road nursery room with a carpeted play area and low seating", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-nursery-kitchen.webp", caption: "Practical life area", alt: "The Abbey Road practical life area with a sink, worktop and low shelves", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-outer-carpet.webp", caption: "Carpet area", alt: "The Abbey Road carpet area with low Montessori shelves and chairs", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-outer-carpet-2.webp", caption: "Carpet area", alt: "The Abbey Road carpet area with cushions, low shelves and learning displays", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-culture-sign.webp", caption: "Culture area", alt: "The Abbey Road culture area with classroom doors and low activity shelves", width: 1600, height: 745 },
    { src: "/images/gallery/abbey-road-outdoor.webp", caption: "Outdoor space", alt: "The Abbey Road outdoor space with a paved play area and trees", width: 1600, height: 745 },
  ],
};

const nurseryNames: Record<NurserySlug, string> = {
  angel: "Angel",
  "abbey-road": "Abbey Road",
};

export default function Gallery() {
  const [selected, setSelected] = useNurseryChoice();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const images = galleryImages[selected];
  const currentImage = currentIndex === null ? null : images[currentIndex];

  const openImage = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = event.currentTarget;
    setCurrentIndex(index);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  const move = (direction: -1 | 1) => {
    setCurrentIndex((index) => index === null ? null : (index + direction + images.length) % images.length);
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  return <section className="gallery-experience" aria-label="Nursery photos">
    <div className="gallery-toolbar">
      <div className="virtual-tour-location-switch" role="group" aria-label="Choose a nursery gallery">
        {(Object.keys(nurseryNames) as NurserySlug[]).map((slug) => <button
          key={slug}
          type="button"
          aria-pressed={selected === slug}
          className={selected === slug ? "is-selected" : ""}
          onClick={() => setSelected(slug)}
        >{nurseryNames[slug]}</button>)}
      </div>
      <p aria-live="polite">Showing {nurseryNames[selected]} photos</p>
    </div>

    <div className="gallery-grid">
      {images.map((image, index) => <figure className="gallery-card" key={image.src}>
        <button type="button" aria-haspopup="dialog" aria-label={`Open larger view: ${image.alt}`} onClick={(event) => openImage(index, event)}>
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 1000px) 33vw, (min-width: 650px) 50vw, 100vw" loading="lazy" unoptimized />
        </button>
        <figcaption>{image.caption}</figcaption>
      </figure>)}
    </div>

    <dialog
      ref={dialogRef}
      className="gallery-lightbox"
      aria-labelledby="gallery-lightbox-caption"
      onKeyDown={handleDialogKeyDown}
      onClose={() => {
        setCurrentIndex(null);
        lastTriggerRef.current?.focus();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {currentImage && <div className="gallery-lightbox-inner">
        <button className="gallery-lightbox-close" type="button" aria-label="Close gallery" onClick={() => dialogRef.current?.close()}>×</button>
        <div className="gallery-lightbox-image">
          <Image key={currentImage.src} src={currentImage.src} alt={currentImage.alt} width={currentImage.width} height={currentImage.height} sizes="95vw" unoptimized />
        </div>
        <button className="gallery-lightbox-arrow gallery-lightbox-previous" type="button" aria-label="Previous photo" onClick={() => move(-1)}><span aria-hidden="true">‹</span></button>
        <button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" aria-label="Next photo" onClick={() => move(1)}><span aria-hidden="true">›</span></button>
        <p id="gallery-lightbox-caption"><span>{currentImage.caption}</span><small>{currentIndex! + 1} of {images.length}</small></p>
      </div>}
    </dialog>
  </section>;
}
