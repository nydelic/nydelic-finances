// POLISH: generate types from graphql specs

import { CustomerShape } from "./customer";
import { InvoiceArticleShape } from "./invoiceArticle";

export interface InvoiceShape {
  title: string;
  // id: string;
  status: "sent" | "draft" | "payment_pending" | "payment_received";
  // payment_check: boolean;
  create_date: string;
  date_issued: string;
  date_due: string;
  customer: CustomerShape;
  article: InvoiceArticleShape[];
  comment?: string;
  vat?: VatSlug;
}
