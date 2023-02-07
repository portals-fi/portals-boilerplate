import MetaMaskOnboarding from "@metamask/onboarding";
import { FC, useEffect, useRef, useState } from "react";
import { useStore } from "store";
import { actionTypes } from "store/Reducer";
import st from "./wallet-button.module.scss";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect Wallet";
const CONNECTED_TEXT = "Wallet Connected";

const WalletButton: FC = () => {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const onboarding = useRef<MetaMaskOnboarding>();

  const [{ accounts }, dispatch] = useStore();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if ((accounts.list || []).length > 0) {
        dispatch({
          type: actionTypes.SET_ACCOUNT_STATUS,
          value: "connected",
        });
        setButtonText(CONNECTED_TEXT);
        onboarding.current?.stopOnboarding();
      } else {
        dispatch({
          type: actionTypes.SET_ACCOUNT_STATUS,
          value: "disconnected",
        });
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    } else if (accounts.status !== "onboarding") {
      dispatch({
        type: actionTypes.SET_ACCOUNT_STATUS,
        value: "onboarding",
      });
    }
  }, [accounts.list, accounts.status, dispatch]);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined"
      ) {
        window.ethereum
          .request<string[]>({ method: "eth_requestAccounts" })
          .then((newAccounts) => {
            dispatch({
              type: actionTypes.SET_ACCOUNTS_LIST,
              value: (newAccounts || []) as string[],
            });
          });
      }
    } else {
      onboarding.current?.startOnboarding();
    }
  };
  return (
    <button disabled={isDisabled} onClick={onClick} className={st.walletButton}>
      {buttonText}
    </button>
  );
};

export default WalletButton;
