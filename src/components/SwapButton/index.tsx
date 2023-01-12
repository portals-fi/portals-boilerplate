import { fetchFromPortal } from "api/fetcher";
import { components } from "api/portals-schema";
import { FC, useState } from "react";
import { useStore } from "store";
import st from "./swap-button.module.scss";

interface Props {
  inputToken?: components["schemas"]["Token"];
  outputToken?: components["schemas"]["Token"];
  amount?: string;
  onReviewOrder?: (data: components["schemas"]["PortalResponse"]) => void;
}

const SwapButton: FC<Props> = ({
  inputToken,
  outputToken,
  amount,
  onReviewOrder,
}) => {
  const [{ accounts, network }, dispatch] = useStore();
  const [approvalTx, setApprovalTx] =
    useState<components["schemas"]["ApprovalResponse"]>();
  const [portalTx, setPortalTx] =
    useState<components["schemas"]["PortalResponse"]>();
  const [loading, setLoading] = useState(false);
  const accountBalance = accounts.selectedBalances?.find(
    (bal) => bal.key === inputToken?.key
  );

  const canSwap =
    !!inputToken &&
    outputToken &&
    amount &&
    parseFloat(amount) > 0 &&
    accountBalance &&
    accountBalance.balance > 0 &&
    parseFloat(amount) <= accountBalance.balance;

  const handleOnSwapClick = async () => {
    setLoading(true);
    if (canSwap) {
      if (!portalTx) {
        try {
          const resp = await fetchFromPortal({
            network: network.selected,
            sellToken: inputToken.address,
            sellAmount: `${parseFloat(amount) * 10 ** inputToken.decimals}`,
            buyToken: outputToken.address,
            takerAddress: accounts.selected,
            slippagePercentage: 0.005,
            validate: true,
          });
          setPortalTx(resp.data);
          if (onReviewOrder) onReviewOrder(resp.data);
        } catch (e) {
          if (e instanceof fetchFromPortal.Error) {
            const error = e.getActualType();
            console.error(error);
            // If insufficient amount for gas the error is to generic, it returns 400 with this message:
            // Could not find a valid path for the swap; check token balance and ensure appropriate token approval is in place. Set validate=false to ignore
          }
        }
      } else {
        const tx = {
          ...portalTx.tx,
          value: portalTx.tx.value?.hex,
          gasLimit: portalTx.tx.gasLimit?.hex,
        };
        const txHash = await window.ethereum?.request<
          components["schemas"]["PortalResponse"]["tx"]
        >({ method: "eth_sendTransaction", params: [tx] });
        // TODO: do something with this:
        console.log(txHash);
      }
    }
    setLoading(false);
  };

  return (
    <button
      className={st.swapButton}
      onClick={handleOnSwapClick}
      disabled={!canSwap}
    >
      {portalTx ? "Swap" : "Review Order"}
    </button>
  );
};
export default SwapButton;
