import AsyncButton from "components/AsyncButton";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  AiOutlineBank,
  AiOutlineBell,
  AiOutlineCreditCard,
  AiOutlineForm,
  AiOutlineRollback,
} from "react-icons/ai";
import { InvoiceShape } from "shapes/invoice";
import InvoiceAddressForm, {
  InvoiceAddressFormProps,
} from "./InvoiceAddressForm";
import { PaymentTypes } from "./InvoicePayActions";
import PayInvoice from "./PayInvoice";
import SingleInvoicePaymentContainer from "./SingleInvoicePaymentContainer";
import SwissQRBillSVG from "./SwissQRBillSVG";

interface SingleInvoicePaymentProps {
  invoice: InvoiceShape;
  invoiceNr: string;
  activeType: PaymentTypes;
  onPaymentProccessChange: (type?: PaymentTypes) => void;
  onPaymentDone: () => void;
  onAddressFormFilled: InvoiceAddressFormProps["onAddressFormFilled"];
}

function SingleInvoicePayment({
  invoice,
  invoiceNr,
  activeType,
  onPaymentProccessChange,
  onPaymentDone,
  onAddressFormFilled,
}: SingleInvoicePaymentProps) {
  const { query } = useRouter();
  if (typeof query.uuid !== "string") {
    throw new Error("Expected UUID to be a string");
  }

  const [statusCheckReceived, setStatusCheckReceived] = useState<
    boolean | "already-notified"
  >(invoice.status === "payment_pending" ? "already-notified" : false);

  const BackAction = (
    <div
      className="whitespace-nowrap underline p-4 py-2 cursor-pointer"
      onClick={() => {
        onPaymentProccessChange();
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
        <>
          <div className="border border-black rounded-md p-4 mb-4 overflow-auto">
            <SwissQRBillSVG invoice={invoice} invoiceNr={invoiceNr} />
          </div>
          <div className="px-4 print:hidden">
            <button
              className="text-xs py-1 px-2 ml-auto block rounded-md border border-black mb-4"
              onClick={() => {
                window.print();
              }}
            >
              Ausrucken
            </button>
            <p className="mb-4 text-xs text-stone-400">
              Für eine schnellere Verarbeitung Ihrer Zahlung klicken Sie bitte
              auf folgende Schaltfläche nach erfolgreicher Erfassung des
              Zahlungsauftrages:
            </p>
            {!statusCheckReceived ? (
              <AsyncButton
                onClick={async () => {
                  // await new Promise<void>((res) => {
                  //   setTimeout(() => {
                  //     res();
                  //   }, 1000);
                  // });
                  // POLISH export/import error+success types for endpoint
                  const res = await fetch(
                    "/api/request-invoice-status-update",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                      },
                      body: JSON.stringify({
                        uuid: query.uuid,
                        checkFor: "CHECK_FOR_DID_PAY",
                      }),
                    }
                  );
                  const json = await res.json();
                  if (json.status === 200) {
                    setStatusCheckReceived(true);
                    onPaymentDone();
                  } else if (json?.data?.code === "EALREADY_NOTIFIED") {
                    setStatusCheckReceived("already-notified");
                  } else {
                    alert("Something went wrong, please try again later");
                  }
                }}
              >
                Zahlungsauftrag erfasst
              </AsyncButton>
            ) : (
              <div className="flex items-center">
                <AiOutlineBell className="flex-shrink-0 mr-4" />
                <div className="flex-shrink">
                  {statusCheckReceived === "already-notified" ? (
                    <>Viele Dank, wir wurden bereits von Ihnen informiert</>
                  ) : (
                    <>
                      Vielen Dank, wir haben eine Benachrichtigung erhalten und
                      werden den Status so bald wie möglich prüfen
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="border border-black rounded-md p-4">
            <PayInvoice uuid={query.uuid} />
          </div>
        </>
      )}
    </SingleInvoicePaymentContainer>
  );
}

export default SingleInvoicePayment;
