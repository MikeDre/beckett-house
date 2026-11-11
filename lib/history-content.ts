import type { PageImage } from "./nursery-pages";
export type HistoryContent = {seoTitle:string;seoDescription:string;texts:Record<string,string>;image:PageImage};
export type HistoryRecord = {slug:"history";title:"Our history";path:"/history";draft:HistoryContent|null;published:HistoryContent;draftUpdatedAt:string|null;publishedAt:string|null;version:number};
export const defaultHistoryContent:HistoryContent = {
  "seoTitle": "Our History",
  "seoDescription": "The history of Beckett House Montessori in Barnsbury, Islington, from its opening in January 1996 to lasting connections with nursery families.",
  "texts": {
    "text1": "A Brief History",
    "text2": "Beckett House is a Montessori nursery school, established in 1996 in Barnsbury, Islington, North London. We now also have a second setting in St John’s Wood.",
    "text3": "We opened in January 1996 since when we have established ourselves as one of the most popular nursery schools in the area with a somewhat boutique appeal; with most of our current children being here due to recommendations from previous parents.",
    "text4": "The head teacher and the core members of staff are Montessori qualified and those with other qualifications offer the advantages of their own particular training within the guidance of the head.",
    "text5": "Parents maintain it is the **‘home from home’** nature that sets Beckett House apart from other nurseries.",
    "text6": "Abbey Road",
    "text7": "Our new setting on Abbey Road aims to provide high quality care for the community, learning outcomes for your children and developing careers for our teachers. We opened in Summer 2026. At Beckett House we recognise the parent carer as a primary educator of the child and we pride ourselves on working closely in partnership. Respect is shown to family traditions and childcare practices and every effort is made to comply with parents’ wishes for their children where appropriate to the ethos of our school.",
    "text8": "At Beckett House it will be our initial aim to introduce the children to the philosophy of the Montessori method of education. To make this possible we have fully equipped our school with a complete range of genuine Montessori materials. Montessori materials are unique, beautiful, mainly wooden and carefully crafted by experts.",
    "text9": "Learning is a key ingredient in its philosophy but so is care, nurturing, discipline, parental involvement, family values and an encouragement to embrace the world and all its wonders.",
    "text10": "Many children move on to some of the best schools in London and since 2006 some of its first ever children have been coming back for their work experience; tall, clever and just amazing!"
  },
  "image": {
    "src": "/images/angel/montessori-nursery-angel-classroom-and-kitchen.webp",
    "alt": "The Angel classroom with a round table, low shelves and the nursery kitchen area",
    "width": 2000,
    "height": 1333
  }
};
function text(value:unknown,label:string,max:number):string {if(typeof value!=="string" || !value.trim() || value.length>max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new Error(`${label} must be plain text, up to ${max} characters.`);return value;}
export function validateHistoryContent(value:unknown):HistoryContent {
 if(!value || typeof value!=="object" || Array.isArray(value))throw new Error("Invalid History page content.");
 const v=value as HistoryContent;if(!v.texts || typeof v.texts!=="object" || !v.image)throw new Error("Invalid History page sections.");
 const image=v.image;if(typeof image.src!=="string" || !/^\/images\/[\w/-]+\.(webp|jpe?g|png|avif)$/i.test(image.src) || image.src.includes("..") || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width<1 || image.height<1 || image.width>12000 || image.height>12000)throw new Error("Choose a valid library image.");
 return {seoTitle:text(v.seoTitle,"Search title",200),seoDescription:text(v.seoDescription,"Search description",500),texts:Object.fromEntries(Object.keys(defaultHistoryContent.texts).map(key=>[key,text(v.texts[key],"Page text",4000)])),image:{src:image.src,alt:text(image.alt,"Image description",500),width:image.width,height:image.height}};
}
