import { gql } from "graphql-request";
import { CustomerShape } from "shapes/customer";
import { InvoiceArticleShape } from "shapes/invoiceArticle";
import convertInvoiceDateToNr from "./convertInvoiceDateToNr";
import getFullPriceFromInvoice from "./getFullPriceFromInvoice";
import { VatSlug } from "./getVATBySlug";
import graphQLClient from "./graphQLClient";

interface FetchInvoicePaymentDetailsArgs {
  uuid: string;
}

async function fetchInvoicePaymentDetails({
  uuid,
}: FetchInvoicePaymentDetailsArgs) {
  const query = gql`
    query getInvoices($UUID: String) {
      Invoice(filter: { id: { _eq: $UUID } }) {
        article {
          Article_id {
            name
          }
          count
          price
        }
        customer {
          first_name
          last_name
          gender
          language
          id
          email
          address {
            street
            street_number
            postal_code
            city
            country_code
          }
        }
        create_date
        vat
      }
    }
  `;
  const invoicesResult: {
    Invoice: {
      create_date: string;
      article: InvoiceArticleShape[];
      customer: CustomerShape;
      vat?: VatSlug;
    }[];
  } = await graphQLClient.request(query, {
    UUID: uuid,
  });
  const invoice = invoicesResult.Invoice[0];
  if (!invoice) {
    throw new Error("No matching invoice founmd");
  }

  const articlesSum = getFullPriceFromInvoice({
    articles: invoice.article,
    vat: invoice.vat,
  });

  // POLISH: free/negative invoices support?
  if (articlesSum <= 0) {
    throw new Error("Expected the invoice to cost money");
  }

  const invoiceNr = convertInvoiceDateToNr({
    invoiceDateString: invoice.create_date,
  });

  return { invoice, articlesSum, invoiceNr };
}

export default fetchInvoicePaymentDetails;
