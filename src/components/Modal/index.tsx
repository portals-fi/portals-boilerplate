import { FC } from "react";
import { Modal as RespModal, ModalProps } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import st from "./modal.module.scss";

interface Props extends ModalProps {
  fixedHeight?: boolean;
}

const Modal: FC<Props> = ({ children, fixedHeight, ...props }) => {
  return (
    <RespModal
      {...props}
      classNames={{
        modalContainer: st.modalContainer,
        overlay: st.customOverlay,
        modal: `${st.customModal} ${fixedHeight ? st["fixedHeight"] : ""}`,
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
