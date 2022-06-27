import { defineEndpoint } from "@directus/extensions-sdk";
import { hmacValidator } from "@adyen/api-library";
import HttpRequestError from "@nydelic/toolbox/dist/handlers/http/HttpRequestError";
import httpErrorResponse from "@nydelic/toolbox/dist/handlers/http/httpErrorResponse";
import httpResponse from "@nydelic/toolbox/dist/handlers/http/httpResponse";

import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/notificationRequestItem";

const ADYEN_HMAC_KEY = process.env.ADYEN_HMAC_KEY;
if (!ADYEN_HMAC_KEY) {
  throw new Error("Missing HMAC key fro Adyen");
}

const validator = new hmacValidator();

export default defineEndpoint((router, { database }) => {
  router.post("/", async (_req, res) => {
    try {
      const notificationRequestItems: any[] = _req.body.notificationItems;

      const promises = notificationRequestItems.map(
        async (notificationRequestItem) => {
          if (
            validator.validateHMAC(
              notificationRequestItem.NotificationRequestItem,
              ADYEN_HMAC_KEY
            )
          ) {
            const eventCode =
              notificationRequestItem.NotificationRequestItem.eventCode;
            const invoiceID: any = (
              notificationRequestItem.NotificationRequestItem
                .additionalData as any
            ).invoiceID;
            if (typeof invoiceID !== "string") {
              throw new HttpRequestError(
                "EINVALID_INVOICE_UUID",
                400,
                "No valid invoice UUID provided"
              );
            }

            if (
              eventCode ===
              NotificationRequestItem.EventCodeEnum["Authorisation"]
            ) {
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
                throw new HttpRequestError(
                  "EUNKNOWN",
                  500,
                  "An unknown error occured"
                );
              }
            } else {
              throw new HttpRequestError(
                "EUNHANDELED_EVENT",
                400,
                `Event code not handeled: ${eventCode}`
              );
            }
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
        throw new HttpRequestError("EUNKNOWN", 500, "An unknown error occured");
      }
    } catch (error) {
      // BUG: (instanceof HttpRequestError not working): investigate why this way ALL HttpRequestError are interpreted as "Error" isntead -> therefore showing the default 500 message instead of the original informal HttpRequestError
      return httpErrorResponse(res, error);
    }
  });
});
