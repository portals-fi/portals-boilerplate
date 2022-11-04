import cls from "classnames";
import { AllHTMLAttributes, DetailedHTMLProps, FC } from "react";
import st from "./loading-spinner.module.scss";

interface Props
  extends DetailedHTMLProps<AllHTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  visible: boolean;
}

const LoadingSpinner: FC<Props> = ({ className, visible }) => {
  return (
    <div className={cls(st.loader, { [st.visible]: visible }, className)}>
      Loading...
    </div>
  );
};

export default LoadingSpinner;
