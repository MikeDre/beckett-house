// Supplied nursery prices. Keep published plans separate from Angel session rates.
export const abbeyRoadFees = [
  { age: "3–23 months", standard: [1584, 1920, 2400], funded30: [541.66, 987.10, 1467.10], funded15: null, extras: [7, 3, 7] },
  { age: "2–3 years", standard: [1452, 1760, 2200], funded30: [633.48, 1041.80, 1481.80], funded15: null, extras: [8, 4, 18] },
  { age: "3 years+", standard: [1320, 1600, 2000], funded30: [696.80, 1068, 1468], funded15: [1008.40, 1334, 1734], extras: [9, 3, 28] },
];
export const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
export const extraDescriptions = [
  { title: "Food", description: "Meals, snacks and drinks consumed at nursery." },
  { title: "Non-food consumables", description: "Nappies, wipes, nappy cream, sun cream and emergency medication." },
  { title: "Extra-curricular activities", description: "Optional extra-curricular activities taking place at nursery." },
];
