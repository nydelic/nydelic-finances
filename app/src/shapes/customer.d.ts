import { AddressShape } from "./address";

export interface CustomerShape {
  id: number;
  first_name: string;
  last_name: string;
  language: string;
  email: string;
  gender: "male" | "female" | string | null;
  address: AddressShape | null;
}
