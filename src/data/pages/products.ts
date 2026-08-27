import type { FaqEntry } from "./types";

// Approved FAQ copy for the life- and dental-insurance product pages (Figma
// 2357:2321), consumed by the bespoke `FaqSection`. The grey-box wireframe
// template data (ProductPageData consts + the productPages record) that used to
// live here was removed when the wireframe template system was retired; only
// this approved copy remains.

export const lifeInsuranceFaqs: FaqEntry[] = [
  {
    question: "What does YuLife's group life insurance cover and how does it benefit employees?",
    answer:
      "YuLife's group life insurance is underwritten by MetLife, meaning MetLife is responsible for paying claims, while YuLife delivers the employee experience, wellbeing tools and engagement layer on top. The policy provides a tax-free lump sum of up to 12x an employee's base salary, subject to scheme rules. Employees also benefit from a 24/7 virtual GP, private prescriptions and an EAP for mental and financial health.",
  },
  {
    question: "How does it support life and legacy planning for families?",
    answer:
      "Group life insurance underwritten by MetLife goes beyond a lump sum payout. It includes a secure 100GB digital vault, online will writing with 24/7 support, and the Everest funeral concierge — plus bereavement and probate counselling, extending to partners, dependants and parents.",
  },
  {
    question: "How do employees add or manage their beneficiaries?",
    answer:
      "Employees nominate and update beneficiaries directly within the YuLife app, with no complex HR paperwork required — keeping legacy benefits directed exactly where intended.",
  },
  {
    question: "How does YuLife protect employee data and privacy?",
    answer:
      "All personal data is handled with the highest level of protection. Employers receive high-level insights through the Yunity portal, but all data is strictly anonymised and aggregated.",
  },
  {
    question: "Is it more cost-effective than individual cover?",
    answer:
      "Yes. Group life insurance underwritten by MetLife is typically significantly cheaper than individual policies. YuLife offers cover for businesses with as few as two employees, often with instant cover and no medical underwriting required.",
  },
  {
    question: "How does YuLife simplify administration while providing business insight?",
    answer:
      "Group life insurance brings together life cover, virtual healthcare and wellbeing rewards into a single platform. The employer portal shows a real-time dashboard of eNPS scores and risk distributions for burnout and absenteeism.",
  },
];

export const dentalInsuranceFaqs: FaqEntry[] = [
  {
    question: "What does Group Dental Insurance cover?",
    answer:
      "Company dental insurance through YuLife enables employees to claim back the cost of dental treatment — check-ups, preventative and restorative work, dental injuries, emergencies and oral cancer treatment — up to the value of their cover level. Employees can select any dentist (NHS or private) in the UK, and pre-existing conditions are covered.",
  },
  {
    question: "Does the plan cover getting braces fitted?",
    answer:
      "This depends on the IOTN severity grading. The plan covers IOTN Grades 4 and 5 for ages 19+, and Grades 3, 4 and 5 for ages 18 and under. The NHS usually covers Grades 1–3 for under-18s.",
  },
  {
    question: "Are composite veneers covered?",
    answer: "Only if medically necessary — anything fitted for cosmetic reasons is excluded from cover.",
  },
  {
    question: "Can employees add their dependants?",
    answer:
      "Yes — employees can cover partners and children, with no limit on the number of children. You only pay for one, and they're covered up until their 24th birthday.",
  },
  {
    question: "How much is Group Dental Insurance?",
    answer:
      "The cost depends on the number of employees covered and the level of cover chosen, making it viable even for small businesses.",
  },
  {
    question: "Is YuLife available without insurance?",
    answer:
      "Yes — the global app-only option provides all the benefits of the YuLife app, without the insurance, so you can still protect your employees' wellbeing.",
  },
];
