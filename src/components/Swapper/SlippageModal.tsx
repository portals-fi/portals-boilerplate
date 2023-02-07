import configureImage from "assets/images/configure.svg";
import Modal from "components/Modal";
import Image from "next/image";
import { FC, useState } from "react";
import st from "./swapper.module.scss";

interface Props {
  setSlippage: (slippage: number) => void;
  slippage: number;
}

const re = new RegExp(
  /^(?:-(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))|(?:0|(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))))(?:.\d+|)$/
);

const SlippageModal: FC<Props> = ({ setSlippage, slippage }) => {
  const [show, setShow] = useState(false);
  const [slip, setSlip] = useState(`${slippage}`);
  return (
    <>
      <button title="Configure" onClick={() => setShow(true)}>
        <Image alt="Configure" {...configureImage} />
      </button>
      <Modal
        fixedHeight
        smallHeight
        center
        onClose={() => setShow(false)}
        open={show}
      >
        <div className={st.modalContent}>
          <h2 className={st.modalTitle}>Transaction Settings</h2>
          <div className={st.settingsContent}>
            <span>Set slippage</span>
            <input
              value={slip}
              onChange={(e) => {
                const value = e.target.value;
                if (re.test(value)) {
                  setSlip(value);
                }
              }}
            />
          </div>
          <div className={st.modalActions}>
            <button
              onClick={() => {
                setSlippage(parseFloat(slip));
                setShow(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SlippageModal;
