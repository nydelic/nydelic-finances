import { defineEndpoint } from "@directus/extensions-sdk";
import { hmacValidator } from "@adyen/api-library";
import HttpRequestError from "@nydelic/toolbox/dist/handlers/http/HttpRequestError";
import httpErrorResponse from "@nydelic/toolbox/dist/handlers/http/httpErrorResponse";
import httpResponse from "@nydelic/toolbox/dist/handlers/http/httpResponse";
import testRequests from "./testRequests";

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

          console.log(eventCode);
        } else {
          throw new HttpRequestError(
            "EUNAUTHORIZED",
            403,
            "Unauthorized request"
          );
        }
      });

      return httpResponse(res, 200, "Sücksess", {
        key: process.env.ADYEN_HMAC_KEY,
      });
    } catch (error) {
      return httpErrorResponse(res, error);
    }
  });
});
