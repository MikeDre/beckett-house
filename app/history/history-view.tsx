import Image from "next/image";
import type { HistoryContent } from "../../lib/history-content";
function HistoryText({text}:{text:string}) {return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:part)}</>;}
export default function HistoryView({content}:{content:HistoryContent}) {return (
    <main className="about-page">
      <section className="about-beckett-hero" aria-labelledby="history-title">
        <div className="about-history-copy">
          <h1 id="history-title"><HistoryText text={content.texts.text1}/></h1>
          <p className="about-lede"><HistoryText text={content.texts.text2}/></p>
          <p><HistoryText text={content.texts.text3}/></p>
          <p><HistoryText text={content.texts.text4}/></p>
        </div>
        <div className="about-beckett-hero-image"><Image {...content.image} alt={content.image.alt} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>
      </section>
      <section className="about-home-from-home section-pad" aria-label="What sets Beckett House apart">
        <p><HistoryText text={content.texts.text5}/></p>
      </section>
      <section className="about-history-continuation section-pad" aria-labelledby="abbey-road-history-title">
        <h2 id="abbey-road-history-title"><HistoryText text={content.texts.text6}/></h2>
        <p><HistoryText text={content.texts.text7}/></p>
        <p><HistoryText text={content.texts.text8}/></p>
      </section>
      <section className="about-history-continuation section-pad" aria-label="Learning, care and lasting connections">
        <p><HistoryText text={content.texts.text9}/></p>
        <p><HistoryText text={content.texts.text10}/></p>
      </section>
    </main>

);}
