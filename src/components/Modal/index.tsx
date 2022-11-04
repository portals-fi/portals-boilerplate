import { FC } from "react";
import { Modal as RespModal, ModalProps } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import st from "./modal.module.scss";

const Modal: FC<ModalProps> = ({ children, ...props }) => {
  return (
    <RespModal
      {...props}
      classNames={{
        modalContainer: st.modalContainer,
        overlay: st.customOverlay,
        modal: st.customModal,
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
