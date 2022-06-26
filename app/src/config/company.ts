// POLISH: move to env vars?
function removeSpaces(str: string) {
  return str.replace(/\s/g, "");
}

const IBAN = "CH58 0900 0000 1577 5641 0";

const companyConfig = {
  name: "Nydelic",
  legalName: "Nydelic KlG",
  address: {
    street: "Kirchberg",
    streetNumber: "4",
    postalCode: "8512",
    city: "Thundorf",
    countryCode: "CH",
  },
  IBAN: {
    formatted: IBAN,
    raw: removeSpaces(IBAN),
  },
};

export default companyConfig;
