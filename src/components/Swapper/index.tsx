import { components } from "api/portals-schema";
import InputBuyToken from "components/inputs/InputBuyToken";
import InputSellToken from "components/inputs/InputSellToken";
import ReverseSwapButton from "components/ReverseSwapButton";
import SwapButton from "components/SwapButton";
import WalletButton from "components/WalletButton";
import { FC, useEffect, useState } from "react";
import { useStore } from "store";
import st from "./swapper.module.scss";

const Swapper: FC = () => {
  const [selectedSwapInputToken, setSelectedSwapInputToken] =
    useState<components["schemas"]["Token"]>();
  const [selectedSwapOutputToken, setSelectedSwapOutputToken] =
    useState<components["schemas"]["Token"]>();
  const [swapInputAmount, setSwapInputAmount] = useState<string>("");

  const [{ accounts, network }] = useStore();

  useEffect(() => {
    setSelectedSwapInputToken(undefined);
    setSelectedSwapOutputToken(undefined);
    setSwapInputAmount("");
  }, [network, network.selected]);

  const handleOnReverseSwapClick = () => {
    const inp = selectedSwapInputToken;
    const out = selectedSwapOutputToken;
    setSelectedSwapInputToken(out);
    setSelectedSwapOutputToken(inp);
  };

  return (
    <div className={st.swapperContainer}>
      <InputBuyToken
        amount={swapInputAmount}
        setAmount={setSwapInputAmount}
        onTokenChange={setSelectedSwapInputToken}
        token={selectedSwapInputToken}
      />
      <ReverseSwapButton
        onClick={handleOnReverseSwapClick}
        disabled={!selectedSwapInputToken && !selectedSwapOutputToken}
      />
      <InputSellToken
        amount={swapInputAmount}
        onTokenChange={setSelectedSwapOutputToken}
        token={selectedSwapOutputToken}
        buyToken={selectedSwapInputToken}
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
