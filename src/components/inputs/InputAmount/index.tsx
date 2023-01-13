import { components } from "api/portals-schema";
import cls from "classnames";
import LoadingSpinner from "components/LoadingSpinner";
import { DetailedHTMLProps, FC, InputHTMLAttributes, useRef } from "react";
import { AccountBalance } from "store/Reducer";
import { maxAmountSpend } from "utils/maxAmountSpend";
import st from "./input-amount.module.scss";

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  loading?: boolean;
  token?: components["schemas"]["TokenResponseDto"];
  accountBalance?: AccountBalance[];
}

const InputAmount: FC<Props> = ({
  className,
  loading,
  accountBalance,
  token,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxAmount = maxAmountSpend(
    (accountBalance || [])[0]?.balance || 0,
    token?.platform === "native"
  );

  const handleOnMaxClick = () => {
    if (inputRef.current && maxAmount) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      // this is needed to trigger a react onChange event:
      nativeInputValueSetter?.call(inputRef.current, maxAmount);
      var ev = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(ev);
    }
  };

  return (
    <div className={cls(st.inputAmountContainer, className)}>
      {!!accountBalance?.length && (
        <div className={st.accountBalanceInfo}>
          ± {accountBalance[0].balance.toFixed(4)} {accountBalance[0].symbol} (≈
          {accountBalance[0].balanceUSD}USD)
          {maxAmount &&
            parseFloat((props.value as string) || "0") < maxAmount && (
              <button className={st.maxButton} onClick={handleOnMaxClick}>
                MAX
              </button>
            )}
        </div>
      )}
      <input
        ref={inputRef}
        className={cls(st.inputAmount, {
          [st.hasBalance]: !!accountBalance && accountBalance[0]?.balance,
        })}
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        type="text"
        pattern="^[0-9]*[.]?[0-9]*$"
        placeholder="0.0"
        min="1"
        max="79"
        spellCheck="false"
        {...props}
      />
      <LoadingSpinner className={st.inputAmountLoading} visible={!!loading} />
    </div>
  );
};

export default InputAmount;
