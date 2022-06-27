import { defineEndpoint } from "@directus/extensions-sdk";
import { hmacValidator } from "@adyen/api-library";
import HttpRequestError from "@nydelic/toolbox/dist/handlers/http/HttpRequestError";
import httpErrorResponse from "@nydelic/toolbox/dist/handlers/http/httpErrorResponse";
import httpResponse from "@nydelic/toolbox/dist/handlers/http/httpResponse";
import testRequests from "./testRequests";
import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/notificationRequestItem";

const ADYEN_HMAC_KEY = process.env.ADYEN_HMAC_KEY;
if (!ADYEN_HMAC_KEY) {
  throw new Error("Missing HMAC key fro Adyen");
}

const validator = new hmacValidator();

// Notification Request JSON
const notificationRequest = {
  live: "false",
  notificationItems: [
    {
      NotificationRequestItem: testRequests.myNotificationRequestItem,
    },
  ],
} as const;
const notificationRequestItems = notificationRequest.notificationItems;

export default defineEndpoint((router) => {
  router.post("/", (_req, res) => {
    try {
      // Handling multiple notificationRequests
      let didSucceed = false;
      notificationRequestItems.forEach(function (notificationRequestItem) {
        // Handle the notification
        if (
          validator.validateHMAC(
            notificationRequestItem.NotificationRequestItem,
            ADYEN_HMAC_KEY
          )
        ) {
          // Process the notification based on the eventCode
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
            eventCode === NotificationRequestItem.EventCodeEnum["Authorisation"]
          ) {
            console.log(invoiceID);
            didSucceed = true;
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
      });

      if (!didSucceed) {
        throw new HttpRequestError("EUNKNOWN", 500, "An unknown error occured");
      } else {
        return httpResponse(res, 200, "Sücksess", {
          status: "[accepted]",
        });
      }
    } catch (error) {
      // BUG: (instanceof HttpRequestError not working): investigate why this way ALL HttpRequestError are interpreted as "Error" isntead -> therefore showing the default 500 message instead of the original informal HttpRequestError
      return httpErrorResponse(res, error);
    }
  });
});
