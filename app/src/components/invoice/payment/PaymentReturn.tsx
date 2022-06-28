import useAdyenCheckout from "hooks/useAdyenCheckout";
import { useEffect, useRef } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineRollback,
} from "react-icons/ai";
import SingleInvoicePaymentContainer from "./SingleInvoicePaymentContainer";

interface PaymentReturnProps {
  invoiceNr: string;
  onClose: () => void;
  sessionId: any;
  redirectResult: any;
}

function PaymentReturn({
  invoiceNr,
  onClose,
  sessionId,
  redirectResult,
}: PaymentReturnProps) {
  if (typeof sessionId !== "string" || typeof redirectResult !== "string") {
    throw new Error("An unknown error occured");
  }
  const initialRenderRef = useRef(true);

  const InvoiceSuffix = (
    <span className="font-normal text-sm">(#{invoiceNr})</span>
  );

  const { success, error, getCheckoutData } = useAdyenCheckout();

  useEffect(() => {
    // force to only run ONCE
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      getSessionData();
    }

    async function getSessionData() {
      const checkout = await getCheckoutData({ id: sessionId });
      checkout.submitDetails(redirectResult);
    }
  }, [getCheckoutData, redirectResult, sessionId]);

  return (
    <SingleInvoicePaymentContainer
      title={
        <>
          {error && (
            <>
              <AiOutlineCloseCircle className="inline-block mr-2" />
              Etwas ist schief gelaufen
            </>
          )}
          {success && (
            <>
              <AiOutlineCheckCircle className="inline-block mr-2" />
              Vielen Dank
            </>
          )}{" "}
          {InvoiceSuffix}
        </>
      }
      rightAction={
        <div
          role="button"
          className="whitespace-nowrap underline p-4 py-2 cursor-pointer"
          onClick={() => {
            onClose();
          }}
        >
          {error ? "zurück / erneut versuchen" : "abschliessen"}{" "}
          <AiOutlineRollback className="inline-block" />
        </div>
      }
    >
      <div className="border border-black rounded-md p-4">
        {error && (
          <div className="text-center text-rose-700">
            <p>
              <AiOutlineCloseCircle className="text-8xl inline" />
            </p>
            <div className="text-center">{error}</div>
          </div>
        )}
        {success && (
          <div className="text-center text-emerald-700">
            <p>
              <AiOutlineCheckCircle className="text-8xl inline" />
            </p>
            <div className="text-center">{success}</div>
          </div>
        )}
      </div>
    </SingleInvoicePaymentContainer>
  );
}

export default PaymentReturn;
