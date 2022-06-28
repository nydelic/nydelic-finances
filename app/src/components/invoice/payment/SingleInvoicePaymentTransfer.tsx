import AsyncButton from "components/AsyncButton";
import { useState } from "react";
import { AiOutlineBell } from "react-icons/ai";
import { InvoiceShape } from "shapes/invoice";
import SwissQRBillSVG from "../SwissQRBillSVG";

interface SingleInvoicePaymentTransferProps {
  invoiceId: string;
  invoice: InvoiceShape;
  invoiceNr: string;
  onPaymentDone: () => void;
}

function SingleInvoicePaymentTransfer({
  invoiceId,
  invoice,
  invoiceNr,
  onPaymentDone,
}: SingleInvoicePaymentTransferProps) {
  const [statusCheckReceived, setStatusCheckReceived] = useState<
    boolean | "already-notified"
  >(invoice.status === "payment_pending" ? "already-notified" : false);

  return (
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
          Für eine schnellere Verarbeitung Ihrer Zahlung klicken Sie bitte auf
          folgende Schaltfläche nach erfolgreicher Erfassung des
          Zahlungsauftrages:
        </p>
        {statusCheckReceived && (
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
        {!statusCheckReceived && (
          <AsyncButton
            onClick={async () => {
              // await new Promise<void>((res) => {
              //   setTimeout(() => {
              //     res();
              //   }, 1000);
              // });
              // POLISH export/import error+success types for endpoint
              const res = await fetch("/api/request-invoice-status-update", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  uuid: invoiceId,
                  checkFor: "CHECK_FOR_DID_PAY",
                }),
              });
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
        )}
      </div>
    </>
  );
}

export default SingleInvoicePaymentTransfer;
