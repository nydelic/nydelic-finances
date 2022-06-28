import { NextApiRequest, NextApiResponse } from "next";
import { Client, CheckoutAPI } from "@adyen/api-library";
import fetchInvoicePaymentDetails from "utils/fetchInvoicePaymentDetails";
import throwIfUndefind from "utils/throwIfUndefind";
import {
  HttpRequestError,
  httpResponse,
  httpErrorResponse,
} from "@nydelic/toolbox";

const ADYEN_CLIENT_API_KEY = throwIfUndefind(process.env.ADYEN_CLIENT_API_KEY);
const ADYEN_MERCHANT_ACCOUNT = throwIfUndefind(
  process.env.ADYEN_MERCHANT_ACCOUNT
);
const ADYEN_CLIENT_ENV = throwIfUndefind(process.env.ADYEN_CLIENT_ENV);

const requestPayment = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (typeof req.body.uuid !== "string") {
      throw new HttpRequestError(
        "EINVALID_INVOICE_UUID",
        400,
        "Expected invoice uuid"
      );
    }

    const { articlesSum, invoice } = await fetchInvoicePaymentDetails({
      uuid: req.body.uuid,
    });

    const client = new Client({
      apiKey: ADYEN_CLIENT_API_KEY,
      environment: ADYEN_CLIENT_ENV as any,
    });
    const checkout = new CheckoutAPI(client);

    const response = await checkout.sessions({
      amount: {
        currency: "CHF",
        value: articlesSum * 100, // * 100 because we want it in "Rappen"
      },
      reference: JSON.stringify({
        invoice: req.body.uuid,
        customer: invoice.customer.id,
      }),
      // FIXME: Handle the redirect result (in FE): https://docs.adyen.com/online-payments/web-drop-in#handle-redirect-result
      returnUrl: `http://localhost:3000/invoice/${req.body.uuid}`,
      merchantAccount: ADYEN_MERCHANT_ACCOUNT,
      countryCode: invoice.customer.address?.country_code,
      shopperEmail: invoice.customer.email,
      shopperReference: `customer-${invoice.customer.id}`, // POLISH use UUID isntead of number for primary key of customers (then remove customer-* prefix)
    });

    return httpResponse(res, 200, "Succesfully created checkout session", {
      session: response,
    });
  } catch (error) {
    return httpErrorResponse(res, error);
  }
};

export default requestPayment;
