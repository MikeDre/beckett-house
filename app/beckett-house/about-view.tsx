import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AboutContent } from "../../lib/about-content";
function AboutFeatureCard({ src, alt, width, height, children }: { src: string; alt: string; width: number; height: number; children: ReactNode }) {
  return <article>
    <Image className="about-feature-image" src={src} alt={alt} width={width} height={height} sizes="(min-width: 900px) 30vw, 100vw" loading="lazy" />
    <div className="about-feature-body">{children}</div>
  </article>;
}


function AboutText({text}:{text:string}) { return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part,index)=>part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2,-2)}</strong> : part)}</>; }

export default function AboutView({content}:{content:AboutContent}) { return (
    <main className="about-page">
      <section className="about-beckett-hero" aria-labelledby="about-beckett-title">
        <div className="about-history-copy">
          <h1 id="about-beckett-title">{content.texts.text1}</h1>
          <h2 className="about-accredited-heading">{content.texts.text2}</h2>
          <blockquote className="montessori-opening-quote"><p><AboutText text={content.texts.paragraph1}/></p></blockquote>
        </div>
        <div className="about-beckett-hero-image"><Image {...content.images[0]} alt={content.images[0].alt} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>
      </section>
      <section className="about-school-introduction section-pad" aria-label="Our Montessori preschool">
        <p className="about-lede">{content.texts.text28.trimEnd()}{" "}<a className="text-link" href="https://www.montessori.org.uk/wp-content/uploads/2018/06/Beckett-House.pdf" target="_blank" rel="noopener noreferrer">{content.texts.text4}</a>{content.texts.text29.trimStart().startsWith(",") ? content.texts.text29.trimStart() : ` ${content.texts.text29.trimStart()}`}</p>
        <p><AboutText text={content.texts.paragraph2}/></p>
      </section>
      <section className="about-home-from-home section-pad" aria-labelledby="home-from-home-title">
        <h2 id="home-from-home-title">{content.texts.text6}</h2>
        <p><AboutText text={content.texts.paragraph3}/></p>
      </section>
      <section className="about-school-philosophy section-pad" aria-label="Our approach to care and learning">
        <div>
          <p><AboutText text={content.texts.paragraph4}/></p>
          <p><AboutText text={content.texts.paragraph5}/></p>
          <p><AboutText text={content.texts.paragraph6}/></p>
        </div>
        <div>
          <p><AboutText text={content.texts.paragraph7}/></p>
          <p><AboutText text={content.texts.paragraph8}/></p>
        </div>
      </section>
      <section className="about-feature-grid section-pad" aria-label="Care at Beckett House">
        <AboutFeatureCard {...content.images[1]}><h3>{content.texts.text13}</h3><p><AboutText text={content.texts.paragraph9}/></p></AboutFeatureCard>
        <AboutFeatureCard {...content.images[2]}><h3>{content.texts.text15}</h3><p><AboutText text={content.texts.paragraph10}/></p></AboutFeatureCard>
        <AboutFeatureCard {...content.images[3]}><h3>{content.texts.text19}</h3><p><AboutText text={content.texts.paragraph11}/></p></AboutFeatureCard>
      </section>
      <nav className="about-useful-links section-pad" aria-label="Find out more">
        <h2>{content.texts.text22}</h2>
        <div>
          <Link href="/timetable">{content.texts.text23}</Link>
          <Link href="/opening-hours-fees#funding">{content.texts.text24}</Link>
          <Link href="/timetable#term-dates">{content.texts.text25}</Link>
          <Link href="/opening-hours-fees">{content.texts.text26}</Link>
        </div>
      </nav>
      <nav id="history" className="about-useful-links section-pad" aria-label="Our history"><Link href="/history">{content.texts.text27}</Link></nav>
    </main>

); }
