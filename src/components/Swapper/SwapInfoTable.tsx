import { components } from "api/portals-schema";
import { FC } from "react";
import st from "./swapper.module.scss";

interface Props {
  sellToken?: components["schemas"]["TokenResponseDto"];
  buyToken?: components["schemas"]["TokenResponseDto"];
  portal?: components["schemas"]["PortalResponse"];
  slippage: number;
}

const SwapInfoTable: FC<Props> = ({
  sellToken,
  buyToken,
  portal,
  slippage,
}) => {
  const sellAmount =
    parseFloat(portal?.context.sellAmount || "0") /
    Math.pow(10, sellToken?.decimals || 18);
  const buyAmount =
    parseFloat(portal?.context.buyAmount || "0") /
    Math.pow(10, buyToken?.decimals || 18);

  const sellToBuy = sellAmount ? buyAmount / sellAmount : 0;
  const buyToSell = buyAmount ? sellAmount / buyAmount : 0;

  return (
    <table className={st.swapInfoTable}>
      <tbody>
        <tr>
          <td>1 {sellToken?.symbol}</td>
          <td>
            ≈{sellToBuy.toFixed(5)} {buyToken?.symbol}
          </td>
        </tr>
        <tr>
          <td>1 {buyToken?.symbol}</td>
          <td>
            ≈{buyToSell.toFixed(5)} {sellToken?.symbol}
          </td>
        </tr>
        <tr>
          <td>Minimum received:</td>
          <td>
            {parseFloat(portal?.context.minBuyAmount || "0") /
              Math.pow(10, buyToken?.decimals || 18)}{" "}
            {buyToken?.symbol}
          </td>
        </tr>
        <tr>
          <td>Slippage:</td>
          <td>{(slippage * 100).toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
  );
};

export default SwapInfoTable;
