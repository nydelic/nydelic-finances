import { NotificationRequestItem } from "@adyen/api-library/lib/src/typings/notification/notificationRequestItem";

const myNotificationRequestItem: NotificationRequestItem = {
  additionalData: {
    expiryDate: "12/2012",
    authCode: "1234",
    cardSummary: "7777",
    // totalFraudScore: "10",
    hmacSignature: "EhsiNpf4PQ7zmAVG2rjQ348+5Yq0iv61a+0iYhLov/E=",
    // NAME2: "VALUE2",
    // NAME1: "VALUE1",
    // "fraudCheck-6-ShopperIpUsage": "10",
    invoiceID: "uuid-xxx-xxx-xxx-xxx-xxx",
  } as NotificationRequestItem["additionalData"],
  amount: { currency: "GBP", value: 20100 },
  eventCode: NotificationRequestItem.EventCodeEnum["Authorisation"],
  eventDate: "2022-06-27T20:23:00+02:00",
  merchantAccountCode: "NydelicECOM",
  merchantReference: "8313842560770001",
  operations: [
    NotificationRequestItem.OperationsEnum["Cancel"],
    NotificationRequestItem.OperationsEnum["Capture"],
    NotificationRequestItem.OperationsEnum["Refund"],
  ],
  paymentMethod: "visa",
  pspReference: "DTOXILNPTUKY7OKL",
  reason: "1234:7777:12/2012",
  success: NotificationRequestItem.SuccessEnum["True"],
};

const testRequests = { myNotificationRequestItem };

export default testRequests;
