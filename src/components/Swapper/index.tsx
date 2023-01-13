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
import st from "./swapper.module.scss";

const Swapper: FC = () => {
  const [selectedSwapSellToken, setSelectedSwapSellToken] =
    useState<components["schemas"]["TokenResponseDto"]>();
  const [selectedSwapBuyToken, setSelectedSwapBuyToken] =
    useState<components["schemas"]["TokenResponseDto"]>();
  const [swapInputAmount, setSwapInputAmount] = useState<string>("");
  const [proceedWithOrder, setProceedWithOrder] = useState(false);

  const approveMutation = useMetamaskApproval();
  const swapMutation = useMetamaskSwap();

  const [{ accounts, network }] = useStore();
  const selectedNetwork = useRef(network.selected); // THIS SHOULD ONLY BE USED FOR CLEAR INPUTS ON NETWORK CHANGES (ONLY NECESSARY FOR DEV, AVOID CLEAR INPUTS ON SAVE CHANGES)

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
      sellAmount: `${Math.floor(
        parseFloat(swapInputAmount) *
          Math.pow(10, selectedSwapSellToken?.decimals || 18)
      )}`,
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
    refetch: refetchPortal,
  } = usePortal(
    {
      buyToken: selectedSwapBuyToken?.address || "",
      sellAmount: `${Math.floor(
        parseFloat(swapInputAmount) *
          Math.pow(10, selectedSwapSellToken?.decimals || 18)
      )}`,
      sellToken: selectedSwapSellToken?.address || "",
      validate: !shouldApprove,
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
      sellAmount: `${Math.floor(
        parseFloat(swapInputAmount) *
          Math.pow(10, selectedSwapSellToken?.decimals || 18)
      )}`,
      sellToken: selectedSwapSellToken?.address || "",
    },
    !!selectedSwapBuyToken &&
      !!selectedSwapSellToken &&
      parseFloat(swapInputAmount) > 0
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

  const renderTable = () => {
    const sellAmount =
      parseFloat(portal?.data.context.sellAmount || "0") /
      Math.pow(10, selectedSwapSellToken?.decimals || 18);
    const buyAmount =
      parseFloat(portal?.data.context.buyAmount || "0") /
      Math.pow(10, selectedSwapBuyToken?.decimals || 18);

    return (
      <table className={st.swapInfoTable}>
        <tbody>
          <tr>
            <td>1 {selectedSwapSellToken?.symbol}</td>
            <td>
              ≈{(buyAmount / sellAmount).toFixed(5)}{" "}
              {selectedSwapBuyToken?.symbol}
            </td>
          </tr>
          <tr>
            <td>1 {selectedSwapBuyToken?.symbol}</td>
            <td>
              ≈{(sellAmount / buyAmount).toFixed(5)}{" "}
              {selectedSwapSellToken?.symbol}
            </td>
          </tr>
          <tr>
            <td>Minimum received:</td>
            <td>
              {parseFloat(portal?.data.context.minBuyAmount || "0") /
                Math.pow(10, selectedSwapBuyToken?.decimals || 18)}{" "}
              {selectedSwapBuyToken?.symbol}
            </td>
          </tr>
        </tbody>
      </table>
    );
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
  }, [swapMutation.isSuccess, refetchValidation]);

  useEffect(() => {
    if (selectedNetwork.current !== network.selected) {
      setSelectedSwapSellToken(undefined);
      setSelectedSwapBuyToken(undefined);
      setSwapInputAmount("");
      setProceedWithOrder(false);
      selectedNetwork.current = network.selected;
    }
  }, [network, network.selected]);

  useEffect(() => {
    // refetch portal every 10 secs
    const refetchTimeout = setInterval(() => {
      if (portal) {
        refetchPortal();
      }
    }, 10000);
    return () => clearInterval(refetchTimeout);
  }, [portal, refetchPortal]);

  return (
    <div className={st.swapperContainer}>
      <div className={st.title}>
        {proceedWithOrder && (
          <button onClick={() => setProceedWithOrder(false)}>{"<"}</button>
        )}
        <h3>{proceedWithOrder ? "Confirm Swap" : "Swap"}</h3>
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
      {proceedWithOrder && renderTable()}
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
