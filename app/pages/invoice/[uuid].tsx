import { GetServerSideProps } from "next";
import { gql } from "graphql-request";
import Head from "next/head";
import graphQLClient from "utils/graphQLClient";
import SingleInvoice from "components/invoice/SingleInvoice";
import convertInvoiceDateToNr from "utils/convertInvoiceDateToNr";
import { InvoiceShape } from "shapes/invoice";
import InvoicePayActions, {
  PaymentTypes,
} from "components/invoice/payment/InvoicePayActions";
import SingleInvoiceContainer from "components/invoice/SingleInvoiceContainer";
import SingleInvoiceActions from "components/invoice/SingleInvoiceActions";
import SingleInvoicePaymentStatus from "components/invoice/payment/SingleInvoicePaymentStatus";
import SingleInvoicePayment from "components/invoice/payment/SingleInvoicePayment";
import { useState, useMemo } from "react";
import { AddressData } from "components/invoice/InvoiceAddressForm";

export interface InvoicePageProps {
  invoice: InvoiceShape;
}

const InvoicePage = ({ invoice: invoiceProp }: InvoicePageProps) => {
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentProcess, setPaymentProccess] = useState<PaymentTypes>();
  const [customerAddressData, setCustomerAddressData] = useState<AddressData>();

  const invoice = useMemo(
    () => ({
      ...invoiceProp,
      status: paymentDone ? "payment_pending" : invoiceProp.status,
      customer: {
        ...invoiceProp.customer,
        address: customerAddressData || invoiceProp.customer.address,
      },
    }),
    [invoiceProp, paymentDone, customerAddressData]
  );
  const invoiceNr = convertInvoiceDateToNr({
    invoiceDateString: invoice.create_date,
  });

  return (
    <>
      <Head>
        <title>{`Nydelic Invoices | ${invoice.title} (#${invoiceNr})`}</title>
        <meta name="description" content="View your invoices by nydelic." />
      </Head>
      <SingleInvoiceContainer>
        {paymentProcess ? (
          <SingleInvoicePayment
            activeType={paymentProcess}
            invoice={invoice}
            invoiceNr={invoiceNr}
            onPaymentProccessChange={setPaymentProccess}
            onPaymentDone={() => {
              setPaymentDone(true);
            }}
            onAddressFormFilled={(addressData) => {
              setCustomerAddressData(addressData);
            }}
          />
        ) : (
          <>
            <SingleInvoiceActions>
              <SingleInvoicePaymentStatus invoice={invoice} />
              <InvoicePayActions
                onPaymentProcessStart={setPaymentProccess}
                invoiceStatus={invoice.status}
              />
            </SingleInvoiceActions>
            <SingleInvoice invoice={invoice} invoiceNr={invoiceNr} />
          </>
        )}
      </SingleInvoiceContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  InvoicePageProps,
  {
    uuid: string;
  }
> = async ({ params }) => {
  try {
    if (!params?.uuid) {
      throw new Error("Expected a uuid from params");
    }

    const query = gql`
      query getInvoices($UUID: String) {
        Invoice(filter: { id: { _eq: $UUID } }) {
          title
          create_date
          # id
          status
          # payment_check
          article {
            Article_id {
              name
            }
            count
            price
          }
          date_issued
          date_due
          comment
          customer {
            first_name
            last_name
            gender
            language
            address {
              street
              street_number
              postal_code
              city
              country_code
            }
          }
          vat
        }
      }
    `;
    const invoicesResult = await graphQLClient.request(query, {
      UUID: params.uuid,
    });

    const invoice = invoicesResult.Invoice[0];

    if (!invoice) {
      return { notFound: true };
    }

    return {
      props: { invoice: invoice },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
};

export default InvoicePage;
