import { ButtonHTMLAttributes, MouseEvent, useState } from "react";

interface AsyncButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "disabled"
  > {
  onClick?: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => Promise<void> | void;
}

function AsyncButton({ onClick, children, ...props }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      className={`text-sm py-2 px-3 rounded-md border border-black disabled:opacity-50 ${
        props.className || ""
      }`}
      onClick={async (ev) => {
        setLoading(true);
        try {
          return await onClick?.(ev);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }}
    >
      {children}
    </button>
  );
}

export default AsyncButton;
