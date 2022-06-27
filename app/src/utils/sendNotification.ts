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
  // TODO: use graphql
  // const systemMutation = gql`
  //   mutation updateInvoice(
  //     $USER: create_directus_users_input
  //     $MESSAGE: String!
  //     $COLLECTION: String
  //   ) {
  //     create_notifications_item(
  //       data: {
  //         recipient: $USER
  //         subject: $MESSAGE
  //         timestamp: "0"
  //         collection: $COLLECTION
  //       }
  //     ) {
  //       id
  //     }
  //   }
  // `;
  // const sysemMutationResult: {
  //   create_notifications_item: {
  //     data: {
  //       id: string;
  //       timestamp: 0;
  //     };
  //   };
  // } = await graphQLSystemClient.request(systemMutation, {
  //   USER: notification.user,
  //   MESSAGE: notification.subject,
  //   COLLECTION: notification.collection,
  // });

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

  console.log(json);
}

export default sendNotification;
