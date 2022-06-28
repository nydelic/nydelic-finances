import { gql } from "graphql-request";
import { NextApiRequest, NextApiResponse } from "next";
import { InvoiceShape } from "shapes/invoice";
import graphQLClient from "utils/graphQLClient";
import convertInvoiceDateToNr from "utils/convertInvoiceDateToNr";
import sendNotification, { Notification } from "utils/sendNotification";
import HttpRequestError from "@nydelic/toolbox/dist/handlers/http/HttpRequestError";
import httpResponse from "@nydelic/toolbox/dist/handlers/http/httpResponse";
import httpErrorResponse from "@nydelic/toolbox/dist/handlers/http/httpErrorResponse";

const CHECK_FOR_DID_PAY = "CHECK_FOR_DID_PAY"; // hey future me: if you want to export, move to seperate file otherwise error :)

async function updateInvoiceStatus(
  uuid: string,
  newStatus: InvoiceShape["status"],
  notification: Notification
) {
  const mutation = gql`
    mutation updateInvoice($UUID: ID!, $STATUS: String) {
      update_Invoice_item(id: $UUID, data: { status: $STATUS }) {
        status
      }
    }
  `;

  await graphQLClient.request(mutation, {
    UUID: uuid,
    STATUS: newStatus,
  });
  await sendNotification(notification);
}

async function checkForDidPay(
  currentStatus: InvoiceShape["status"],
  uuid: string,
  user: Notification["user"],
  createDate: string
) {
  if (currentStatus === "payment_pending") {
    throw new HttpRequestError(
      "EALREADY_NOTIFIED",
      400,
      "The status of the invoice indicates that the notification was already sent"
    );
  }
  if (currentStatus !== "sent") {
    throw new HttpRequestError(
      "EINVALID_STATUS",
      400,
      `Expected old invoice status to be "sent", but instead recieved: ${currentStatus}`
    );
  }

  const invoiceNr = convertInvoiceDateToNr({ invoiceDateString: createDate });
  await updateInvoiceStatus(uuid, "payment_pending", {
    user,
    subject: `Payed notice: Invoice (#${invoiceNr})`,
    message: `The customer reported that invoice (#${invoiceNr}) has been marked as PAYED`,
    collection: "Invoice",
    item: uuid,
  });
}

const requestInvoiceStatusUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    if (typeof req.body.uuid !== "string") {
      throw new HttpRequestError(
        "EMISSING_INVOICE",
        400,
        "Expected invoice uuid"
      );
    }
    if (![CHECK_FOR_DID_PAY].includes(req.body.checkFor)) {
      throw new HttpRequestError(
        "EINVALID_CHECKFRO",
        400,
        `Expected valid checkFor option, recieved instead: ${req.body.checkFor}`
      );
    }

    const query = gql`
      query getInvoices($UUID: String) {
        Invoice(filter: { id: { _eq: $UUID } }) {
          status
          create_date
          user_owner {
            id
          }
        }
      }
    `;
    const invoicesResult: {
      Invoice: {
        status: InvoiceShape["status"];
        create_date: InvoiceShape["create_date"];
        user_owner: {
          id: string;
        };
      }[];
    } = await graphQLClient.request(query, {
      UUID: req.body.uuid,
    });
    const oldInvoice = invoicesResult.Invoice[0];
    if (!oldInvoice) {
      throw new HttpRequestError(
        "EINVOICE_NOT_FOUND",
        404,
        "Requested invoice not found"
      );
    }

    const oldInvoiceStatus = oldInvoice.status;
    if (!oldInvoiceStatus) {
      throw new HttpRequestError(
        "EINVALID_INVOICE_STATUS",
        500,
        "Found invoice but it does not have a status"
      );
    }

    if (req.body.checkFor === CHECK_FOR_DID_PAY) {
      await checkForDidPay(
        oldInvoiceStatus,
        req.body.uuid,
        oldInvoice.user_owner.id,
        oldInvoice.create_date
      );
      return httpResponse(
        res,
        200,
        "Request for invoice status change recieved"
      );
    }
  } catch (error) {
    return httpErrorResponse(res, error);
  }
};

export default requestInvoiceStatusUpdate;
