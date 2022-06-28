import {
  AiFillLock,
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCreditCard,
} from "react-icons/ai";
import useAdyenCheckout from "hooks/useAdyenCheckout";

interface SingleInvoicePayOnlineProps {
  uuid: string;
}

// POLISH keep checkout session loaded when users navigates somewhere else

function SingleInvoicePayOnline({ uuid }: SingleInvoicePayOnlineProps) {
  const {
    error,
    success,
    sessionStarted,
    adyenContainerRef,
    adyenCheckoutRef,
    createSession,
    mountUi,
  } = useAdyenCheckout();

  return (
    <div>
      <div className="flex items-center text-xs text-rose-700 mb-4">
        <AiOutlineBell className="flex-shrink-0 mr-4" />
        <div className="flex-shrink">
          Diese Rechnung wurde von Ihnen bereits als bezahlt markiert. Fahren
          Sie nur fort, wenn Sie sich sicher sind das Sie die Rechnung noch
          nicht bezahlt haben.
        </div>
      </div>

      <div ref={adyenContainerRef} className="mb-4" />

      {(!sessionStarted || error) && (
        <div className="flex">
          <button
            className="text-sm whitespace-nowrap py-2 px-3 rounded-md border border-black mr-4"
            onClick={async () => {
              const session = await createSession(uuid);
              await mountUi(session);
            }}
          >
            <AiOutlineCreditCard className="inline-block mr-2" />
            {error ? "Zahlungsprozess neu starten" : "Zahlungsprozess starten"}
          </button>
          <span className="text-xs text-stone-400 self-center">
            Sie können im nächsten Schritt ihre Zahlungsmethode auswählen
          </span>
        </div>
      )}
      {sessionStarted && success && (
        <div className="flex items-center text-xs text-emerald-700 mt-4">
          <AiOutlineCheckCircle className="flex-shrink-0 mr-4" />
          <div className="flex-shrink">{success}</div>
        </div>
      )}
      {sessionStarted && error && (
        <div className="flex items-center text-xs text-rose-700 mt-4">
          <AiOutlineCloseCircle className="flex-shrink-0 mr-4" />
          <div className="flex-shrink">{error}</div>
        </div>
      )}
      {sessionStarted && !error && !success && (
        <button
          type="submit"
          className="text-sm whitespace-nowrap py-2 px-3 rounded-md border border-black bg-black text-white text-center block w-full"
          onClick={async (e) => {
            e.preventDefault();
            adyenCheckoutRef.current?.submit();
          }}
        >
          <AiFillLock className="inline-block mr-2" />
          Bezahlen
        </button>
      )}
    </div>
  );
}

export default SingleInvoicePayOnline;
