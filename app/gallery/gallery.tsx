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
    { src: "/images/angel/montessori-nursery-angel-classroom-islington.webp", caption: "Angel classroom", alt: "A wide view of the Angel Montessori classroom with low shelves, round tables and a fire-exit door", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-classroom-planets.webp", caption: "Angel classroom", alt: "The Angel classroom with hanging planets, cardboard rockets and child-sized tables", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-classroom-reading-area.webp", caption: "Reading area", alt: "A sofa, rugs and bookshelves in the Angel reading area beneath hanging planets", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-reading-loft.webp", caption: "Reading loft", alt: "A wooden reading loft with cushions and a staircase in the Angel classroom", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-cosy-book-corner.webp", caption: "Book corner", alt: "A cosy book corner with a sofa, rugs, a keyboard and an interactive screen", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-music-and-interactive-screen.webp", caption: "Music and screen", alt: "A keyboard, puzzles and an interactive screen beside colourful rugs", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-rocket-display-and-materials.webp", caption: "Montessori materials", alt: "Cardboard rocket displays above shelves of Montessori materials and a green table", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-sensorial-corner.webp", caption: "Montessori materials", alt: "Montessori materials on low shelves around a green table, with children’s swirl paintings", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-practical-life-dressing-frames.webp", caption: "Practical life", alt: "Montessori dressing frames laid out on a table in front of the rocket display", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-classroom-and-kitchen.webp", caption: "Classroom and kitchen", alt: "The open classroom with a round table, shelves and the nursery kitchen area", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-snack-tables.webp", caption: "Snack tables", alt: "Small tables and chairs beside the nursery kitchen for snack and lunch times", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-childrens-artwork-display.webp", caption: "Children’s artwork", alt: "Children’s swirl paintings and a diurnal and nocturnal animals display", width: 2000, height: 1333 },
    { src: "/images/angel/montessori-nursery-angel-earth-day-artwork.webp", caption: "Children’s artwork", alt: "A Happy Earth Day 2026 poster with children’s handprints and magnetic shapes", width: 2000, height: 1333 },
  ],
  "abbey-road": [
    { src: "/images/abbey-road/main-room.webp", caption: "Main learning space", alt: "A wide view of the Abbey Road main learning space with tables and low shelves", width: 1600, height: 1067 },
    { src: "/images/abbey-road/main-room-4.webp", caption: "Main learning space", alt: "The Abbey Road main learning space with Montessori materials set out on tables", width: 1600, height: 1067 },
    { src: "/images/abbey-road/main-room-3.webp", caption: "Main learning space", alt: "A sofa with cushions beside tables and low shelves in the Abbey Road main room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/main-room-2.webp", caption: "Main learning space", alt: "Low shelves, a sensory tray and an alphabet rug in the Abbey Road main room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/main-room-5.webp", caption: "Main learning space", alt: "Low Montessori shelves and a curved bench in the Abbey Road main room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/main-room-6.webp", caption: "Main learning space", alt: "Activity tables with a tray and chairs in the Abbey Road main room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/alphabet-carpet.webp", caption: "Main learning space", alt: "An alphabet rug and cushions in the Abbey Road main room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/montessori-puzzle.webp", caption: "Montessori materials", alt: "A wooden Montessori puzzle and coloured pencils on a low shelf", width: 1600, height: 1067 },
    { src: "/images/abbey-road/shape-sorters.webp", caption: "Montessori materials", alt: "Wooden shape sorters and small figures on a classroom table", width: 1600, height: 1067 },
    { src: "/images/abbey-road/shape-puzzles.webp", caption: "Montessori materials", alt: "Wooden shape puzzles set out on a classroom table", width: 1600, height: 1067 },
    { src: "/images/abbey-road/sand-tray.webp", caption: "Sensory play", alt: "A sensory tray with sand, leaves and toy animals", width: 1600, height: 1067 },
    { src: "/images/abbey-road/tray-activity.webp", caption: "Sensory play", alt: "Coloured sticks arranged on a black activity tray", width: 1600, height: 1067 },
    { src: "/images/abbey-road/reading-corner.webp", caption: "Reading corner", alt: "A low bookshelf of picture books beside floor cushions", width: 1600, height: 1067 },
    { src: "/images/abbey-road/carpet-corner.webp", caption: "Main learning space", alt: "A playful rug and a toy on the floor near a touchscreen table", width: 1600, height: 1067 },
    { src: "/images/abbey-road/learning-room.webp", caption: "Learning room", alt: "A table of wooden Montessori materials in a quieter learning room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/nursery-room.webp", caption: "Nursery room", alt: "The Abbey Road nursery room with a play mat, soft toys and a sofa", width: 1600, height: 1067 },
    { src: "/images/abbey-road/nursery-room-2.webp", caption: "Nursery room", alt: "A colourful rug with soft toys in the Abbey Road nursery room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/nursery-room-3.webp", caption: "Nursery room", alt: "The Abbey Road nursery room with a play mat, low bench and sofa", width: 1600, height: 1067 },
    { src: "/images/abbey-road/nursery-room-4.webp", caption: "Nursery room", alt: "Soft toys on a rug in the Abbey Road nursery room", width: 1600, height: 1067 },
    { src: "/images/abbey-road/baby-play-area.webp", caption: "Nursery room", alt: "A baby play gym and soft toys on a colourful rug", width: 1600, height: 1067 },
    { src: "/images/abbey-road/baby-play-gym.webp", caption: "Nursery room", alt: "Hanging toys on a baby play gym above fabric books", width: 1600, height: 1067 },
    { src: "/images/abbey-road/sofa-and-walker.webp", caption: "Nursery room", alt: "A wooden baby walker beside a sofa and bookshelf", width: 1600, height: 1067 },
    { src: "/images/abbey-road/sofa-teddy.webp", caption: "Nursery room", alt: "A teddy bear and picture book on a sofa by the windows", width: 1600, height: 1067 },
    { src: "/images/abbey-road/sleep-area.webp", caption: "Sleep area", alt: "Low cot beds lined up in the Abbey Road sleep area", width: 1600, height: 1067 },
    { src: "/images/abbey-road/sleep-area-2.webp", caption: "Sleep area", alt: "Cloud-shaped low beds in the Abbey Road sleep area", width: 1600, height: 1067 },
    { src: "/images/abbey-road/childrens-bathroom.webp", caption: "Children’s bathroom", alt: "Child-sized toilets with yellow doors in the children’s bathroom", width: 1600, height: 1067 },
    { src: "/images/abbey-road/kitchen.webp", caption: "Kitchen", alt: "The Abbey Road kitchen with ovens, worktops and a fridge", width: 1600, height: 1067 },
    { src: "/images/abbey-road/entrance.webp", caption: "Entrance", alt: "The outside entrance to the Abbey Road nursery", width: 1600, height: 1067 },
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

    <div className="gallery-grid nursery-fade" key={selected}>
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
