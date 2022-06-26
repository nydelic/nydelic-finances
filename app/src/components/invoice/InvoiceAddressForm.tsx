import AsyncButton from "components/AsyncButton";
import { useRouter } from "next/router";
import { InvoiceShape } from "shapes/invoice";

export interface InvoiceAddressFormProps {
  invoice: InvoiceShape;
  onAddressFormFilled: (data: AddressData) => void;
}

export interface AddressData {
  street: string;
  street_number: string;
  city: string;
  postal_code: string;
  country_code: string;
}

function InvoiceAddressForm({
  invoice,
  onAddressFormFilled,
}: InvoiceAddressFormProps) {
  const { query } = useRouter();
  if (typeof query.uuid !== "string") {
    throw new Error("Expected UUID to be a string");
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const EVALUES_REQUIRED = "Expected formData entry to not be falsy";

        function validateAndTrimField(entry: FormDataEntryValue | null) {
          if (typeof entry !== "string") {
            throw new Error("Expected formData entry to be type string");
          }
          if (!entry.trim()) {
            alert("Please specify a value for each field");
            throw new Error(EVALUES_REQUIRED);
          }
          return entry.trim();
        }

        try {
          const addressData: AddressData = {
            street: validateAndTrimField(formData.get("street")),
            street_number: validateAndTrimField(formData.get("street_number")),
            city: validateAndTrimField(formData.get("city")),
            postal_code: validateAndTrimField(formData.get("postal_code")),
            country_code: validateAndTrimField(formData.get("country_code")),
          };

          const response = await fetch("/api/request-customer-address-change", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              uuid: query.uuid,
              ...addressData,
            }),
          });
          const json = await response.json();
          if (json.status === 200 || json.status === 201) {
            onAddressFormFilled(addressData);
          } else {
            throw new Error("An unknown error occured");
          }
        } catch (error: unknown) {
          console.error(error);
          if (!(error instanceof Error) || error.message !== EVALUES_REQUIRED) {
            throw new Error("EUNKNOWN", { cause: error as any });
          }
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <input
          required
          name="street"
          className="border border-black rounded-md py-1 px-2"
          placeholder="Strasse"
          defaultValue={invoice.customer.address?.street}
        />
        <input
          required
          name="street_number"
          className="border border-black rounded-md py-1 px-2"
          placeholder="Strassennummer"
          defaultValue={invoice.customer.address?.street_number}
        />
        <input
          required
          name="city"
          className="border border-black rounded-md py-1 px-2"
          placeholder="Stadt"
          defaultValue={invoice.customer.address?.city}
        />
        <input
          required
          name="postal_code"
          className="border border-black rounded-md py-1 px-2"
          placeholder="Postleitzahl"
          defaultValue={invoice.customer.address?.postal_code}
        />
        <select
          required
          name="country_code"
          className="border border-black rounded-md py-1 px-2"
          placeholder="Land"
          defaultValue={invoice.customer.address?.country_code}
        >
          <option value="CH">Schweiz</option>
          <option value="IT">Italien</option>
          <option value="FR">Frankreich</option>
        </select>
      </div>
      <AsyncButton type="submit">Speichern und fortfahren</AsyncButton>
    </form>
  );
}

export default InvoiceAddressForm;
