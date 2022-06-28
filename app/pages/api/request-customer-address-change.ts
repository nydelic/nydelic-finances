import { NextApiRequest, NextApiResponse } from "next";
import nextHttpResponse from "utils/http/nextHttpResponse";
import nextHttpErrorResponse from "utils/http/nextHttpErrorResponse";
import HttpRequestError from "utils/http/HttpRequestError";
import { gql } from "graphql-request";
import graphQLClient from "utils/graphQLClient";

const validateEmail = (inputText: string) => {
  const mailformat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (inputText.match(mailformat)) {
    return true;
  } else {
    return false;
  }
};

const requestCustomerAddressChange = async (
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
    if (!req.body.street) {
      throw new HttpRequestError(
        "ESEND_INVALID_STREET",
        400,
        "No valid street provided."
      );
    }
    if (!req.body.street_number) {
      throw new HttpRequestError(
        "ESEND_INVALID_STREET_NUMBER",
        400,
        "No valid street number provided."
      );
    }
    if (!req.body.city) {
      throw new HttpRequestError(
        "ESEND_INVALID_CITY",
        400,
        "No valid city provided."
      );
    }
    if (!req.body.postal_code) {
      throw new HttpRequestError(
        "ESEND_INVALID_POSTAL_CODE",
        400,
        "No valid postal code provided."
      );
    }
    if (!req.body.country_code) {
      throw new HttpRequestError(
        "ESEND_INVALID_COUNTRY_CODE",
        400,
        "No valid country code provided."
      );
    }

    const query = gql`
      query getInvoiceCustomerAddress($UUID: String) {
        Invoice(filter: { id: { _eq: $UUID } }) {
          customer {
            id
            address {
              id
            }
          }
        }
      }
    `;
    const invoiceCustomerAddressResult: {
      Invoice: {
        customer: {
          id: string;
          address: { id: string } | null;
        };
      }[];
    } = await graphQLClient.request(query, {
      UUID: req.body.uuid,
    });
    if (!invoiceCustomerAddressResult.Invoice[0]) {
      throw new HttpRequestError(
        "EINVOICE_NOT_FOUND",
        404,
        "Requested invoice not found"
      );
    }

    const customerId = invoiceCustomerAddressResult.Invoice[0].customer.id;
    const addressId =
      invoiceCustomerAddressResult.Invoice[0].customer.address?.id;

    const addressVariables = {
      STREET: req.body.street,
      STREET_NUMBER: req.body.street_number,
      CITY: req.body.city,
      POSTAL_CODE: req.body.postal_code,
      COUNTRY_CODE: req.body.country_code,
    };

    if (!addressId) {
      const mutation = gql`
        mutation updateInvoiceCustomerAddress(
          $CUSTOMER_ID: ID!
          $STREET: String
          $STREET_NUMBER: String
          $CITY: String
          $POSTAL_CODE: String
          $COUNTRY_CODE: String
        ) {
          update_Customer_item(
            id: $CUSTOMER_ID
            data: {
              address: {
                street: $STREET
                street_number: $STREET_NUMBER
                city: $CITY
                postal_code: $POSTAL_CODE
                country_code: $COUNTRY_CODE
              }
            }
          ) {
            address {
              id
            }
          }
        }
      `;
      const customerAddressResult: {
        update_Customer_item: {
          id: string;
          address: {
            street: string;
            street_number: string;
            city: string;
            postal_code: string;
            country_code: string;
          };
        };
      } = await graphQLClient.request(mutation, {
        CUSTOMER_ID: customerId,
        ...addressVariables,
      });
      return nextHttpResponse(
        res,
        201,
        "Customer address created",
        customerAddressResult
      );
    } else {
      const mutation = gql`
        mutation updateInvoiceCustomerAddress(
          $ADDRESS_ID: ID!
          $STREET: String
          $STREET_NUMBER: String
          $CITY: String
          $POSTAL_CODE: String
          $COUNTRY_CODE: String
        ) {
          update_Address_item(
            id: $ADDRESS_ID
            data: {
              street: $STREET
              street_number: $STREET_NUMBER
              city: $CITY
              postal_code: $POSTAL_CODE
              country_code: $COUNTRY_CODE
            }
          ) {
            id
          }
        }
      `;
      const addressResult: {
        update_Address_item: {
          street: string;
          street_number: string;
          city: string;
          postal_code: string;
          country_code: string;
        };
      } = await graphQLClient.request(mutation, {
        ADDRESS_ID: addressId,
        ...addressVariables,
      });
      return nextHttpResponse(
        res,
        200,
        "Customer address updated",
        addressResult
      );
    }
  } catch (error) {
    return nextHttpErrorResponse(res, error);
  }
};

export default requestCustomerAddressChange;
