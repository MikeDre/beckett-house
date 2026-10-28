import { getLocation, getLocationFaqs, homeFaqs, principles } from "./content";
export type NurseryPageSlug = "angel" | "abbey-road";
export type PageImage = { src: string; alt: string; width: number; height: number };
export type NurseryPageContent = {
 seoTitle:string; seoDescription:string;
 hero:{eyebrow:string;heading:string;introduction:string;buttonLabel:string;slides:PageImage[]};
 approach:{heading:string;body:string;linkLabel:string;image:PageImage};
 principles:{title:string;body:string;label:string}[];
 explorer:{eyebrow:string;heading:string;body:string;noteTitle:string;noteBody:string};
 life:{heading:string;cards:{title:string;body:string;image:PageImage}[]};
 locationsHeading:string;
 highlights:{paragraphs:string[];linkLabel:string;cards:{title:string;body:string}[]};
 testimonials:{quote:string;author:string}[];
 faqs:{heading:string;contactLabel:string;items:{question:string;answer:string}[]};
};
export type NurseryPageRecord = {slug:NurseryPageSlug;title:string;path:string;draft:NurseryPageContent|null;published:NurseryPageContent;draftUpdatedAt:string|null;publishedAt:string|null;version:number};
const abbey = getLocation("abbey-road")!;
export const defaultNurseryPages:Record<NurseryPageSlug,NurseryPageContent> = {
"angel":{
  "seoTitle": "Montessori Nursery in Angel, Islington | Beckett House",
  "seoDescription": "A warm, family-run Montessori nursery for children from 3 months to 5 years, with settings in Angel, Islington and Abbey Road, St John's Wood.",
  "hero": {
    "eyebrow": "Montessori nursery in Angel, Islington",
    "heading": "Calm spaces. Beautiful materials. Everything within reach.",
    "introduction": "A home from home where your children learn, in Angel and Abbey Road.",
    "buttonLabel": "Book a visit",
    "slides": [
  { src: "/images/angel/montessori-nursery-angel-classroom-islington.webp", alt: "A wide view across the Beckett House Montessori classroom in Angel", width: 2000, height: 1332 },
  { src: "/images/angel/montessori-nursery-angel-classroom-planets.webp", alt: "The Angel classroom with hanging planets, cardboard rockets and child-sized tables", width: 2000, height: 1333 },
  { src: "/images/angel/montessori-nursery-angel-classroom-reading-area.webp", alt: "A sofa, rugs and bookshelves in the Angel reading area", width: 2000, height: 1333 },
  { src: "/images/angel/montessori-nursery-angel-reading-loft.webp", alt: "A wooden reading loft with cushions in the Angel classroom", width: 2000, height: 1333 },
]
  },
  "approach": {
    "heading": "Happy, confident and enjoying every moment.",
    "body": "Language, numbers and social development matter. More than anything, we want children to feel happy and confident, with the freedom to discover and do things for themselves.",
    "linkLabel": "How Montessori works",
    "image": {
      "src": "/images/child-face-paint-smile.jpg",
      "alt": "A smiling child with colourful face paint sitting at a table in a Montessori classroom",
      "width": 1600,
      "height": 1016
    }
  },
  "principles": principles.map(p => ({title:p.title,body:p.copy,label:""})),
  "explorer": {
    "eyebrow": "Step inside",
    "heading": "See the room at their level, before you visit.",
    "body": "Our classrooms are calm, safe and carefully prepared with genuine Montessori materials, beautiful, mainly wooden and made for hands-on independent learning.",
    "noteTitle": "Interactive room explorer",
    "noteBody": "Drag the view, then book a real walkthrough with the team."
  },
  "life": {
    "heading": "A familiar rhythm, with something new to discover.",
    "cards": [
      {
        "title": "Calm spaces to concentrate",
        "body": "Children choose purposeful Montessori activities, repeat them at their own pace and learn to return each material with care.",
        "image": {
          "src": "/images/angel/montessori-nursery-angel-cosy-book-corner.webp",
          "alt": "A cosy book corner with a sofa, rugs and bookshelves",
          "width": 2000,
          "height": 1333
        }
      },
      {
        "title": "Learning through movement",
        "body": "Music, dance, drama, yoga and sport sit alongside outdoor time and neighbourhood visits to local parks and garden squares.",
        "image": {
          "src": "/images/angel/montessori-nursery-angel-music-and-interactive-screen.webp",
          "alt": "A keyboard, puzzles and an interactive screen beside colourful rugs",
          "width": 2000,
          "height": 1333
        }
      },
      {
        "title": "Families stay involved",
        "body": "Key workers know their children well, share observations and keep conversations with parents part of the everyday routine.",
        "image": {
          "src": "/images/angel/montessori-nursery-angel-earth-day-artwork.webp",
          "alt": "Children’s Earth Day artwork with handprints and magnetic shapes",
          "width": 2000,
          "height": 1333
        }
      }
    ]
  },
  "locationsHeading": "Where to find us",
  "highlights": {
    "paragraphs": [
      "A close-knit, family-run nursery where children are known as individuals and parents remain part of the everyday conversation."
    ],
    "linkLabel": "Discover our approach",
    "cards": [
      {
        "title": "Family-run since 1996",
        "body": "Second-generation care with the same home-from-home feeling."
      },
      {
        "title": "Montessori accredited",
        "body": "Genuine materials, trained teachers and purposeful independence."
      },
      {
        "title": "Funded places available",
        "body": "Eligible families can access 15 or 30 funded hours."
      }
    ]
  },
  "testimonials": [
    {
      "quote": "The staff are fantastic, and being family-run gives you a warm, caring feeling. The children all seem really happy when you drop off and pick up.",
      "author": "Georgina H · Beckett House parent"
    },
    {
      "quote": "A welcoming place to learn, explore and grow in confidence, with thoughtful care at every step.",
      "author": ""
    },
    {
      "quote": "Little discoveries, new friendships and the freedom to try things for themselves. Every day brings something to smile about.",
      "author": ""
    }
  ],
  "faqs": {
    "heading": "Have a question?",
    "contactLabel": "Get in contact",
    "items": homeFaqs
  }
},
"abbey-road":{
  "seoTitle": "Montessori Nursery in St John's Wood, NW8 | Beckett House",
  "seoDescription": "Beckett House Abbey Road is a family-run Montessori nursery for 3 months–5 years, open Monday to Friday, 8am–6pm. Explore the rooms and book a visit.",
  "hero": {
    "eyebrow": "Our new Montessori nursery on Abbey Road, NW8",
    "heading": "A new home from home where your children learn.",
    "introduction": "",
    "buttonLabel": "Book a visit",
    "slides": [
  { src: "/images/abbey-road/main-room-hero.webp", alt: abbey.imageAlt, width: 2560, height: 1707 },
  { src: "/images/hero/abbey-road-2.webp", alt: "A wide view of the Abbey Road main learning space with tables and low shelves", width: 2400, height: 1600 },
  { src: "/images/hero/abbey-road-3.webp", alt: "Low Montessori shelves and a sofa in the Abbey Road main room", width: 2400, height: 1600 },
  { src: "/images/hero/abbey-road-4.webp", alt: "The Abbey Road nursery room with a play mat, soft toys and a sofa", width: 2400, height: 1600 },
]
  },
  "approach": {
    "heading": "Not so much a school… More a home-from-home where your children learn.",
    "body": "We believe education is important. We believe language, the command of numbers and social behaviour are important. But more than anything, we believe your children should be happy and confident and enjoy every moment of their time at nursery school.",
    "linkLabel": "Montessori education",
    "image": {
      "src": "/images/abbey-road/main-room-3.webp",
      "alt": "The Abbey Road main room, with a sofa, activity tables and low Montessori shelves",
      "width": 1600,
      "height": 1067
    }
  },
  "principles": abbey.roomStages!.map(p => ({title:p.name,body:p.copy,label:p.age})),
  "explorer": {
    "eyebrow": "Step inside",
    "heading": "See the room at their level, before you visit.",
    "body": "Our classrooms are calm, safe and carefully prepared with genuine Montessori materials, beautiful, mainly wooden and made for hands-on independent learning.",
    "noteTitle": "Interactive room explorer",
    "noteBody": "Drag the view, then book a real walkthrough with the team."
  },
  "life": {
    "heading": "A sound introduction to education.",
    "cards": abbey.carePillars.map((p,i) => ({title:p.title,body:p.copy,image:{src:["/images/abbey-road/nursery-room.webp","/images/abbey-road/montessori-puzzle.webp","/images/abbey-road/kitchen.webp"][i],alt:"",width:1600,height:1067}}))
  },
  "locationsHeading": "Where to find us",
  "highlights": {
    "paragraphs": [abbey.welcome[2], abbey.history],
    "linkLabel": "",
    "cards": [{title:"Montessori accredited",body:"The head teacher and the core members of staff are Montessori qualified."},{title:"Open 50 weeks a year",body:abbey.opening},{title:"15 or 30 funded hours",body:abbey.sessionDetail}]
  },
  "testimonials": [
    {
      "quote": "Without hesitating I would recommend this nursery. The staff are fantastic, and the fact it's family run also gives you a warm, caring feeling. The children all seem really happy when you drop off and pick up.",
      "author": "Georgina H · daynurseries.co.uk"
    }
  ],
  "faqs": {
    "heading": "Have a question?",
    "contactLabel": "Get in contact",
    "items": getLocationFaqs(abbey)
  }
}
};
function object(value:unknown):Record<string,unknown> {
 if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected nursery content objects.");
 return value as Record<string,unknown>;
}
function text(value:unknown,field:string,max=4000,optional=false):string {
 if (typeof value !== "string" || (!optional && !value.trim()) || value.length>max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || /(?:javascript|vbscript)\s*:/i.test(value)) throw new Error(`${field} must be plain text within ${max} characters.`);
 return value.trim();
}
function list<T>(value:unknown,field:string,min:number,max:number,parse:(v:unknown)=>T):T[] {
 if (!Array.isArray(value) || value.length<min || value.length>max) throw new Error(`${field} requires ${min === max ? min : `${min}–${max}`} items.`);
 return value.map(parse);
}
function image(value:unknown):PageImage {
 const v=object(value),src=text(v.src,"Image path",500);
 if (!/^\/images\/(?:[\w-]+\/)*[\w-]+\.(webp|jpe?g|png|avif)$/i.test(src)) throw new Error("Choose a local image under /images/ without traversal, query or fragment.");
 function dimension(n:unknown):number {if (typeof n!=="number" || !Number.isSafeInteger(n) || n<1 || n>20000) throw new Error("Image dimensions must be positive whole numbers up to 20000.");return n;}
 return {src,alt:text(v.alt,"Image description",500,true),width:dimension(v.width),height:dimension(v.height)};
}
export function validateNurseryPageContent(value:unknown):NurseryPageContent {
 const v=object(value),h=object(v.hero),a=object(v.approach),e=object(v.explorer),l=object(v.life),hi=object(v.highlights),f=object(v.faqs);
 const card=(raw:unknown)=>{const c=object(raw);return {title:text(c.title,"Card title",300),body:text(c.body,"Card body")};};
 return {
 seoTitle:text(v.seoTitle,"SEO title",200),seoDescription:text(v.seoDescription,"SEO description",500),
 hero:{eyebrow:text(h.eyebrow,"Hero eyebrow",300),heading:text(h.heading,"Hero heading",500),introduction:text(h.introduction,"Hero introduction",4000,true),buttonLabel:text(h.buttonLabel,"Button label",100),slides:list(h.slides,"Hero slides",1,8,image)},
 approach:{heading:text(a.heading,"Approach heading",500),body:text(a.body,"Approach body"),linkLabel:text(a.linkLabel,"Approach link",100),image:image(a.image)},
 principles:list(v.principles,"Principles",3,3,raw=>{const p=object(raw);return {...card(p),label:text(p.label,"Principle label",200,true)};}),
 explorer:{eyebrow:text(e.eyebrow,"Explorer eyebrow",300),heading:text(e.heading,"Explorer heading",500),body:text(e.body,"Explorer body"),noteTitle:text(e.noteTitle,"Explorer note title",300),noteBody:text(e.noteBody,"Explorer note body")},
 life:{heading:text(l.heading,"Life heading",500),cards:list(l.cards,"Life cards",3,3,raw=>{const c=object(raw);return {...card(c),image:image(c.image)};})},
 locationsHeading:text(v.locationsHeading,"Locations heading",500),
 highlights:{paragraphs:list(hi.paragraphs,"Highlight paragraphs",1,6,p=>text(p,"Highlight paragraph")),linkLabel:text(hi.linkLabel,"Highlights link",100,true),cards:list(hi.cards,"Highlight cards",3,3,card)},
 testimonials:list(v.testimonials,"Testimonials",1,10,raw=>{const t=object(raw);return {quote:text(t.quote,"Quote"),author:text(t.author,"Author",300,true)};}),
 faqs:{heading:text(f.heading,"FAQ heading",500),contactLabel:text(f.contactLabel,"Contact label",100),items:list(f.items,"FAQs",1,20,raw=>{const q=object(raw);return {question:text(q.question,"Question",500),answer:text(q.answer,"Answer")};})}
 };
}
