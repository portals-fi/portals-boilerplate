import Modal from "components/Modal";
import WalletButton from "components/WalletButton";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useStore } from "store";
import { actionTypes, SupportedNetworks } from "store/Reducer";
import { NETWORK_INFO } from "utils/network";
import st from "./header.module.scss";

const Header = () => {
  const [{ accounts, network }, dispatch] = useStore();
  const [openNetworkModal, setOpenNetworkModal] = useState(false);

  const handleOnCloseNetworkModal = () => setOpenNetworkModal(false);
  const handleOnOpenNetworkModal = () => setOpenNetworkModal(true);
  const handleOnNetworkSelected = (net: SupportedNetworks) => {
    dispatch({ type: actionTypes.SET_SELECTED_NETWORK, value: net });
    handleOnCloseNetworkModal();
  };

  useEffect(() => {
    (async () => {
      if (
        typeof window !== "undefined" &&
        typeof window.ethereum !== "undefined" &&
        window.ethereum.networkVersion != null
      ) {
        const networkInfo = NETWORK_INFO[network.selected];
        if (window.ethereum.networkVersion !== `${networkInfo.chainId}`) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [
                {
                  chainId: ethers.utils.hexValue(networkInfo.chainId),
                },
              ],
            });
          } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if ((err as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainName: networkInfo.name,
                    chainId: ethers.utils.hexValue(networkInfo.chainId),
                    nativeCurrency: networkInfo.currency,
                    rpcUrls: networkInfo.rpcUrls,
                  },
                ],
              });
            }
          }
        }
      }
    })();
  }, [network.selected]);

  const netData = NETWORK_INFO[network?.selected || "ethereum"];

  return (
    <header className={st.header}>
      <button className={st.networkButton} onClick={handleOnOpenNetworkModal}>
        {netData.name}
        <a
          className={st.explorerLink}
          href={netData.explorer}
          target="_blank"
          rel="noreferrer"
          title={netData.explorer}
          onClick={(ev) => ev.stopPropagation()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="8 12 12 16 16 12"></polyline>
            <line x1="12" y1="8" x2="12" y2="16"></line>
          </svg>
        </a>
      </button>
      <Modal open={openNetworkModal} onClose={handleOnCloseNetworkModal} center>
        <div className={st.networksContainer}>
          <h2 className={st.modalTitle}>Select a network:</h2>
          <div className={st.networksList}>
            {network.available
              .filter((net) => net !== network.selected)
              .map((net) => (
                <button key={net} onClick={() => handleOnNetworkSelected(net)}>
                  <>{NETWORK_INFO[net]?.name}</>
                </button>
              ))}
          </div>
        </div>
      </Modal>
      {accounts.status !== "connected" ? (
        <WalletButton />
      ) : (
        <button>
          {accounts.selectedBalances
            ?.find(
              (bal) =>
                bal.symbol.toLowerCase() ===
                netData.currency.symbol.toLowerCase()
            )
            ?.balance.toFixed(4)}{" "}
          {netData.currency.symbol}
          {"  "}
          {accounts.selected.slice(0, 6)}...{accounts.selected.slice(-4)}
        </button>
      )}
    </header>
  );
};

export default Header;
