import { components } from "api/portals-schema";
import Modal from "components/Modal";
import SelectToken from "components/SelectToken";
import TokenButton from "components/TokenButton";
import { FC, useState } from "react";
import { useStore } from "store";
import InputAmount from "../InputAmount";
import st from "../inputs.module.scss";

interface Props {
  amount: string;
  onTokenChange: (token: components["schemas"]["TokenResponseDto"]) => void;
  token: components["schemas"]["TokenResponseDto"] | undefined;
  loading: boolean;
  tokenChangeDisabled?: boolean;
}

const InputSellToken: FC<Props> = ({
  amount,
  onTokenChange,
  token,
  loading,
  tokenChangeDisabled = false,
}) => {
  const [openSwapOutputModal, setOpenSwapOutputModal] = useState(false);

  const onCloseSwapOutputModal = () => setOpenSwapOutputModal(false);
  const onOpenSwapOutputModal = () => setOpenSwapOutputModal(true);
  const [{ network }] = useStore();

  const handleOnSelectedSwapOutputToken = (
    token: components["schemas"]["TokenResponseDto"]
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
        disabled={tokenChangeDisabled}
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
        />
      </Modal>
      <InputAmount
        className={st.amountInput}
        value={amount}
        onChange={() => {}}
        disabled
        loading={loading}
      />
    </>
  );
};

export default InputSellToken;
