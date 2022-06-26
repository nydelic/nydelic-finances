import getVATBySlug from "utils/getVATBySlug";
import getFullPriceFromInvoice from "utils/getFullPriceFromInvoice";

import styles from "./SingleInvoice.module.scss";
import companyConfig from "config/company";
import { InvoiceShape } from "shapes/invoice";

interface SingleInvoiceProps {
  invoiceNr: string;
  invoice: InvoiceShape;
}

function SingleInvoice({ invoiceNr, invoice }: SingleInvoiceProps) {
  const invoiceArticles: {
    name: string;
    price: number;
    count?: number;
  }[] = invoice.article.map((article) => ({
    name: article.Article_id.name,
    price: article.price,
    count: article.count,
  }));

  const articlesSum = getFullPriceFromInvoice({
    articles: invoiceArticles,
    vat: invoice.vat,
  });

  if (invoice.vat && invoiceArticles.length && articlesSum) {
    const VAT = getVATBySlug(invoice.vat);
    invoiceArticles.push({
      name: VAT.label,
      price: VAT.percentage * articlesSum,
    });
  }

  const currencyFormatter = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  });

  let greeting = "";
  switch (invoice.customer.gender) {
    case "male":
      greeting = "Herr";
      break;
    case "female":
      greeting = "Frau";
      break;
  }

  const issuedDateRaw = Date.parse(invoice.date_issued);
  const dueDateRaw = Date.parse(invoice.date_due);
  const dateFormatter = new Intl.DateTimeFormat("de-CH");

  return (
    <div className="font-mono text-sm text-black bg-white screen:border screen:border-black dark:text-white dark:bg-stone-900 screen:p-6 relative rounded-md">
      <div className={styles["invoice-recipient"]}>
        {greeting} {invoice.customer.first_name} {invoice.customer.last_name}
        {invoice.customer.address && (
          <>
            <br />
            {invoice.customer.address.street}{" "}
            {invoice.customer.address.street_number} <br />
            {invoice.customer.address.postal_code}{" "}
            {invoice.customer.address.city}
          </>
        )}
      </div>
      <div className={styles["invoice-payment-recipient"]}>
        <div>Zahlungsinformationen</div>
        <div
          className={`${styles["invoice-info-item"]} ${styles["invoice-info-item-small"]}`}
        >
          <span>Adresse: </span>
          <span>
            {companyConfig.legalName} <br />
            {companyConfig.address.street} {companyConfig.address.streetNumber}{" "}
            <br />
            {companyConfig.address.postalCode} {companyConfig.address.city}
          </span>
        </div>
        <div
          className={`${styles["invoice-info-item"]} ${styles["invoice-info-item-small"]}`}
        >
          <span>IBAN: </span>
          <span>{companyConfig.IBAN.formatted}</span>
        </div>
        <div
          className={`${styles["invoice-info-item"]} ${styles["invoice-info-item-small"]}`}
        >
          <span>Zahlungszweck: </span>
          <span>Rechnung #{invoiceNr}</span>
        </div>
      </div>
      <div className={styles["invoice-general-info"]}>
        Datum: {dateFormatter.format(issuedDateRaw)} <br />
        <br />
        <div className={styles["invoice-info-item"]}>
          <span>Rechnung: </span>
          <span>
            <strong>
              {invoice.title} (Nr. #{invoiceNr})
            </strong>
          </span>
        </div>
        <div className={styles["invoice-info-item"]}>
          <span>Betrag: </span>
          <span>{currencyFormatter.format(articlesSum || 0)}</span>
        </div>
        <div className={styles["invoice-info-item"]}>
          <span>Zahlbar bis: </span>
          {invoice.status !== "draft" ? (
            <span>{dateFormatter.format(dueDateRaw)}</span>
          ) : (
            <span>
              <i>Diese Rechnung ist ein Entwurf</i>
            </span>
          )}
        </div>
      </div>

      {!!invoiceArticles?.length && (
        <>
          <div>Übersicht</div>
          <br />
          <div className={styles["invoice-products"]}>
            <div>
              <div>
                <strong>Leistungen</strong>
              </div>
              <div>
                <strong>Kosten</strong>
              </div>
              <div></div>
            </div>

            {invoiceArticles.map((article, i) => (
              <div key={i}>
                <div>{article.name}</div>
                <div>{article.count || 1}x</div>
                <div>{currencyFormatter.format(article.price || 0)}</div>
              </div>
            ))}

            <div>
              <div>Total</div>
              <div></div>
              <div>{currencyFormatter.format(articlesSum || 0)}</div>
            </div>
          </div>
        </>
      )}

      {invoice.comment && (
        <div className={styles["invoice-comment"]}>{invoice.comment}</div>
      )}
    </div>
  );
}

export default SingleInvoice;
