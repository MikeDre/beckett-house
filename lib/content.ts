export type Announcement = {
  id: string;
  category: string;
  title: string;
  summary?: string;
  date?: string;
  dateLabel?: string;
  href?: string;
  linkLabel?: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export const homeAnnouncements: Announcement[] = [
  {
    id: "angel-ofsted-2024",
    category: "Angel news",
    title: "Beckett House Montessori in Angel receives a Good Ofsted report",
    summary: "Angel was rated Good across all inspection areas. The report highlights the warm welcome children receive, their growing independence and strong partnerships with parents.",
    date: "2024-01-29",
    dateLabel: "Inspected 29 January 2024",
    href: "https://files.ofsted.gov.uk/v1/file/50241041",
    linkLabel: "Read the Ofsted report (PDF)",
    image: {
      src: "/images/angel-ofsted-news.jpg",
      alt: "A Beckett House classroom with child-sized tables, chairs and learning materials",
      width: 786,
      height: 523,
    },
  },
  {
    id: "interactive-learning",
    category: "Nursery news",
    title: "Meet Robot NAO and our interactive learning table",
    summary: "Robot NAO is an interactive learning companion at Beckett House. Our interactive table brings playful multitouch activities into the classroom, giving children another way to explore and learn together.",
    image: { src: "/images/interactive-learning-news.jpg", alt: "Beckett House announcement introducing Robot NAO and an interactive multitouch learning table", width: 938, height: 523 },
  },
  {
    id: "abbey-road-opening",
    category: "Nursery news",
    title: "Our new setting in St John’s Wood is now open",
    summary: "Beckett House Abbey Road opened in summer 2026, welcoming babies and children from 3 months to 5 years in dedicated baby, toddler and preschool rooms.",
    href: "/abbey-road",
    linkLabel: "Discover Abbey Road",
    image: { src: "/images/abbey-road/main-room-4.webp", alt: "The main Abbey Road classroom, with low Montessori shelves, activity tables and a sofa", width: 1600, height: 1067 },
  },
];

export type Location = {
  slug: "angel" | "abbey-road";
  name: string;
  area: string;
  strapline: string;
  ages: string;
  ageDetail: string;
  address: string;
  streetAddress: string;
  addressLocality: string;
  postcode: string;
  email: string;
  phone: string;
  phoneHref: string;
  /** Google Maps listing for the nursery (opens from the footer address). */
  mapsUrl: string;
  opening: string;
  year: string;
  status: string;
  image: string;
  imageAlt: string;
  colour: "lilac" | "blue";
  latitude: number;
  longitude: number;
  nearby: string[];
  highlights: string[];
  welcome: string[];
  carePillars: Array<{ title: string; copy: string }>;
  history: string;
  weeksOpen: string;
  sessionDetail: string;
  localDetail?: string;
  roomStages?: Array<{
    name: string;
    age: string;
    copy: string;
  }>;
  day: Array<{ time: string; label: string }>;
  ofstedUrl: string;
  panoramas: Array<{
    name: string;
    description: string;
    src: string;
  }>;
};

export const locations: Location[] = [
  {
    slug: "angel",
    name: "Angel",
    area: "Barnsbury, Islington",
    strapline: "A home from home where your children learn.",
    ages: "2–5 years",
    ageDetail: "A calm mixed-age preschool community for children aged 2 to 5.",
    address: "98 Richmond Avenue, Barnsbury, Islington, London",
    streetAddress: "98 Richmond Avenue",
    addressLocality: "Islington",
    postcode: "N1 0LL",
    email: "info@beckett-house.co.uk",
    phone: "020 7278 8824",
    phoneHref: "+442072788824",
    mapsUrl: "https://www.google.com/maps?cid=12467953049128823895",
    opening: "Monday–Friday, 8am–6pm",
    year: "Since 1996",
    status: "Ofsted rated Good",
    image: "/images/angel/montessori-nursery-angel-classroom-islington.webp",
    imageAlt:
      "A bright Beckett House Montessori classroom with low wooden shelves and child-sized tables",
    colour: "lilac",
    latitude: 51.538641,
    longitude: -0.109271,
    nearby: ["Angel", "Upper Street", "Caledonian Road"],
    highlights: [
      "MEAB-accredited Montessori practice",
      "Long-standing, experienced teaching team",
      "Home-cooked lunches and flexible sessions",
    ],
    welcome: [
      "Beckett House is a family-run, MEAB-accredited Montessori preschool where children aged two to five play and learn together in one calm, comfortable room.",
      "The room is divided into Montessori areas including language, mathematics and art. Children are free to choose purposeful activities, supported by specialist staff and attentive key workers who know them well.",
      "Continuous observation helps us tailor each child’s experience. Alongside the Montessori philosophy, we follow the Early Years Foundation Stage and work closely with parents throughout their child’s time with us.",
    ],
    carePillars: [
      {
        title: "Individual attention",
        copy: "We take time to understand each child and introduce them gently to the classroom, its materials and the rhythm of the day.",
      },
      {
        title: "A love of learning",
        copy: "Children are encouraged to experience, experiment and discover, building confidence in their own abilities through hands-on learning.",
      },
      {
        title: "Home-cooked food",
        copy: "Lunch is freshly prepared in our kitchen. Meals are balanced and varied, and most dietary needs can be accommodated.",
      },
    ],
    history:
      "Beckett House opened in Barnsbury in January 1996. Since then it has grown largely through recommendations from local families, while retaining the home-from-home character parents say sets it apart.",
    weeksOpen: "48 weeks a year",
    sessionDetail:
      "Choose from flexible morning, afternoon and full-day sessions. Eligible families can use 15 or 30 funded hours, including Working Parent Entitlements.",
    localDetail:
      "We make regular use of nearby Islington parks and garden squares, including Lonsdale Square and Barnard Park.",
    day: [
      { time: "8:00", label: "Arrival for all-day children" },
      { time: "8:00", label: "Montessori work cycle & circle time" },
      { time: "11:30", label: "Group activity or project work" },
      { time: "12:30", label: "Home-cooked lunch" },
      { time: "14:00", label: "Afternoon children arrive" },
      { time: "16:30", label: "Music, stories & movement" },
      { time: "18:00", label: "Home time" },
    ],
    ofstedUrl: "https://reports.ofsted.gov.uk/provider/16/131668",
    panoramas: [
      {
        name: "Main classroom",
        description: "The heart of our Angel setting",
        src: "/panoramas/angel/main.jpg",
      },
      {
        name: "Learning space one",
        description: "Materials prepared at a child’s height",
        src: "/panoramas/angel/space1.jpg",
      },
      {
        name: "Learning space two",
        description: "A calm place for independent work",
        src: "/panoramas/angel/space2.jpg",
      },
      {
        name: "Learning space three",
        description: "Room to choose, concentrate and explore",
        src: "/panoramas/angel/space3.jpg",
      },
    ],
  },
  {
    slug: "abbey-road",
    name: "Abbey Road",
    area: "St John’s Wood",
    strapline: "A new home from home where your children learn.",
    ages: "3 months–5 years",
    ageDetail:
      "Dedicated baby, toddler and preschool rooms, growing with children from 3 months to 5 years.",
    address: "Abbey Hive, 84–86 Abbey Road, London",
    streetAddress: "Abbey Hive, 84–86 Abbey Road",
    addressLocality: "St John's Wood",
    postcode: "NW8 0QA",
    email: "abbeyroad@beckett-house.co.uk",
    phone: "020 4568 7042",
    phoneHref: "+442045687042",
    mapsUrl: "https://www.google.com/maps/place/84-86+Abbey+Rd.,+London+NW8+0QA/data=!4m2!3m1!1s0x48761a9ef8f878d7:0x82948ec9092e97b7",
    opening: "Monday–Friday, 8am–6pm",
    year: "Now open",
    status: "Ofsted registered",
    image: "/images/abbey-road/main-room-4.webp",
    imageAlt:
      "The main Abbey Road classroom, with low Montessori shelves, activity tables and a sofa",
    colour: "blue",
    latitude: 51.538865,
    longitude: -0.185502,
    nearby: ["St John’s Wood", "West Hampstead", "Kilburn"],
    highlights: [
      "Separate baby, toddler and preschool rooms",
      "Sleep, feeding and outdoor spaces for babies",
      "Open 50 weeks a year with funded places available",
    ],
    welcome: [
      "Abbey Road welcomes children from three months to five years into a calm, safe and warm Montessori environment. Fully trained Montessori teachers work alongside childcare specialists so every stage receives the care it needs.",
      "Through continuous observation and a tailored approach, we support children’s natural curiosity and encourage them to learn by doing things for themselves and alongside others.",
      "Our teaching and caring teams are led by Kim Redman, who brings more than 30 years of childcare experience and a deep understanding of Montessori education and homely nursery care.",
    ],
    carePillars: [
      {
        title: "Individual attention",
        copy: "Children are welcomed from three months, with routines, care and learning shaped around their individual needs from the beginning.",
      },
      {
        title: "A love of learning",
        copy: "Genuine Montessori materials invite independent discovery, helping children develop concentration, motivation and confidence.",
      },
      {
        title: "Home-cooked food",
        copy: "Fresh, nutritionally balanced lunches are prepared in our own kitchen, with most dietary requirements accommodated.",
      },
    ],
    history:
      "Abbey Road is Beckett House’s second-generation nursery setting, created to bring high-quality care, strong learning outcomes and Montessori careers to the local community. It opened in summer 2026.",
    weeksOpen: "50 weeks a year",
    sessionDetail:
      "Choose any suitable combination of morning, afternoon and full-day sessions. Eligible families can access 15 or 30 funded hours and Working Parent Entitlements.",
    roomStages: [
      {
        name: "Baby room",
        age: "From 3 months",
        copy: "Cuddles, love and fun, with a dedicated sleep area, feeding station, outdoor play and a learning plan recorded each day.",
      },
      {
        name: "Toddler room",
        age: "Once walking",
        copy: "Children move through ability rather than age, developing as strong, healthy learners and skilful communicators.",
      },
      {
        name: "Preschool room",
        age: "Preparing for school",
        copy: "Montessori materials invite children to choose, discover and build concentration, self-discipline and a lasting love of learning.",
      },
    ],
    day: [
      { time: "8:00", label: "A warm welcome" },
      { time: "9:15", label: "Montessori work & child-led discovery" },
      { time: "12:00", label: "Home-cooked lunch" },
      { time: "13:15", label: "Rest and individual routines" },
      { time: "14:15", label: "Play, projects & outdoor time" },
      { time: "16:30", label: "Stories, music & movement" },
      { time: "18:00", label: "Home time" },
    ],
    ofstedUrl: "https://reports.ofsted.gov.uk/provider/16/2893397",
    panoramas: [
      {
        name: "Welcome lobby",
        description: "The entrance to our Abbey Road setting",
        src: "/panoramas/abbey-road/abbey-road-lobby.jpg",
      },
      {
        name: "Main learning space",
        description: "An open room prepared for discovery",
        src: "/panoramas/abbey-road/abbey-road-space-1.jpg",
      },
      {
        name: "Nursery room",
        description: "A warm, ordered space for younger children",
        src: "/panoramas/abbey-road/abbey-road-nursery-carpet.jpg",
      },
      {
        name: "Practical life area",
        description: "Everyday activities made child-sized",
        src: "/panoramas/abbey-road/abbey-road-nursery-kitchen.jpg",
      },
      {
        name: "Quiet area",
        description: "A softer corner for stories and rest",
        src: "/panoramas/abbey-road/abbey-road-quiet-area.jpg",
      },
      {
        name: "Carpet area",
        description: "Space to gather, read and work together",
        src: "/panoramas/abbey-road/abbey-road-outer-carpet.jpg",
      },
      {
        name: "Culture area",
        description: "Materials that open up the wider world",
        src: "/panoramas/abbey-road/abbey-road-culture-sign.jpg",
      },
      {
        name: "Kitchen",
        description: "Where nourishing meals are prepared",
        src: "/panoramas/abbey-road/abbey-road-kitchen-1.jpg",
      },
      {
        name: "Children’s bathroom",
        description: "Designed to support everyday independence",
        src: "/panoramas/abbey-road/abbey-road-childrens-bathroom.jpg",
      },
      {
        name: "Outdoor space",
        description: "Fresh air, movement and outdoor exploration",
        src: "/panoramas/abbey-road/abbey-road-outdoor.jpg",
      },
    ],
  },
];

export const homeFaqs = [
  {
    question: "What ages does Beckett House accept?",
    answer:
      "Abbey Road welcomes babies and children from 3 months to 5 years. Angel is a mixed-age Montessori preschool for children aged 2 to 5.",
  },
  {
    question: "What are the opening hours?",
    answer:
      "Both nurseries are open Monday to Friday from 8am to 6pm. Angel opens for 48 weeks each year and Abbey Road for 50 weeks. Flexible morning, afternoon and full-day sessions are available, subject to places.",
  },
  {
    question: "Do you offer 15 and 30 funded hours?",
    answer:
      "Yes. Eligible families can use government-funded hours, including working parent entitlements. The team will help you understand how your hours can be used across the nursery year.",
  },
  {
    question: "Can we visit before applying?",
    answer:
      "Absolutely. A visit is the best way to meet the team, see the prepared environment and talk through your child’s routine. Choose a location and request a suitable time.",
  },
  {
    question: "Is Beckett House Montessori accredited?",
    answer:
      "Yes. Beckett House is MEAB accredited. Montessori-qualified teachers work alongside colleagues with complementary childcare qualifications, and both settings also follow the Early Years Foundation Stage.",
  },
  {
    question: "What food is provided?",
    answer:
      "Lunch is home-cooked from fresh ingredients in the nursery kitchen. Meals are nutritionally balanced and varied, and the team can accommodate most dietary needs. Fruit, milk and low-sugar snacks are also provided.",
  },
];

export const principles = [
  {
    title: "Individual attention",
    copy: "Children are known well and introduced gently to the classroom, its materials and daily routines.",
    className: "principle-sun",
  },
  {
    title: "A love of learning",
    copy: "Children experience, experiment and make discoveries, building confidence in their own abilities.",
    className: "principle-blue",
  },
  {
    title: "Home-cooked food",
    copy: "Fresh, balanced and varied meals are prepared in our own kitchens, with most dietary needs accommodated.",
    className: "principle-lilac",
  },
];

export function getLocationFaqs(location: Location) {
  return [
    {
      question: `What ages can attend Beckett House ${location.name}?`,
      answer: location.ageDetail,
    },
    {
      question: `What are the opening hours at ${location.name}?`,
      answer: `Beckett House ${location.name} is open ${location.opening.toLowerCase()} and ${location.weeksOpen.toLowerCase()}.`,
    },
    {
      question: `Does ${location.name} offer funded childcare hours?`,
      answer: location.sessionDetail,
    },
    {
      question: `Is Beckett House ${location.name} a Montessori nursery?`,
      answer:
        "Yes. Montessori-trained teachers support child-led, hands-on learning in a carefully prepared environment, alongside the Early Years Foundation Stage.",
    },
    {
      question: `How can I visit Beckett House ${location.name}?`,
      answer: `Book a nursery visit online, call ${location.phone}, or email ${location.email}. The team will arrange a relaxed tour and answer questions about routines, sessions, funding and availability.`,
    },
  ];
}

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}
