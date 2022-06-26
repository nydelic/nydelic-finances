import { ReactNode } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineEdit,
  AiOutlineHourglass,
} from "react-icons/ai";
import { InvoiceShape } from "shapes/invoice";

interface SingleInvoicePaymentStatusItemProps {
  children: ReactNode;
  active?: boolean;
}

function SingleInvoicePaymentStatus({
  invoice,
}: SingleInvoicePaymentStatusProps) {
  return (
    <ul className="flex lg:flex-col items-start">
      <SingleInvoicePaymentStatusItem active={invoice.status === "draft"}>
        <AiOutlineEdit className="inline-block mr-2" />
        Entwurf
      </SingleInvoicePaymentStatusItem>
      <SingleInvoicePaymentStatusItem active={invoice.status === "sent"}>
        <AiOutlineClockCircle className="inline-block mr-2" />
        Offen
      </SingleInvoicePaymentStatusItem>
      <SingleInvoicePaymentStatusItem
        active={invoice.status === "payment_pending"}
      >
        <AiOutlineHourglass className="inline-block mr-2" />
        Zahlung wird geprüft
      </SingleInvoicePaymentStatusItem>
      <SingleInvoicePaymentStatusItem
        active={invoice.status === "payment_received"}
      >
        <AiOutlineCheckCircle className="inline-block mr-2" />
        Bezahlt
      </SingleInvoicePaymentStatusItem>
    </ul>
  );
}

function SingleInvoicePaymentStatusItem({
  children,
  active,
}: SingleInvoicePaymentStatusItemProps) {
  return (
    <>
      <li
        aria-current={active && "step"}
        className={`border border-stone-900 whitespace-nowrap py-1 px-2 rounded-md text-xs inline-block ${
          active ? "bg-stone-900 text-white" : "bg-white text-black"
        }`}
      >
        {children}
      </li>
      <li
        role="separator"
        className="last-of-type:hidden p-1 px-2 self-center lg:self-auto"
      >
        <div className="h-[1px] w-2 lg:w-[1px] lg:h-2 bg-stone-500 dark:bg-stone-400" />
      </li>
    </>
  );
}

interface SingleInvoicePaymentStatusProps {
  invoice: InvoiceShape;
}

export default SingleInvoicePaymentStatus;
