import { FC } from "react";
import { Modal as RespModal, ModalProps } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import st from "./modal.module.scss";

interface Props extends ModalProps {
  fixedHeight?: boolean;
  smallHeight?: boolean;
}

const Modal: FC<Props> = ({ children, fixedHeight, smallHeight, ...props }) => {
  return (
    <RespModal
      {...props}
      classNames={{
        modalContainer: st.modalContainer,
        overlay: st.customOverlay,
        modal: `${st.customModal} ${fixedHeight ? st["fixedHeight"] : ""} ${
          smallHeight ? st["smallHeight"] : ""
        }`,
        closeButton: st.closeButton,
        overlayAnimationIn: st.customEnterOverlayAnimation,
        overlayAnimationOut: st.customLeaveOverlayAnimation,
        modalAnimationIn: st.customEnterModalAnimation,
        modalAnimationOut: st.customLeaveModalAnimation,
      }}
    >
      {children}
    </RespModal>
  );
};

export default Modal;
