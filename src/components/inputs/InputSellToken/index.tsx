import { estimateTransaction } from "api/fetcher";
import { components } from "api/portals-schema";
import Modal from "components/Modal";
import SelectToken from "components/SelectToken";
import TokenButton from "components/TokenButton";
import { FC, useEffect, useState } from "react";
import { useStore } from "store";
import InputAmount from "../InputAmount";
import st from "../inputs.module.scss";

interface Props {
  amount: string;
  onTokenChange: (token: components["schemas"]["Token"]) => void;
  token: components["schemas"]["Token"] | undefined;
  buyToken: components["schemas"]["Token"] | undefined;
}

const InputSellToken: FC<Props> = ({
  amount,
  onTokenChange,
  token,
  buyToken,
}) => {
  const [openSwapOutputModal, setOpenSwapOutputModal] = useState(false);
  const [loadingEstimatePortal, setLoadingEstimatePortal] = useState(false);
  const [estimation, setEstimation] =
    useState<components["schemas"]["EstimatePortalResponse"]>();
  const [{ network }] = useStore();

  const onCloseSwapOutputModal = () => setOpenSwapOutputModal(false);
  const onOpenSwapOutputModal = () => setOpenSwapOutputModal(true);

  useEffect(() => {
    const debTimeout = setTimeout(() => {
      (async () => {
        if (buyToken && token && parseFloat(amount) > 0) {
          setLoadingEstimatePortal(true);
          const request = await estimateTransaction({
            network: network.selected,
            buyToken: token.address,
            sellAmount: `${parseFloat(amount) * 10 ** buyToken.decimals}`,
            sellToken: buyToken.address,
            slippagePercentage: 0.005,
          });
          setEstimation(request.data);
          setLoadingEstimatePortal(false);
        }
      })();
    }, 500);
    return () => clearTimeout(debTimeout);
  }, [network.selected, buyToken, token, amount]);

  const handleOnSelectedSwapOutputToken = (
    token: components["schemas"]["Token"]
  ) => {
    onTokenChange(token);
    onCloseSwapOutputModal();
  };

  return (
    <>
      <TokenButton
        className={st.selectAToken}
        onClick={onOpenSwapOutputModal}
        token={token}
      />
      <Modal
        open={openSwapOutputModal}
        fixedHeight
        onClose={onCloseSwapOutputModal}
        center
      >
        <SelectToken
          querySearch={token?.symbol || ""}
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
    </>
  );
};

export default InputSellToken;
