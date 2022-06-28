import { useRouter } from "next/router";
import {
  AiOutlineBank,
  AiOutlineCreditCard,
  AiOutlineForm,
  AiOutlineRollback,
} from "react-icons/ai";
import { InvoiceShape } from "shapes/invoice";
import InvoiceAddressForm, {
  InvoiceAddressFormProps,
} from "../InvoiceAddressForm";
import { PaymentTypes } from "./InvoicePayActions";
import SingleInvoicePaymentContainer from "./SingleInvoicePaymentContainer";
import SingleInvoicePaymentTransfer from "./SingleInvoicePaymentTransfer";
import SingleInvoicePayOnline from "./SingleInvoicePayOnline";

interface SingleInvoicePaymentProps {
  invoice: InvoiceShape;
  invoiceNr: string;
  activeType: PaymentTypes;
  onPaymentProccessChange: (type: PaymentTypes | "none") => void;
  onPaymentPending: () => void;
  onPaymentReceived: () => void;
  onAddressFormFilled: InvoiceAddressFormProps["onAddressFormFilled"];
}

function SingleInvoicePayment({
  invoice,
  invoiceNr,
  activeType,
  onPaymentProccessChange,
  onPaymentPending,
  onPaymentReceived,
  onAddressFormFilled,
}: SingleInvoicePaymentProps) {
  const { query } = useRouter();
  if (typeof query.uuid !== "string") {
    throw new Error("Expected UUID to be a string");
  }

  const BackAction = (
    <div
      className="whitespace-nowrap underline p-4 py-2 cursor-pointer"
      onClick={() => {
        onPaymentProccessChange("none");
      }}
    >
      zurück <AiOutlineRollback className="inline-block" />
    </div>
  );

  if (
    !invoice.customer.address?.street ||
    !invoice.customer.address?.street_number ||
    !invoice.customer.address?.city ||
    !invoice.customer.address?.postal_code ||
    !invoice.customer.address?.country_code
  ) {
    return (
      <SingleInvoicePaymentContainer
        title={
          <>
            <AiOutlineForm className="inline-block mr-2" /> Bitte geben Sie Ihre
            Addresse an um fortzufahren
          </>
        }
        rightAction={BackAction}
      >
        <div className="border border-black rounded-md p-4">
          <InvoiceAddressForm
            onAddressFormFilled={onAddressFormFilled}
            invoice={invoice}
          />
        </div>
      </SingleInvoicePaymentContainer>
    );
  }

  const InvoiceSuffix = (
    <span className="font-normal text-sm">(#{invoiceNr})</span>
  );

  return (
    <SingleInvoicePaymentContainer
      title={
        activeType === "transfer" ? (
          <>
            <AiOutlineBank className="inline-block mr-2" />
            QR Rechnung / Banküberweisung {InvoiceSuffix}
          </>
        ) : (
          <>
            <AiOutlineCreditCard className="inline-block mr-2" />
            Sofort Online bezahlen {InvoiceSuffix}
          </>
        )
      }
      leftAction={
        <div
          className="whitespace-nowrap underline p-4 py-2 cursor-pointer text-stone-400"
          onClick={() => {
            onPaymentProccessChange(
              activeType === "card" ? "transfer" : "card"
            );
          }}
        >
          {activeType === "card" ? (
            <>
              <AiOutlineBank className="inline-block mr-2" />
              Zu QR Rechnung / Bank transfer wechseln
            </>
          ) : (
            <>
              <AiOutlineCreditCard className="inline-block mr-2" />
              Zur Online-Zahlung wechseln
            </>
          )}
        </div>
      }
      rightAction={BackAction}
    >
      {activeType === "transfer" ? (
        <SingleInvoicePaymentTransfer
          invoiceId={query.uuid}
          invoice={invoice}
          invoiceNr={invoiceNr}
          onPaymentPending={onPaymentPending}
        />
      ) : (
        <div className="border border-black rounded-md p-4">
          <SingleInvoicePayOnline
            uuid={query.uuid}
            onPaymentSuccess={onPaymentReceived}
          />
        </div>
      )}
    </SingleInvoicePaymentContainer>
  );
}

export default SingleInvoicePayment;
