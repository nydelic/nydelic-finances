import getVATBySlug, { VatSlug } from "./getVATBySlug";

interface GetFullPriceFromInvoice {
  articles: {
    price: number;
    count?: number;
  }[];
  vat?: VatSlug;
}

// POLISH: safe price number calculations (Dinero.js?)

function getFullPriceFromInvoice({ articles, vat }: GetFullPriceFromInvoice) {
  let articlesSum = articles?.reduce(
    (sum, articleB) => sum + (articleB?.price || 0) * (articleB.count || 1),
    0
  );
  if (vat && articles.length && articlesSum) {
    const VAT = getVATBySlug(vat);
    articlesSum += VAT.percentage * articlesSum;
  }

  return articlesSum;
}

export default getFullPriceFromInvoice;
