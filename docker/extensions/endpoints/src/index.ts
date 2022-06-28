import { defineEndpoint } from "@directus/extensions-sdk";
import { hmacValidator } from "@adyen/api-library";
import {
  HttpRequestError,
  httpResponse,
  httpErrorResponse,
} from "@nydelic/toolbox";

import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/notificationRequestItem";
import { ApiExtensionContext } from "@directus/shared/src/types";

const ADYEN_HMAC_KEY = process.env.ADYEN_HMAC_KEY;
if (!ADYEN_HMAC_KEY) {
  throw new Error("Missing HMAC key fro Adyen");
}

const validator = new hmacValidator();

async function handleEventCodes(
  eventCode: NotificationRequestItem.EventCodeEnum,
  notifReqItem: NotificationRequestItem,
  invoiceID: string,
  database: ApiExtensionContext["database"]
) {
  if (eventCode === NotificationRequestItem.EventCodeEnum["Authorisation"]) {
    if (notifReqItem.success !== NotificationRequestItem.SuccessEnum["True"]) {
      // POLISH: handle with notification instead of throwing?
      throw new HttpRequestError(
        "EUNHANDELED_REJECTION",
        400,
        "Payment was rejected :("
      );
    }

    try {
      const invoices = await database
        .table("Invoice")
        .where("id", invoiceID)
        .whereIn("status", [
          "sent",
          "payment_pending",
          "payment_received", // payment_received in case the webhook receives multiple requests for the same invoice after they got queued for instance
        ])
        .update({ status: "payment_received" });
      if (invoices !== 1) {
        throw new HttpRequestError(
          "ENO_UPDATABLE_INVOICE_FOUND",
          400,
          "Expected to update an invoice status"
        );
      }

      return;
    } catch (error) {
      console.error(error);
      throw new HttpRequestError("EUNKNOWN", 500, "An unknown error occured");
    }
  } else {
    throw new HttpRequestError(
      "EUNHANDELED_EVENT",
      400,
      `Event code not handeled: ${eventCode}`
    );
  }
}

// POLISH set-up sentry for logging?
export default defineEndpoint((router, { database }) => {
  router.post("/", async (req, res) => {
    try {
      const notificationRequestItems: any[] = req.body.notificationItems;

      const promises = notificationRequestItems.map(
        async (notificationRequestItem) => {
          // validate HMAC
          if (
            validator.validateHMAC(
              notificationRequestItem.NotificationRequestItem,
              ADYEN_HMAC_KEY
            )
          ) {
            const eventCode =
              notificationRequestItem.NotificationRequestItem.eventCode;
            const invoiceID: any = JSON.parse(
              notificationRequestItem.NotificationRequestItem.merchantReference
            ).invoice;
            if (typeof invoiceID !== "string") {
              throw new HttpRequestError(
                "EINVALID_INVOICE_UUID",
                400,
                "No valid invoice UUID provided"
              );
            }

            // run actual business logic based on event code
            return handleEventCodes(
              eventCode,
              notificationRequestItem.NotificationRequestItem,
              invoiceID,
              database
            );
          } else {
            throw new HttpRequestError(
              "EUNAUTHORIZED",
              403,
              "Unauthorized request"
            );
          }
        }
      );

      try {
        await Promise.all(promises);

        return httpResponse(res, 200, "Sücksess", {
          status: "[accepted]",
        });
      } catch (error) {
        console.error(error);
        throw new HttpRequestError("EUNKNOWN", 500, "An unknown error occured");
      }
    } catch (error) {
      return httpErrorResponse(res, error);
    }
  });
});
