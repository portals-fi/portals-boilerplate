import { components } from "api/portals-schema";
import InputBuyToken from "components/inputs/InputBuyToken";
import InputSellToken from "components/inputs/InputSellToken";
import ReverseSwapButton from "components/ReverseSwapButton";
import SwapButton from "components/SwapButton";
import WalletButton from "components/WalletButton";
import useMetamaskApproval from "hooks/useMetamaskApproval";
import useMetamaskSwap from "hooks/useMetamaskSwap";
import usePortal from "hooks/usePortal";
import usePortalApproval from "hooks/usePortalApproval";
import usePortalEstimation from "hooks/usePortalEstimation";
import { FC, useEffect, useRef, useState } from "react";
import { useStore } from "store";
import SlippageModal from "./SlippageModal";
import SwapInfoTable from "./SwapInfoTable";
import st from "./swapper.module.scss";

const Swapper: FC = () => {
  const [selectedSwapSellToken, setSelectedSwapSellToken] =
    useState<components["schemas"]["TokenResponseDto"]>();
  const [selectedSwapBuyToken, setSelectedSwapBuyToken] =
    useState<components["schemas"]["TokenResponseDto"]>();
  const [swapInputAmount, setSwapInputAmount] = useState<string>("");
  const [proceedWithOrder, setProceedWithOrder] = useState(false);
  const [slippage, setSlippage] = useState(0.05);

  const approveMutation = useMetamaskApproval();
  const swapMutation = useMetamaskSwap();

  const [{ accounts, network }] = useStore();
  const selectedNetwork = useRef(network.selected); // THIS SHOULD ONLY BE USED FOR CLEAR INPUTS ON NETWORK CHANGES (ONLY NECESSARY FOR DEV, THIS AVOID CLEAR INPUTS ON SAVE CHANGES)

  const sellAmount = `${Math.floor(
    parseFloat(swapInputAmount || "0") *
      Math.pow(10, selectedSwapSellToken?.decimals || 18)
  )}`;

  const {
    data: validation,
    isLoading: isValidationLoading,
    error: validationError,
    isFetched: isApprovalFetched,
    refetch: refetchValidation,
  } = usePortalApproval(
    {
      buyToken: selectedSwapBuyToken?.address || "",
      sellToken: selectedSwapSellToken?.address || "",
      sellAmount,
    },
    proceedWithOrder && selectedSwapSellToken?.platform !== "native"
  );

  const shouldApprove =
    !!validation?.data.context.shouldApprove ||
    selectedSwapSellToken?.platform !== "native";

  const {
    data: portal,
    isLoading: isPortalLoading,
    error: portalError,
  } = usePortal(
    {
      buyToken: selectedSwapBuyToken?.address || "",
      sellAmount,
      sellToken: selectedSwapSellToken?.address || "",
      validate: !shouldApprove,
      slippagePercentage: slippage,
    },
    proceedWithOrder &&
      (isApprovalFetched || selectedSwapSellToken?.platform === "native")
  );

  const {
    data: estimation,
    isLoading: isEstimateLoading,
    error: estimateError,
  } = usePortalEstimation(
    {
      buyToken: selectedSwapBuyToken?.address || "",
      sellAmount,
      sellToken: selectedSwapSellToken?.address || "",
      slippagePercentage: slippage,
    },
    !!selectedSwapBuyToken &&
      !!selectedSwapSellToken &&
      parseFloat(sellAmount) > 0 &&
      !proceedWithOrder
  );

  const isLoading =
    isEstimateLoading ||
    isPortalLoading ||
    isValidationLoading ||
    approveMutation.isLoading;
  const error = estimateError || portalError || validationError;
  const err = error?.getActualType();

  const handleOnReverseSwapClick = () => {
    setSelectedSwapSellToken(selectedSwapBuyToken);
    setSelectedSwapBuyToken(selectedSwapSellToken);
  };

  useEffect(() => {
    if (approveMutation.isSuccess) {
      refetchValidation();
      // We might need to wait for the validation to happen on chain
    }
  }, [approveMutation.isSuccess, refetchValidation]);

  useEffect(() => {
    if (swapMutation.isSuccess) {
      // We might need to wait for the swap to happen on chain
      // TODO: Do something after swap!!
    }
  }, [swapMutation.isSuccess]);

  useEffect(() => {
    if (selectedNetwork.current !== network.selected) {
      setSelectedSwapSellToken(undefined);
      setSelectedSwapBuyToken(undefined);
      setSwapInputAmount("");
      setProceedWithOrder(false);
      selectedNetwork.current = network.selected;
    }
  }, [network, network.selected]);

  return (
    <div className={st.swapperContainer}>
      <div className={st.title}>
        {proceedWithOrder && (
          <button onClick={() => setProceedWithOrder(false)}>{"<"}</button>
        )}
        <h3>{proceedWithOrder ? "Confirm Swap" : "Swap"}</h3>
        {!proceedWithOrder && (
          <SlippageModal setSlippage={setSlippage} slippage={slippage} />
        )}
      </div>
      <InputBuyToken
        amount={swapInputAmount}
        setAmount={setSwapInputAmount}
        onTokenChange={setSelectedSwapSellToken}
        token={selectedSwapSellToken}
        disabled={proceedWithOrder}
        tokenChangeDisabled={proceedWithOrder}
      />
      {!proceedWithOrder && (
        <ReverseSwapButton
          onClick={handleOnReverseSwapClick}
          disabled={!selectedSwapSellToken && !selectedSwapBuyToken}
        />
      )}
      <InputSellToken
        amount={
          estimation?.data.buyAmount
            ? (
                parseFloat(estimation?.data.buyAmount) *
                Math.pow(10, -(selectedSwapBuyToken?.decimals || 18))
              ).toString()
            : "0.0"
        }
        onTokenChange={setSelectedSwapBuyToken}
        token={selectedSwapBuyToken}
        loading={isLoading}
        tokenChangeDisabled={proceedWithOrder}
      />
      {proceedWithOrder && (
        <SwapInfoTable
          buyToken={selectedSwapBuyToken}
          sellToken={selectedSwapSellToken}
          portal={portal?.data}
          slippage={slippage}
        />
      )}
      {accounts.status !== "connected" ? (
        <WalletButton />
      ) : (
        <SwapButton
          disabled={
            !selectedSwapBuyToken ||
            !selectedSwapSellToken ||
            !swapInputAmount ||
            !!err ||
            isLoading
          }
          shouldApprove={proceedWithOrder && shouldApprove}
          proceedWithOrder={proceedWithOrder}
          onClick={() => {
            if (proceedWithOrder && shouldApprove && validation) {
              approveMutation.mutate(validation.data.tx);
              // We might need for the validation to happen
            } else if (proceedWithOrder && !shouldApprove && portal) {
              swapMutation.mutate(portal.data.tx);
            } else if (estimation && !estimateError) {
              setProceedWithOrder(true);
            }
          }}
        />
      )}
      {!!err && (
        <div>
          {(typeof err.data.message === "string"
            ? [err.data.message]
            : err.data.message
          ).map((message: string) => (
            <span className={st.errorMessage} key={message}>
              {message}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Swapper;
