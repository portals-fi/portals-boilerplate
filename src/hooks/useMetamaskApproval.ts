import { MetaMaskInpageProvider } from "@metamask/providers";
import { components } from "api/portals-schema";
import { useMutation } from "react-query";
import { Maybe } from "store/Reducer";

const useMetamaskApproval = () => {
  const mutation = useMutation<
    Maybe<components["schemas"]["ApprovalResponse"]>,
    Error,
    components["schemas"]["ApprovalResponse"]["tx"]
  >((transaction: components["schemas"]["ApprovalResponse"]["tx"]) => {
    const tx = {
      ...transaction,
      value: transaction.value?.hex,
      gasLimit: transaction.gasLimit?.hex,
    };
    return (window.ethereum as MetaMaskInpageProvider).request<
      components["schemas"]["ApprovalResponse"]
    >({ method: "eth_sendTransaction", params: [tx] });
  });

  return mutation;
};

export default useMetamaskApproval;
