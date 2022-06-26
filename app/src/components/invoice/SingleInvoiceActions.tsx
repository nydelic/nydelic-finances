import { ReactNode } from "react";

interface SingleInvoiceActionsProps {
  children: ReactNode;
}

function SingleInvoiceActions({ children }: SingleInvoiceActionsProps) {
  return (
    <div className="print:hidden mb-4 lg:m-0 font-mono dark:text-white lg:absolute lg:left-full lg:top-4 lg:py-4">
      {children}
    </div>
  );
}

export default SingleInvoiceActions;
