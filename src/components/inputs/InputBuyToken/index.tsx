import { getAccountBalances } from "api/fetcher";
import { components } from "api/portals-schema";
import Modal from "components/Modal";
import SelectToken from "components/SelectToken";
import TokenButton from "components/TokenButton";
import { FC, useEffect, useState } from "react";
import { useStore } from "store";
import { actionTypes } from "store/Reducer";
import InputAmount from "../InputAmount";
import st from "../inputs.module.scss";

const amountRegExp = /^[0-9]*[.]?[0-9]*$/;

interface Props {
  amount: string;
  setAmount: (amount: string) => void;
  onTokenChange: (token: components["schemas"]["Token"]) => void;
  token: components["schemas"]["Token"] | undefined;
}

const InputBuyToken: FC<Props> = ({
  amount,
  setAmount,
  onTokenChange,
  token,
}) => {
  const [openSwapInputModal, setOpenSwapInputModal] = useState(false);
  const [loadingFetchBalances, setLoadingFetchBalances] = useState(false);
  const onOpenSwapInputModal = () => setOpenSwapInputModal(true);
  const onCloseSwapInputModal = () => setOpenSwapInputModal(false);
  const [{ accounts, network }, dispatch] = useStore();

  useEffect(() => {
    (async () => {
      if (accounts.selected) {
        setLoadingFetchBalances(true);
        try {
          const inputBalance = await getAccountBalances({
            ownerAddress: accounts.selected,
            networks: [network.selected],
          });
          dispatch({
            type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES,
            value: inputBalance.data.balances,
          });
        } catch (err) {
          if (err instanceof getAccountBalances.Error) {
            console.error(err.getActualType());
          }
        }
        setLoadingFetchBalances(false);
      }
    })();
  }, [accounts.selected, network.selected, dispatch]);

  const balances = accounts.selectedBalances?.find((bal) => {
    return bal.key === token?.key;
  });

  const handleOnSelectedSwapInputToken = (
    token: components["schemas"]["Token"]
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
          selectedNetwork={network.selected}
        />
      </Modal>
      <InputAmount
        className={st.amountInput}
        value={amount}
        onChange={handleOnSwapInputAmountChange}
        disabled={!token}
        loading={loadingFetchBalances}
        accountBalance={balances ? [balances] : undefined}
      />
    </>
  );
};

export default InputBuyToken;
