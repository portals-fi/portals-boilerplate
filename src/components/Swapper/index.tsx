import { estimateTransaction, getAccountBalances } from "api/fetcher";
import { components } from "api/portals-schema";
import InputAmount from "components/InputAmount";
import Modal from "components/Modal";
import ReverseSwapButton from "components/ReverseSwapButton";
import SelectToken from "components/SelectToken";
import SwapButton from "components/SwapButton";
import TokenButton from "components/TokenButton";
import WalletButton from "components/WalletButton";
import { FC, useEffect, useState } from "react";
import { useStore } from "store";
import { actionTypes } from "store/Reducer";
import st from "./swapper.module.scss";

const amountRegExp = /^[0-9]*[.]?[0-9]*$/;

const Swapper: FC = () => {
  const [openSwapInputModal, setOpenSwapInputModal] = useState(false);
  const [openSwapOutputModal, setOpenSwapOutputModal] = useState(false);
  const [selectedSwapInputToken, setSelectedSwapInputToken] =
    useState<components["schemas"]["Token"]>();
  const [selectedSwapOutputToken, setSelectedSwapOutputToken] =
    useState<components["schemas"]["Token"]>();
  const [swapInputAmount, setSwapInputAmount] = useState<string>("");
  const [loadingFetchBalances, setLoadingFetchBalances] = useState(false);
  const [loadingEstimatePortal, setLoadingEstimatePortal] = useState(false);

  const [estimation, setEstimation] =
    useState<components["schemas"]["EstimatePortalResponse"]>();

  const onOpenSwapInputModal = () => setOpenSwapInputModal(true);
  const onCloseSwapInputModal = () => setOpenSwapInputModal(false);
  const onOpenSwapOutputModal = () => setOpenSwapOutputModal(true);
  const onCloseSwapOutputModal = () => setOpenSwapOutputModal(false);

  const [{ accounts, network }, dispatch] = useStore();

  useEffect(() => {
    setSelectedSwapInputToken(undefined);
    setSelectedSwapOutputToken(undefined);
    setSwapInputAmount("");
  }, [network, network.selected]);

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

  useEffect(() => {
    const debTimeout = setTimeout(() => {
      (async () => {
        if (
          selectedSwapInputToken &&
          selectedSwapOutputToken &&
          parseFloat(swapInputAmount) > 0
        ) {
          setLoadingEstimatePortal(true);
          const request = await estimateTransaction({
            network: network.selected,
            buyToken: selectedSwapOutputToken.address,
            sellAmount: `${
              parseFloat(swapInputAmount) *
              10 ** selectedSwapInputToken.decimals
            }`,
            sellToken: selectedSwapInputToken.address,
            slippagePercentage: 0.005,
          });
          setEstimation(request.data);
          setLoadingEstimatePortal(false);
        }
      })();
    }, 500);
    return () => clearTimeout(debTimeout);
  }, [
    network.selected,
    selectedSwapInputToken,
    selectedSwapOutputToken,
    swapInputAmount,
  ]);

  const handleOnSelectedSwapInputToken = (
    token: components["schemas"]["Token"]
  ) => {
    setSelectedSwapInputToken(token);
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
        setSwapInputAmount(`${accounts.selectedBalances[0].balance}`);
      } else {
        setSwapInputAmount(ev.target.value);
      }
    }
  };

  const handleOnSelectedSwapOutputToken = (
    token: components["schemas"]["Token"]
  ) => {
    setSelectedSwapOutputToken(token);
    onCloseSwapOutputModal();
  };

  const handleOnReverseSwapClick = () => {
    const inp = selectedSwapInputToken;
    const out = selectedSwapOutputToken;
    setSelectedSwapInputToken(out);
    setSelectedSwapOutputToken(inp);
  };

  const balances = accounts.selectedBalances?.find(
    (bal) => bal.id === selectedSwapInputToken?.id
  );

  return (
    <div className={st.swapperContainer}>
      <TokenButton
        className={st.selectAToken}
        onClick={onOpenSwapInputModal}
        token={selectedSwapInputToken}
      />
      <Modal open={openSwapInputModal} onClose={onCloseSwapInputModal} center>
        <SelectToken
          querySearch={selectedSwapInputToken?.symbol || ""}
          onSelected={handleOnSelectedSwapInputToken}
          selectedNetwork={network.selected}
        />
      </Modal>
      <InputAmount
        className={st.amountInput}
        value={swapInputAmount}
        onChange={handleOnSwapInputAmountChange}
        disabled={!selectedSwapInputToken}
        loading={loadingFetchBalances}
        accountBalance={balances ? [balances] : undefined}
      />
      <ReverseSwapButton
        onClick={handleOnReverseSwapClick}
        disabled={!selectedSwapInputToken && !selectedSwapOutputToken}
      />
      <TokenButton
        className={st.selectAToken}
        onClick={onOpenSwapOutputModal}
        token={selectedSwapOutputToken}
      />
      <Modal open={openSwapOutputModal} onClose={onCloseSwapOutputModal} center>
        <SelectToken
          querySearch={selectedSwapOutputToken?.symbol || ""}
          onSelected={handleOnSelectedSwapOutputToken}
          selectedNetwork={network.selected}
        />
      </Modal>
      <InputAmount
        className={st.amountInput}
        defaultValue={
          estimation?.buyAmount
            ? parseFloat(estimation.buyAmount) /
              10 ** estimation.buyTokenDecimals
            : undefined
        }
        disabled
        loading={loadingEstimatePortal}
      />
      {accounts.status !== "connected" ? (
        <WalletButton />
      ) : (
        <SwapButton
          inputToken={selectedSwapInputToken}
          outputToken={selectedSwapOutputToken}
          amount={swapInputAmount}
        />
      )}
    </div>
  );
};

export default Swapper;
