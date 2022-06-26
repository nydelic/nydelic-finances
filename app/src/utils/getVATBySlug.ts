export const VATList = {
  2021: { normal: 0.077, reduced: 0.025, special: 0.037 },
};

type BaseVATTypes = "normal" | "reduced" | "special";
export type VatSlug = `vat_${BaseVATTypes}_${number}`;

const getVATBySlug = (vatSlug: VatSlug) => {
  switch (vatSlug) {
    case "vat_normal_2021":
      return {
        percentage: VATList[2021].normal,
        label: `MwSt (${VATList[2021].normal * 100}%)`,
      };
    case "vat_reduced_2021":
      return {
        percentage: VATList[2021].reduced,
        label: `MwSt (${VATList[2021].reduced * 100}%)`,
      };
    case "vat_special_2021":
      return {
        percentage: VATList[2021].special,
        label: `MwSt (${VATList[2021].special * 100}%)`,
      };
    default:
      throw new Error("No Valid VAT slug provided");
  }
};

export default getVATBySlug;
