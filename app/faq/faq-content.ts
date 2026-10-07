export type FaqItem = {
  question: string;
  answer: string;
  sources: string[];
};

export type FaqGroup = {
  id: string;
  heading: string;
  items: FaqItem[];
};

const angelRegistration = "https://www.beckett-house.co.uk/registration";
const angelHome = "https://www.beckett-house.co.uk/";
const about = "https://www.beckett-house.co.uk/beckett-house";
const montessori = "https://www.beckett-house.co.uk/montessori";
const activities = "https://www.beckett-house.co.uk/activities";
const abbeyRoad = "https://www.beckett-house.co.uk/abbeyroad/home-ar";

export const faqGroups: FaqGroup[] = [
  {
    id: "places-and-registration",
    heading: "Places and registration",
    items: [
      {
        question: "What ages do the nurseries accept?",
        answer:
          "At Angel, Beckett House accepts children aged 2 to 5. At Abbey Road, children are accepted from 3 months to 5 years.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "Is there a registration fee?",
        answer:
          "The registration fee is £75. It is non-refundable, does not guarantee a place and does not apply to funded places.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "How much is the deposit?",
        answer:
          "A deposit equal to four weeks’ fees is due when a place is offered and secures the place. The nursery may request an increase if your child’s attendance increases.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "How much notice do I need to give when leaving?",
        answer:
          "A whole term’s written notice is required. With that notice, the deposit is refunded, with any adjustments, by the end of the month after the end of term; it cannot be refunded if a child does not start.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "Can I visit before registering?",
        answer:
          "Yes. Beckett House invites families to arrange a meeting or register to join at either nursery.",
        sources: [angelHome, abbeyRoad],
      },
    ],
  },
  {
    id: "hours-sessions-and-term-dates",
    heading: "Hours, sessions and term dates",
    items: [
      {
        question: "What are the opening hours and session times?",
        answer:
          "Both nurseries are open from 8am to 6pm. At Angel, mornings are 8am–2pm and afternoons are 2pm–6pm; at Abbey Road, mornings are 8am–1pm and afternoons are 1pm–6pm. Full-day care is 8am–6pm at both.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "How many weeks a year are the nurseries open?",
        answer:
          "At Angel, the nursery is open 48 weeks a year and closes for two weeks at Christmas and two weeks in summer. At Abbey Road, it is open 50 weeks a year and closes for two weeks at Christmas. The terms also list bank holidays and three inset training days each year.",
        sources: [angelRegistration, about, abbeyRoad],
      },
      {
        question: "Can funded hours be used throughout the year?",
        answer:
          "Funded-only attendance is available for the government-funded 38 weeks. For a full-time place, funded hours can be stretched across Angel’s 48 open weeks or Abbey Road’s 50 open weeks.",
        sources: [about, abbeyRoad],
      },
      {
        question: "How does settling in work?",
        answer:
          "Before the start date, a child can attend free for short periods, usually a day or two in the final weeks of the previous term. A parent or guardian must attend, although the child may be left briefly with staff agreement.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What should I do if my child will be absent?",
        answer: "Please notify the nursery by 9am if your child cannot attend.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "Who can collect my child?",
        answer:
          "A child will only be released to someone known to a member of staff. The nursery must receive specific instructions about any change to collection arrangements.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What happens if I am late for collection?",
        answer:
          "Call the nursery if you will be late. For persistent late collection that has not been arranged, the nursery reserves the right to charge £5 per minute.",
        sources: [angelRegistration, abbeyRoad],
      },
    ],
  },
  {
    id: "fees-and-funding",
    heading: "Fees and funding",
    items: [
      {
        question: "What are the session prices?",
        answer:
          "At Angel, standard monthly fees are £1,200 for 3 days a week, £1,600 for 4 days and £2,000 for full time (5 days), and are the same for 2, 3 and 4 year olds. Fees with 15 or 30 funded hours applied, and Abbey Road’s fees, which depend on your child’s age, are set out on our Opening Hours & Fees page. Beckett House reserves the right to alter fees without notice.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "When are fees paid, and can I pay by instalments?",
        answer:
          "Invoices are issued monthly. The terms say fees are due in full at the beginning of each term, with an option to pay by instalments on dates and at intervals set by Beckett House; if an instalment is missed, the rest of the term’s fees become due.",
        sources: [about, angelRegistration, abbeyRoad],
      },
      {
        question: "Are fees refunded for missed days?",
        answer:
          "No refunds are made if a child starts late, finishes early, reduces their hours or misses nursery, including through illness. Holidays taken outside nursery closure dates are not deducted.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What 15- and 30-hour funding is available?",
        answer:
          "The universal 15-hour entitlement covers 38 weeks and applies when a child’s third birthday fell in the previous term. Depending on family circumstances, the Working Parents Entitlement provides 30 hours a week from the term after a child turns 9 months, up to 1,140 hours a year; some two-year-olds whose families receive additional government support may receive 15 hours.",
        sources: [about, abbeyRoad],
      },
      {
        question: "Are there additional charges with funded hours?",
        answer:
          "Additional charges apply only to the funded part of a place. At Angel, the listed charges per funded day are £8.10 for food, £3 for non-food consumables and £20 for extra-curricular activities; Abbey Road applies the same categories of charge. Families receiving funding may choose to opt out of additional charges; please speak with the Nursery Manager.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What happens if I opt out of funded-place extras?",
        answer:
          "Children can bring a packed lunch, nappies and wipes from home. If they opt out of extra-curricular activities, trained staff provide other enriched activities on site.",
        sources: [angelRegistration, abbeyRoad],
      },
    ],
  },
  {
    id: "food-and-day-to-day",
    heading: "Food and day-to-day",
    items: [
      {
        question: "What meals and snacks are provided?",
        answer:
          "Lunch is home-cooked, and snacks include fresh and dried fruit, low-sugar biscuits, milk and water. At Angel, full days include morning and afternoon snacks plus a cooked lunch; mornings include a snack and cooked lunch, and afternoons include a light snack.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "Can my child bring sweets or crisps?",
        answer:
          "No. The nurseries do not offer sweets or crisps, and parents are asked not to let children bring them in.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What should my child wear and bring?",
        answer:
          "Children should wear comfortable, washable clothes they can manage, with every item named. Please provide a fabric shoe bag, slippers, a toothbrush and spare clothes, including nappies where relevant; children should not bring money or expensive toys.",
        sources: [angelRegistration, abbeyRoad],
      },
    ],
  },
  {
    id: "health-and-wellbeing",
    heading: "Health and wellbeing",
    items: [
      {
        question: "What happens if my child becomes ill at nursery?",
        answer:
          "Parents are contacted promptly, and the child is cared for until a parent or designated person collects them. Please tell the nursery if your child has been in contact with an infectious disease.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "Can staff give my child medication?",
        answer:
          "Staff cannot administer medicine without consent and instructions. If regular medication is vital, special permission can be arranged, and written instructions must state the dosage and times; verbal instructions are not accepted.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "How do I tell the nursery about allergies or health needs?",
        answer:
          "A health questionnaire covering wellbeing and allergies is sent before your child starts and must be returned by their first day. Tell the nursery if any new allergy develops.",
        sources: [angelRegistration, abbeyRoad],
      },
      {
        question: "What happens in a medical emergency?",
        answer:
          "The nursery obtains immediate medical treatment and promptly contacts parents and, if needed, the child’s doctor. If a child goes to hospital by ambulance, a staff member accompanies them and parents are told which hospital they have been taken to.",
        sources: [angelRegistration, abbeyRoad],
      },
    ],
  },
  {
    id: "montessori-and-learning",
    heading: "Montessori and learning",
    items: [
      {
        question: "How do Montessori and the EYFS work together?",
        answer:
          "Beckett House follows the Montessori approach alongside the Early Years Foundation Stage. Its approach emphasises hands-on, independent learning, continuous observation and tailoring support to each child’s needs.",
        sources: [about, montessori, abbeyRoad],
      },
      {
        question: "What extra-curricular activities are offered?",
        answer:
          "Activities can include creative dance, music, drama, yoga and indoor sport. The timetable changes from time to time.",
        sources: [activities],
      },
      {
        question: "How can parents observe progress and join nursery events?",
        answer:
          "Parents may observe their child and nursery activities at any time, with prior notice welcomed. One-to-one interviews with the child’s key teacher are held twice a year in spring and autumn, with a family Open Day in summer and a nativity play each Christmas.",
        sources: [angelRegistration, abbeyRoad],
      },
    ],
  },
  {
    id: "getting-in-touch",
    heading: "Getting in touch",
    items: [
      {
        question: "How do I contact each nursery?",
        answer:
          "For Angel, email info@beckett-house.co.uk or call 020 7278 8824. For Abbey Road, email abbeyroad@beckett-house.co.uk or call 020 4568 7042.",
        sources: [angelHome, abbeyRoad],
      },
    ],
  },
];

export const faqItems = faqGroups.flatMap((group) => group.items);
