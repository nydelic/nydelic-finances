import AdyenCheckout from "@adyen/adyen-web";
import { useCallback, useRef, useState } from "react";
import throwIfUndefind from "utils/throwIfUndefind";
import "@adyen/adyen-web/dist/adyen.css";
import { PaymentMethods } from "@adyen/adyen-web/dist/types/types";

const NEXT_PUBLIC_ADYEN_CHECKOUT_ENV = throwIfUndefind(
  process.env.NEXT_PUBLIC_ADYEN_CHECKOUT_ENV
);
const NEXT_PUBLIC_ADYEN_CHECKOUT_CLIENT_KEY = throwIfUndefind(
  process.env.NEXT_PUBLIC_ADYEN_CHECKOUT_CLIENT_KEY
);

function useAdyenCheckout() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const adyenContainerRef = useRef<HTMLDivElement>(null);
  const adyenCheckoutRef = useRef<InstanceType<
    PaymentMethods["dropin"]
  > | null>(null);

  const createSession = useCallback(async (uuid: string) => {
    // TODO: error handling
    const response = await fetch("/api/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ uuid: uuid }),
    });
    const json = await response.json();

    const session = json.data.session;

    setSessionStarted(true);

    return session;
  }, []);

  const mountUi = useCallback(
    async (session: { id: string; sessionData: string }) => {
      if (!adyenContainerRef.current) {
        throw new Error(
          "Make sure the adyenContainerRef attached to a div element"
        );
      }
      // Create an instance of AdyenCheckout using the configuration object.
      const checkout = await AdyenCheckout({
        environment: NEXT_PUBLIC_ADYEN_CHECKOUT_ENV,
        clientKey: NEXT_PUBLIC_ADYEN_CHECKOUT_CLIENT_KEY,
        analytics: {
          enabled: true, // Set to false to not send analytics data to Adyen.
        },
        session: session,
        onPaymentCompleted: (result: unknown, component: unknown) => {
          // FIXME payment complete handling
          console.info(result, component);

          setSuccess("Vielen Dank, Ihre Zahlung ist bei uns Eingetroffen!");
        },
        onError: (error: unknown, component: unknown) => {
          console.error(error, component);
          // FIXME error handling
          setError(
            "Ein unbekannter Fehler ist aufgetrete, bitte versuchen Sie es später erneut."
          );
        },
        // Any payment method specific configuration. Find the configuration specific to each payment method:  https://docs.adyen.com/payment-methods
        // For example, this is 3D Secure configuration for cards:
        // TODO: implement different payment methods
        paymentMethodsConfiguration: {
          card: {
            hasHolderName: true,
            holderNameRequired: true,
            billingAddressRequired: true,
          },
        },
        showPayButton: false,
      });
      // Access the available payment methods for the session.
      console.log(checkout.paymentMethodsResponse); // => { paymentMethods: [...], storedPaymentMethods: [...] }

      // Create an instance of the Component and mount it to the container you created.
      adyenCheckoutRef.current = checkout
        .create("dropin")
        .mount(adyenContainerRef.current);
    },
    []
  );

  return {
    error,
    success,
    adyenContainerRef,
    adyenCheckoutRef,
    sessionStarted,
    createSession,
    mountUi,
  };
}

export default useAdyenCheckout;
