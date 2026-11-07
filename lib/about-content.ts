import type { PageImage } from "./nursery-pages";
export type AboutContent = { seoTitle:string; seoDescription:string; texts:Record<string,string>; images:PageImage[] };
export type AboutRecord = { slug:"about";title:"About Beckett House";path:"/beckett-house";draft:AboutContent|null;published:AboutContent;draftUpdatedAt:string|null;publishedAt:string|null;version:number };
export const defaultAboutContent:AboutContent = {
  "seoTitle": "About Beckett House",
  "seoDescription": "Discover Beckett House, a family-run Montessori preschool in Barnsbury, Islington: individual attention, hands-on learning and home-cooked food since 1996.",
  "texts": {
    "paragraph1": "“We believe education is important... we believe language, the command of numbers and social behaviour are important... but more than anything, we believe your children should be happy and confident and enjoy every moment of their time at nursery school.”",
    "paragraph2": "It is a calm and comfortable environment, where ages 2 to 5 play together in one room that is divided into the different Montessori areas, such as: language and maths, art, etc. Children are free to choose their Montessori activities, with support from specialist staff. Care is child centered, and our attentive teachers have stayed here for years. Key workers especially relate to their assigned children. We work in partnership with parents, meeting once per term, and speaking throughout.",
    "paragraph3": "More a **home-from-home** where your children learn",
    "paragraph4": "The focus of Beckett House Nursery School is to provide the best possible environment for the children who attend.",
    "paragraph5": "The nursery offers Montessori education in a very calm, safe, warm, home from home environment, where children aged between two to five years play and learn together.",
    "paragraph6": "Through continuous observations and a tailored approach, we strive to meet each child's needs with emphasis on hands-on independent learning. This encourages children's natural curiosity and helps them to learn by doing things for themselves and with other children.",
    "paragraph7": "In addition to the Montessori philosophy we follow the Early Years Foundation Stage (EYFS). The principles underlying the EYFS are ones with which Montessori teachers are familiar and which they enthusiastically endorse.",
    "paragraph8": "Beckett House Montessori Nursery School has been established to give young pre-school children a very sound introduction to education. We believe that it is important for your child to spend this transitional period in a ‘home from home’ environment where the staff are experienced, friendly and responsible and the school safe, warm and welcoming.",
    "paragraph9": "Children are welcomed from the age of two and a quarter. Much time will be spent initially in accommodating the children and their **individual needs** while carefully introducing them to the concept of ‘school’ with its classroom layout, educational materials and daily routines.",
    "paragraph10": "The curriculum is varied and follows the Montessori philosophy. The children are encouraged at all times to **experience**, to **experiment** and above all to develop a love for learning. The **high ratio of staff** to children, on average one to six, allows much one-to-one encouragement and guidance and ensures that the children are offered the best opportunity to find faith in themselves and to reach their full potential. The school also offers dance, music, drama, yoga and sport as part of the extracurricular activities.",
    "paragraph11": "Lunch is home-cooked, prepared from **fresh ingredients** in our own kitchen. All meals are nutritionally balanced and varied and we can accommodate most **dietary needs**. The school will not provide sugar, sweets or crisps.",
    "text1": "About Beckett House",
    "text2": "Montessori accredited",
    "text28": "Beckett House Montessori is a ‘good’ rated, and Montessori ‘MEAB’ ",
    "text4": "accredited",
    "text29": ", family run preschool.",
    "text6": "Not so much a school...",
    "text13": "Individual attention",
    "text15": "A love for learning creates confidence in their own abilities",
    "text19": "Home-cooked food",
    "text22": "Find out more",
    "text23": "Daily timetable",
    "text24": "Funding",
    "text25": "Term dates",
    "text26": "Opening hours & fees",
    "text27": "Explore our history"
  },
  "images": [
    {
      "src": "/images/abbey-road/main-room-3.webp",
      "alt": "The bright main room at Abbey Road, with a sofa, child-sized tables and shelves of Montessori materials",
      "width": 1600,
      "height": 1067
    },
    {
      "src": "/images/children-circle-time.jpg",
      "alt": "Children taking part in a classroom group activity",
      "width": 900,
      "height": 590
    },
    {
      "src": "/images/abbey-road/alphabet-carpet.webp",
      "alt": "An alphabet carpet with soft toys in a bright nursery room with Montessori shelves beyond",
      "width": 1600,
      "height": 1067
    },
    {
      "src": "/images/angel/montessori-nursery-angel-snack-tables.webp",
      "alt": "Child-sized tables and chairs beside the nursery kitchen area",
      "width": 2000,
      "height": 1333
    }
  ]
};
export const aboutSections = [{"title": "Welcome and accreditation", "keys": ["text1", "text2", "paragraph1"]}, {"title": "Introduction", "keys": ["text28", "text4", "text29", "paragraph2"]}, {"title": "Home from home", "keys": ["text6", "paragraph3"]}, {"title": "Our approach", "keys": ["paragraph4", "paragraph5", "paragraph6", "paragraph7", "paragraph8"]}, {"title": "Care and learning", "keys": ["text13", "paragraph9", "text15", "paragraph10", "text19", "paragraph11"]}, {"title": "Useful links", "keys": ["text22", "text23", "text24", "text25", "text26"]}, {"title": "Our history", "keys": ["text27"]}];

function text(v:unknown,max:number):string { if(typeof v!=="string" || !v.trim() || v.length>max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)) throw new Error("Enter plain text within the field limit."); return v; }
export function validateAboutContent(value:unknown):AboutContent {
 if(!value || typeof value!=="object") throw new Error("Invalid About page content.");
 const v=value as AboutContent;
 if(!v.texts || typeof v.texts!=="object" || !Array.isArray(v.images) || v.images.length!==defaultAboutContent.images.length) throw new Error("Invalid About page sections.");
 const texts=Object.fromEntries(Object.keys(defaultAboutContent.texts).map(key=>[key,text(v.texts[key],4000)]));
 const images=v.images.map(image=>{ if(!image || !/^\/images\/[\w/-]+\.(webp|jpe?g|png|avif)$/i.test(image.src) || image.src.includes("..") || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width<1 || image.height<1 || image.width>12000 || image.height>12000) throw new Error("Choose a valid library image."); return {src:image.src,alt:text(image.alt,500),width:image.width,height:image.height}; });
 return {seoTitle:text(v.seoTitle,200),seoDescription:text(v.seoDescription,500),texts,images};
}
