import MetaMaskOnboarding from "@metamask/onboarding";
import { useEffect } from "react";
import { useStore } from "store";
import { actionTypes, Maybe } from "store/Reducer";

const MetamaskHandler = () => {
  const [, dispatch] = useStore();

  useEffect(() => {
    function handleNewAccounts(newAccounts: Maybe<string[]>) {
      dispatch({
        type: actionTypes.SET_ACCOUNTS_LIST,
        value: (newAccounts || []) as string[],
      });
    }

    function handleNewAccountsEvent(...args: unknown[]) {
      handleNewAccounts(args[0] as string[]);
    }

    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined"
      ) {
        window.ethereum
          .request<Maybe<string[]>>({ method: "eth_requestAccounts" })
          .then(handleNewAccounts);
        window.ethereum.on("accountsChanged", handleNewAccountsEvent);
      }
      return () => {
        if (
          typeof window !== "undefined" &&
          typeof window.ethereum !== "undefined"
        ) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleNewAccountsEvent
          );
        }
      };
    }
  }, [dispatch]);

  return null;
};

export default MetamaskHandler;
