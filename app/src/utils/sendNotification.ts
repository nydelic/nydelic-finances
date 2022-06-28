// import { gql } from "graphql-request";
// import graphQLSystemClient from "./graphQLSystemClient";

import throwIfUndefind from "./throwIfUndefind";

export interface Notification {
  user: string;
  subject: string;
  message: string;
  collection?: string;
  item?: string;
}

const DIRECTUS_ENDPOINT = throwIfUndefind(process.env.DIRECTUS_ENDPOINT);
const DIRECTUS_GRAPHQL_BEARER = throwIfUndefind(
  process.env.DIRECTUS_GRAPHQL_BEARER
);

async function sendNotification(notification: Notification) {
  // TODO: use graphql (see git history) https://github.com/directus/directus/issues/14100

  const response = await fetch(`${DIRECTUS_ENDPOINT}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIRECTUS_GRAPHQL_BEARER}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      recipient: notification.user,
      subject: notification.subject,
      message: notification.message,
      collection: notification.collection,
      item: notification.item,
    }),
  });
  const json = await response.json();
}

export default sendNotification;
