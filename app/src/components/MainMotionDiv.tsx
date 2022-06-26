import { ComponentProps } from "react";
import { motion } from "framer-motion";

type MotionDivOrigProps = ComponentProps<typeof motion.div>;
interface MainMotionDivProps
  extends Omit<
    MotionDivOrigProps,
    "initial" | "animate" | "exit" | "transition"
  > {
  children: React.ReactNode;
}

const MainMotionDiv = ({ children, ...props }: MainMotionDivProps) => {
  return (
    <motion.div
      {...props}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, staggerChildren: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default MainMotionDiv;
