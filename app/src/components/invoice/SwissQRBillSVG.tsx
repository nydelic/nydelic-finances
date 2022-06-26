import companyConfig from "config/company";
import { useEffect, useState } from "react";
import { InvoiceShape } from "shapes/invoice";
import { SVG } from "swissqrbill/lib/node/esm/node/svg";
import { Languages } from "swissqrbill/lib/node/esm/shared/types";
import getFullPriceFromInvoice from "utils/getFullPriceFromInvoice";

interface SwissQRBillSVGProps {
  invoice: InvoiceShape;
  invoiceNr: string;
}

const validLanguages: Languages[] = ["DE", "EN", "FR", "IT"];

function SwissQRBillSVG({ invoice, invoiceNr }: SwissQRBillSVGProps) {
  const [svgURL, setSvgURL] = useState<string>();

  const uppercaseLang = invoice.customer.language.toUpperCase();
  const language: Languages = validLanguages.includes(
    uppercaseLang as Languages
  )
    ? (uppercaseLang as Languages)
    : "DE";

  const articlesSum = getFullPriceFromInvoice({
    articles: invoice.article,
    vat: invoice.vat,
  });

  useEffect(() => {
    if (
      !invoice.customer.address?.street ||
      !invoice.customer.address?.street_number ||
      !invoice.customer.address?.city ||
      !invoice.customer.address?.postal_code ||
      !invoice.customer.address?.country_code
    ) {
      throw new Error("Expected invoice to have full address at this point");
    }

    const dueDateRaw = Date.parse(invoice.date_due);
    const dateFormatter = new Intl.DateTimeFormat("de-CH");

    const InvoiceSVG = new SVG(
      {
        currency: "CHF",
        amount: articlesSum,
        reference: `${invoiceNr}`,
        additionalInformation: `Zahlbar bis ${dateFormatter.format(
          dueDateRaw
        )}`,
        creditor: {
          name: companyConfig.legalName,
          address: companyConfig.address.street,
          buildingNumber: companyConfig.address.streetNumber,
          zip: companyConfig.address.postalCode,
          city: companyConfig.address.city,
          account: companyConfig.IBAN.raw,
          country: companyConfig.address.countryCode,
        },
        debtor: {
          name: `${invoice.customer.first_name} ${invoice.customer.last_name}`.trim(),
          address: invoice.customer.address?.street,
          buildingNumber: invoice.customer.address?.street_number,
          zip: invoice.customer.address?.postal_code,
          city: invoice.customer.address?.city,
          country: invoice.customer.address?.country_code,
        },
      },
      { language: language }
    );
    const blob = new Blob([InvoiceSVG.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setSvgURL(url);
  }, [
    articlesSum,
    invoice.date_due,
    invoice.customer.address?.country_code,
    invoice.customer.address?.postal_code,
    invoice.customer.address?.city,
    invoice.customer.address?.street,
    invoice.customer.address?.street_number,
    invoice.customer.first_name,
    invoice.customer.last_name,
    invoiceNr,
    language,
  ]);

  if (!svgURL) {
    return null;
  }

  return (
    <div>
      <picture
        onClick={() => {
          const W = window.open(svgURL);
          W?.window.print();
        }}
      >
        <source srcSet={svgURL} type="image/svg+xml" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={svgURL} alt={`Swiss QR Bill for invoice #${invoiceNr}`} />
      </picture>
    </div>
  );
}

export default SwissQRBillSVG;
