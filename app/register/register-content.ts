import type { NurserySlug } from "../nursery-choice";

export type RegistrationTerm = {
  title: string;
  paragraphs: string[];
};

export type RegistrationNursery = {
  name: string;
  email: string;
  morning: string;
  afternoon: string;
  terms: RegistrationTerm[];
};

export const registrationContent: Record<NurserySlug, RegistrationNursery> = {
  angel: {
    name: "Angel",
    email: "info@beckett-house.co.uk",
    morning: "8am to 2pm",
    afternoon: "2pm to 6pm",
    terms: [
      {
        title: "Admission Policy",
        paragraphs: [
          "Beckett House Limited (the school) accepts children between the ages of two and five.",
        ],
      },
      {
        title: "Registration",
        paragraphs: [
          "A registration fee of £75 is required when applying for a place. If you wish your child to be placed on our waiting list please complete the attached registration form and return it with this fee.",
          "This is not refundable and does not guarantee a place. The registration fee is not applicable to funded places.",
        ],
      },
      {
        title: "Deposits, Refunds and Notice of leaving",
        paragraphs: [
          "A deposit of a multiple of 4 weeks’ fees will be due on the date a place is offered and its payment will secure a child’s place. Until the deposit is paid the place will be offered to others. (If your child increases their time we may request an increase of this deposit). Provided we have received a whole term’s written notice of your child leaving this deposit will be refunded, plus or minus any adjustments, by the end of the month after the end of term. A deposit cannot be refunded if a child does not start at Beckett House.",
        ],
      },
      {
        title: "Fees",
        paragraphs: [
          "Fees are due in full at the beginning of each term. However, we offer the option to pay by instalments during the term at dates and intervals determined by Beckett House. Refunds cannot be made if a child starts the term late, finishes early, reduces their hours or does not attend school for any other reason including illness. If an instalment is missed the remainder of the fees for the whole term will be due. The school reserves the right to retain deposits and where relevant any Working Parents Entitlements in lieu of unpaid fees. (Any expense incurred by the school in the recovery of unpaid fees will be paid by the parent) No child will be allowed to remain at school if fees are unpaid.",
          "The rate for which you contract will be that pertaining at the date of your child’s enrolment (The date you pay the deposit). Apart from exceptional circumstances, this rate will not increase during your child’s time at school.",
        ],
      },
      {
        title: "Holidays and school closures",
        paragraphs: [
          "The school closes for two weeks at Christmas, plus the bank holidays; and two weeks in the summer. Parents will be advised of the dates as early as possible. No deductions can be given for holidays taken outside the school holiday dates. The school will also close for a) the few bank holidays that remain, some of which may occur during the holidays and will be taken in lieu and b) three inset training days per year which are a stipulation of the Council and are required in order for parents of children over the age of 3 to receive the Working Parents Entitlements. None of these are refundable.",
        ],
      },
      {
        title: "Term dates and opening hours",
        paragraphs: [
          "Beckett House is open from 8.00am - 6.00pm. Full day care is from 8.00am - 6.00pm, Mornings are from 8.00am - 2pm and afternoons are from 2pm – 6.00pm. It is important that these times are adhered to so as not to interrupt the routine of the children.",
          "Beckett House reserves the right to alter timetables without notice.",
        ],
      },
      {
        title: "Collection",
        paragraphs: [
          "No child will be allowed to leave the school with anyone who is not known to a member of the staff. The school must be given specific instructions for any changes. There can be no exception to this rule in the interest of the safety of your children",
        ],
      },
      {
        title: "Collection Times",
        paragraphs: [
          "Must be adhered to. Parents are expected to telephone and advise the school if they will be late. In the case of late collection, other than by arrangement, the school reserves the right to charge £5.00 per minute for persistent late collections.",
        ],
      },
      {
        title: "Settling-in period",
        paragraphs: [
          "Prior to your child’s start date they can attend free of charge for short periods. (Usually a day or two during the final weeks of the previous term). This eases their settling into the school routine. A parent or guardian must attend with the child (It may be possible to leave the child as part of this process for short periods and with the agreement of the staff).",
        ],
      },
      {
        title: "Attendance",
        paragraphs: [
          "Parents are requested to notify the school by 9 am if their child is unable to attend.",
        ],
      },
      {
        title: "Illness",
        paragraphs: [
          "If a child becomes ill during the day, the parents will be notified promptly and the child will be cared for until a parent or designated person comes to pick up the child. Parents are requested to inform the school if their child has been in contact with any infectious diseases.",
        ],
      },
      {
        title: "Emergency Medical Treatment",
        paragraphs: [
          "In the event of an accident or illness requiring immediate medical treatment, the school is responsible for obtaining such treatment for the child. Parents and, if necessary, the child’s own doctor are promptly notified. The school has its own doctor: Dr Mills, Ritchie Street Practice, London, N1 0DG. In the event an ambulance is called and the child taken to hospital they will be accompanied by a member of staff and parents will be informed to which hospital their child has been taken.",
        ],
      },
      {
        title: "Medication",
        paragraphs: [
          "It is not permitted for the school staff to administer medicine to children without consent and instruction. If regular medication is vital to the child’s well being, arrangements will be made to seek special permission. Instructions to the staff must be made in writing quoting specific dosage and times. No verbal instructions can be accepted.",
        ],
      },
      {
        title: "Allergies and General Health",
        paragraphs: [
          "Before your child is due to start, a health questionnaire will be sent to you regarding their well-being and any allergies they may have. This must be completed and handed in on or before the day your child starts.",
          "The school must be alerted to any new allergies should they develop.",
        ],
      },
      {
        title: "Clothing",
        paragraphs: [
          "The children should wear comfortable, washable clothes that are easy for the children to manage. All clothing must be named. Parents are requested to supply their child with a fabric shoe bag, slippers, toothbrush and a set of spare clothes including nappies where relevant. The school cannot be held responsible for loss of, or damage to, property or clothing. Children should not bring money or expensive toys to the nursery, though favourite toys will never be discouraged.",
        ],
      },
      {
        title: "Meals",
        paragraphs: [
          "Home-cooked meals for lunch are provided by the school. Snacks consist of fresh fruit, dried fruit, low-sugar biscuits, milk and water. Parents must inform the school if their child has any special dietary requirements or allergies. Sweets or crisps will not be offered and parents are asked not to allow their children to bring them to school",
        ],
      },
      {
        title: "Notice board",
        paragraphs: [
          "We would draw your attention to the notice board in the school entrance. Should you have a notice which you would like to display, please feel free to bring it to the school",
        ],
      },
      {
        title: "Observations, Parents’ Meetings & Events",
        paragraphs: [
          "Parents are welcome to observe their children and any of the school’s activities at any time. We would, however, welcome prior notice of this. Parents’ interviews which are one-to-one with your child’s key teacher are held twice a year in the Spring and Autumn terms. An Open Day is held in the summer for all the family and friends. There is a nativity play every Christmas.",
        ],
      },
      {
        title: "Education",
        paragraphs: [
          "The school adopts the Montessori approach to education that shares the underlying principles of the Early Years’ Foundation Stage (EYFS) whilst promoting children’s welfare needs.",
        ],
      },
    ],
  },
  "abbey-road": {
    name: "Abbey Road",
    email: "abbeyroad@beckett-house.co.uk",
    morning: "8am to 1pm",
    afternoon: "1pm to 6pm",
    terms: [
      {
        title: "Admission Policy",
        paragraphs: [
          "Beckett House Limited (the school) accepts children between the ages of 3 months and 5.",
        ],
      },
      {
        title: "Registration",
        paragraphs: [
          "A registration fee of £75 is required when applying for a place. If you wish your child to be placed on our waiting list please complete the attached registration form and return it with this fee.",
          "This is not refundable and does not guarantee a place. The registration fee is not applicable to funded places.",
        ],
      },
      {
        title: "Deposits, Refunds and Notice of leaving",
        paragraphs: [
          "A deposit of a multiple of 4 weeks’ fees will be due on the date a place is offered and its payment will secure a child’s place. Until the deposit is paid the place will be offered to others. (If your child increases their time we may request an increase of this deposit). Provided we have received a whole term’s written notice of your child leaving this deposit will be refunded, plus or minus any adjustments, by the end of the month after the end of term. A deposit cannot be refunded if a child does not start at Beckett House.",
        ],
      },
      {
        title: "Fees",
        paragraphs: [
          "Fees are due in full at the beginning of each term. However, we offer the option to pay by instalments during the term at dates and intervals determined by Beckett House. Refunds cannot be made if a child starts the term late, finishes early, reduces their hours or does not attend school for any other reason including illness. If an instalment is missed the remainder of the fees for the whole term will be due. The school reserves the right to retain deposits and where relevant any Working Parents Entitlements in lieu of unpaid fees. (Any expense incurred by the school in the recovery of unpaid fees will be paid by the parent) No child will be allowed to remain at school if fees are unpaid.",
          "The rate for which you contract will be that pertaining at the date of your child’s enrolment (The date you pay the deposit). Apart from exceptional circumstances, this rate will not increase during your child’s time at school.",
        ],
      },
      {
        title: "Holidays and school closures",
        paragraphs: [
          "The school closes for two weeks at Christmas, plus the bank holidays. Parents will be advised of the dates as early as possible. No deductions can be given for holidays taken outside the school holiday dates. The school will also close for a) the few bank holidays that remain, some of which may occur during the holidays and will be taken in lieu and b) three inset training days per year which are a stipulation of the Council and are required in order for parents of children over the age of 3 to receive the Working Parents Entitlements. None of these are refundable.",
        ],
      },
      {
        title: "Term dates and opening hours",
        paragraphs: [
          "Beckett House is open from 8.00am - 6.00pm. Full day care is from 8.00am - 6.00pm, Mornings are from 8.00am - 1pm and afternoons are from 1pm – 6.00pm. It is important that these times are adhered to so as not to interrupt the routine of the children.",
          "Beckett House reserves the right to alter timetables without notice.",
        ],
      },
      {
        title: "Collection",
        paragraphs: [
          "No child will be allowed to leave the school with anyone who is not known to a member of the staff. The school must be given specific instructions for any changes. There can be no exception to this rule in the interest of the safety of your children",
        ],
      },
      {
        title: "Collection Times",
        paragraphs: [
          "Must be adhered to. Parents are expected to telephone and advise the school if they will be late. In the case of late collection, other than by arrangement, the school reserves the right to charge £5.00 per minute for persistent late collections.",
        ],
      },
      {
        title: "Settling-in period",
        paragraphs: [
          "Prior to your child’s start date they can attend free of charge for short periods. (Usually a day or two during the final weeks of the previous term). This eases their settling into the school routine. A parent or guardian must attend with the child (It may be possible to leave the child as part of this process for short periods and with the agreement of the staff).",
        ],
      },
      {
        title: "Attendance",
        paragraphs: [
          "Parents are requested to notify the school by 9 am if their child is unable to attend.",
        ],
      },
      {
        title: "Illness",
        paragraphs: [
          "If a child becomes ill during the day, the parents will be notified promptly and the child will be cared for until a parent or designated person comes to pick up the child. Parents are requested to inform the school if their child has been in contact with any infectious diseases.",
        ],
      },
      {
        title: "Emergency Medical Treatment",
        paragraphs: [
          "In the event of an accident or illness requiring immediate medical treatment, the school is responsible for obtaining such treatment for the child. Parents and, if necessary, the child’s own doctor are promptly notified. The school has its own doctor: Dr Mills, Ritchie Street Practice, London, N1 0DG. In the event an ambulance is called and the child taken to hospital they will be accompanied by a member of staff and parents will be informed to which hospital their child has been taken.",
        ],
      },
      {
        title: "Medication",
        paragraphs: [
          "It is not permitted for the school staff to administer medicine to children without consent and instruction. If regular medication is vital to the child’s well being, arrangements will be made to seek special permission. Instructions to the staff must be made in writing quoting specific dosage and times. No verbal instructions can be accepted.",
        ],
      },
      {
        title: "Allergies and General Health",
        paragraphs: [
          "Before your child is due to start, a health questionnaire will be sent to you regarding their well-being and any allergies they may have. This must be completed and handed in on or before the day your child starts.",
          "The school must be alerted to any new allergies should they develop.",
        ],
      },
      {
        title: "Clothing",
        paragraphs: [
          "The children should wear comfortable, washable clothes that are easy for the children to manage. All clothing must be named. Parents are requested to supply their child with a fabric shoe bag, slippers, toothbrush and a set of spare clothes including nappies where relevant. The school cannot be held responsible for loss of, or damage to, property or clothing. Children should not bring money or expensive toys to the nursery, though favourite toys will never be discouraged.",
        ],
      },
      {
        title: "Meals",
        paragraphs: [
          "Home-cooked meals for lunch are provided by the school. Snacks consist of fresh fruit, dried fruit, low-sugar biscuits, milk and water. Parents must inform the school if their child has any special dietary requirements or allergies. Sweets or crisps will not be offered and parents are asked not to allow their children to bring them to school",
        ],
      },
      {
        title: "Notice board",
        paragraphs: [
          "We would draw your attention to the notice board in the school entrance. Should you have a notice which you would like to display, please feel free to bring it to the school",
        ],
      },
      {
        title: "Observations, Parents’ Meetings & Events",
        paragraphs: [
          "Parents are welcome to observe their children and any of the school’s activities at any time. We would, however, welcome prior notice of this. Parents’ interviews which are one-to-one with your child’s key teacher are held twice a year in the Spring and Autumn terms. An Open Day is held in the summer for all the family and friends. There is a nativity play every Christmas.",
        ],
      },
      {
        title: "Education",
        paragraphs: [
          "The school adopts the Montessori approach to education that shares the underlying principles of the Early Years’ Foundation Stage (EYFS) whilst promoting children’s welfare needs.",
        ],
      },
    ],
  },
};
