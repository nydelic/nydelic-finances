import { ReactNode } from "react";

interface SingleInvoiceContainerProps {
  children: ReactNode;
}

function SingleInvoiceContainer({ children }: SingleInvoiceContainerProps) {
  return (
    <div className="min-h-screen relative screen:grid">
      <div className="screen:p-4 screen:max-w-3xl w-full m-auto relative">
        {children}
      </div>
    </div>
  );
}

export default SingleInvoiceContainer;
