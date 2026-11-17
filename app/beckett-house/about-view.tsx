import {defaultAboutContent} from "../../lib/about-content";

import {CmsField, CmsImage} from "../cms-content";
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

export default function AboutView({content}:{content:AboutContent}) {
 const images=defaultAboutContent.images.map((fallback,index)=>content.images?.[index] ?? fallback);
 return (
    <main className="about-page">
      <section className="about-beckett-hero" aria-labelledby="about-beckett-title">
        <div className="about-history-copy">
          <h1 id="about-beckett-title"><CmsField page={"about"} field="texts.text1">{content.texts.text1}</CmsField></h1>
          <h2 className="about-accredited-heading"><CmsField page={"about"} field="texts.text2">{content.texts.text2}</CmsField></h2>
          <blockquote className="montessori-opening-quote"><p><AboutText text={content.texts.paragraph1}/></p></blockquote>
        </div>
        <div className="about-beckett-hero-image"><CmsImage page={"about"} field={((""+".images"+"[0]")).replace(/^\./, '')} {...images[0]} alt={images[0].alt} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>
      </section>
      <section className="about-school-introduction section-pad" aria-label="Our Montessori preschool">
        <p className="about-lede">{content.texts.text28.trimEnd()}{" "}<a className="text-link" href="https://www.montessori.org.uk/wp-content/uploads/2018/06/Beckett-House.pdf" target="_blank" rel="noopener noreferrer"><CmsField page={"about"} field="texts.text4">{content.texts.text4}</CmsField></a>{content.texts.text29.trimStart().startsWith(",") ? content.texts.text29.trimStart() : ` ${content.texts.text29.trimStart()}`}</p>
        <p><AboutText text={content.texts.paragraph2}/></p>
      </section>
      <section className="about-home-from-home section-pad" aria-labelledby="home-from-home-title">
        <h2 id="home-from-home-title"><CmsField page={"about"} field="texts.text6">{content.texts.text6}</CmsField></h2>
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
        <AboutFeatureCard {...images[1]}><h3><CmsField page={"about"} field="texts.text13">{content.texts.text13}</CmsField></h3><p><AboutText text={content.texts.paragraph9}/></p></AboutFeatureCard>
        <AboutFeatureCard {...images[2]}><h3><CmsField page={"about"} field="texts.text15">{content.texts.text15}</CmsField></h3><p><AboutText text={content.texts.paragraph10}/></p></AboutFeatureCard>
        <AboutFeatureCard {...images[3]}><h3><CmsField page={"about"} field="texts.text19">{content.texts.text19}</CmsField></h3><p><AboutText text={content.texts.paragraph11}/></p></AboutFeatureCard>
      </section>
      <nav className="about-useful-links section-pad" aria-label="Find out more">
        <h2><CmsField page={"about"} field="texts.text22">{content.texts.text22}</CmsField></h2>
        <div>
          <Link href="/timetable"><CmsField page={"about"} field="texts.text23">{content.texts.text23}</CmsField></Link>
          <Link href="/opening-hours-fees#funding"><CmsField page={"about"} field="texts.text24">{content.texts.text24}</CmsField></Link>
          <Link href="/timetable#term-dates"><CmsField page={"about"} field="texts.text25">{content.texts.text25}</CmsField></Link>
          <Link href="/opening-hours-fees"><CmsField page={"about"} field="texts.text26">{content.texts.text26}</CmsField></Link>
        </div>
      </nav>
      <nav id="history" className="about-useful-links section-pad" aria-label="Our history"><Link href="/history"><CmsField page={"about"} field="texts.text27">{content.texts.text27}</CmsField></Link></nav>
    </main>

); }
