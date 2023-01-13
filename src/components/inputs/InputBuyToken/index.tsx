import { components } from "api/portals-schema";
import Modal from "components/Modal";
import SelectToken from "components/SelectToken";
import TokenButton from "components/TokenButton";
import useAccountBalances from "hooks/useAccounts";
import { FC, useState } from "react";
import { useStore } from "store";
import InputAmount from "../InputAmount";
import st from "../inputs.module.scss";

const amountRegExp = /^[0-9]*[.]?[0-9]*$/;

interface Props {
  amount: string;
  setAmount: (amount: string) => void;
  onTokenChange: (token: components["schemas"]["TokenResponseDto"]) => void;
  token: components["schemas"]["TokenResponseDto"] | undefined;
  disabled?: boolean;
  tokenChangeDisabled?: boolean;
}

const InputBuyToken: FC<Props> = ({
  amount,
  setAmount,
  onTokenChange,
  token,
  disabled = false,
  tokenChangeDisabled = false,
}) => {
  const [openSwapInputModal, setOpenSwapInputModal] = useState(false);
  const onOpenSwapInputModal = () => setOpenSwapInputModal(true);
  const onCloseSwapInputModal = () => setOpenSwapInputModal(false);
  const [{ accounts, network }] = useStore();

  const { isLoading: loadingFetchBalances } = useAccountBalances();

  const balances = accounts.selectedBalances?.find((bal) => {
    return bal.key === token?.key;
  });

  const handleOnSelectedSwapInputToken = (
    token: components["schemas"]["TokenResponseDto"]
  ) => {
    onTokenChange(token);
    onCloseSwapInputModal();
  };

  const handleOnSwapInputAmountChange = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (amountRegExp.test(ev.target.value)) {
      if (
        !!accounts.selectedBalances &&
        !!accounts.selectedBalances[0] &&
        parseFloat(ev.target.value) > accounts.selectedBalances[0].balance
      ) {
        setAmount(`${accounts.selectedBalances[0].balance}`);
      } else {
        setAmount(ev.target.value);
      }
    }
  };

  return (
    <>
      <TokenButton
        className={st.selectAToken}
        onClick={onOpenSwapInputModal}
        token={token}
        disabled={tokenChangeDisabled}
      />
      <Modal
        open={openSwapInputModal}
        fixedHeight
        onClose={onCloseSwapInputModal}
        center
      >
        <SelectToken
          querySearch={token?.symbol || ""}
          onSelected={handleOnSelectedSwapInputToken}
        />
      </Modal>
      <InputAmount
        className={st.amountInput}
        value={amount}
        onChange={handleOnSwapInputAmountChange}
        disabled={!token || disabled}
        loading={loadingFetchBalances}
        token={token}
        accountBalance={balances ? [balances] : undefined}
      />
    </>
  );
};

export default InputBuyToken;
