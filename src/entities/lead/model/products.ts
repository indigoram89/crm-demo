export type Product = {id: string; name: string; vendor: string; unit_id: string; price: number};

export const products: Product[] = [
  {id: "rehau70", name: "Rehau 70", vendor: "VDA", unit_id: "pcs", price: 186_000},
  {id: "rehau60", name: "Rehau 60", vendor: "VDA", unit_id: "pcs", price: 154_000},
  {id: "kbe", name: "KBE 76", vendor: "Плесс", unit_id: "pcs", price: 171_000},
  {id: "mosquito", name: "Москитные сетки", vendor: "VDA, Плесс", unit_id: "pcs", price: 14_000},
  {id: "sill", name: "Подоконники", vendor: "VDA, Откосы", unit_id: "m", price: 22_000},
  {id: "slopes", name: "Откосы", vendor: "Откосы", unit_id: "m", price: 9_500},
];

export const findProduct = (id: string) => products.find((product) => product.id === id);
