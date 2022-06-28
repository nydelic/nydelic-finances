interface ConvertInvoiceDateToNrArgs {
  invoiceDateString: string;
}

function convertInvoiceDateToNr({
  invoiceDateString,
}: ConvertInvoiceDateToNrArgs) {
  const invDateFormatter = new Intl.DateTimeFormat("de-CH", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const invDateParts = invDateFormatter
    .formatToParts(Date.parse(invoiceDateString))
    .filter((part) =>
      ["month", "day", "hour", "minute", "second"].includes(part.type)
    )
    .map((part) => part.value);

  return `${invDateParts.join("")}`.padStart(5, "0");
}

export default convertInvoiceDateToNr;
