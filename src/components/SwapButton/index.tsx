import { FC } from "react";
import st from "./swap-button.module.scss";

interface Props {
  shouldApprove: boolean;
  proceedWithOrder: boolean;
  onClick: (e: any) => void;
  disabled: boolean;
}

const SwapButton: FC<Props> = ({
  onClick,
  shouldApprove,
  proceedWithOrder,
  disabled,
}) => {
  return (
    <button className={st.swapButton} onClick={onClick} disabled={disabled}>
      {proceedWithOrder && shouldApprove
        ? "Approve token"
        : proceedWithOrder
        ? "Swap"
        : "Review Order"}
    </button>
  );
};
export default SwapButton;
