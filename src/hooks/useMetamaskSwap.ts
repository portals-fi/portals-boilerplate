import { MetaMaskInpageProvider } from "@metamask/providers";
import { components } from "api/portals-schema";
import { useMutation } from "react-query";
import { Maybe } from "store/Reducer";

const useMetamaskSwap = () => {
  const mutation = useMutation<
    Maybe<components["schemas"]["PortalResponse"]>,
    Error,
    components["schemas"]["PortalResponse"]["tx"]
  >((transaction: components["schemas"]["PortalResponse"]["tx"]) => {
    const tx = {
      ...transaction,
      value: transaction.value?.hex,
      gasLimit: transaction.gasLimit?.hex,
    };
    return (window.ethereum as MetaMaskInpageProvider).request<
      components["schemas"]["PortalResponse"]
    >({ method: "eth_sendTransaction", params: [tx] });
  });

  return mutation;
};

export default useMetamaskSwap;
