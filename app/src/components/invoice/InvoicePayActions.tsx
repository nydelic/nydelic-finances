import { useRouter } from "next/router";
import { AiOutlineBank, AiOutlineCreditCard } from "react-icons/ai";
import { InvoiceShape } from "shapes/invoice";

export type PaymentTypes = "card" | "transfer";

interface InvoicePayActionsProps {
  onPaymentProcessStart: (type: PaymentTypes) => void;
  invoiceStatus: InvoiceShape["status"];
}

function InvoicePayActions({
  onPaymentProcessStart,
  invoiceStatus,
}: InvoicePayActionsProps) {
  const { query } = useRouter();

  if (typeof query.uuid !== "string") {
    throw new Error("Expected string uuid");
  }

  return (
    <div
      aria-disabled={
        invoiceStatus !== "payment_pending" && invoiceStatus !== "sent"
      }
      className="text-xs border border-black bg-white rounded-md lg:max-w-min mt-4 lg:mt-8 text-center lg:text-left [&[aria-disabled='true']]:opacity-50 [&[aria-disabled='true']]:pointer-events-none"
    >
      <h3 className="px-4 pt-4 font-bold">BEZAHLEN</h3>

      <div>
        <div
          className="whitespace-nowrap cursor-pointer py-2 px-4 underline first-of-type:pt-4 last-of-type:pb-4"
          onClick={() => {
            onPaymentProcessStart("transfer");
          }}
        >
          <AiOutlineBank className="inline-block mr-2" />
          QR Rechnung / Banküberweisung
        </div>
        <div
          className="whitespace-nowrap cursor-pointer py-2 px-4 underline first-of-type:pt-4 last-of-type:pb-4"
          onClick={() => {
            onPaymentProcessStart("card");
          }}
        >
          <AiOutlineCreditCard className="inline-block mr-2" />
          Sofort Online bezahlen
        </div>
      </div>
    </div>
  );
}

export default InvoicePayActions;
