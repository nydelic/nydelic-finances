import { GraphQLClient } from "graphql-request";
import throwIfUndefind from "./throwIfUndefind";

const DIRECTUS_ENDPOINT = throwIfUndefind(process.env.DIRECTUS_ENDPOINT);
const DIRECTUS_GRAPHQL_BEARER = throwIfUndefind(
  process.env.DIRECTUS_GRAPHQL_BEARER
);

const graphQLClient = new GraphQLClient(`${DIRECTUS_ENDPOINT}/graphql`, {
  headers: {
    authorization: `Bearer ${DIRECTUS_GRAPHQL_BEARER}`,
  },
});

export default graphQLClient;
