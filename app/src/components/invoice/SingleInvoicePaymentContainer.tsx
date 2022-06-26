import { ReactNode } from "react";

interface SingleInvoicePaymentContainerProps {
  title: ReactNode;
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

function SingleInvoicePaymentContainer({
  title,
  children,
  leftAction,
  rightAction,
}: SingleInvoicePaymentContainerProps) {
  return (
    <div className="font-mono">
      <h1 className="text-center mb-4">
        <strong>{title}</strong>
      </h1>
      <div className="flex justify-between text-sm print:hidden">
        {leftAction || <div />}
        {rightAction}
      </div>
      {children}
    </div>
  );
}

export default SingleInvoicePaymentContainer;
