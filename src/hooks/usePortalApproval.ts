import { getApproval } from "api/fetcher";
import { ApiError, ApiResponse } from "openapi-typescript-fetch";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";
import { components } from "../api/portals-schema";

const usePortalApproval = (
  {
    buyToken,
    sellAmount,
    sellToken,
  }: { buyToken: string; sellAmount: string; sellToken: string },
  enabled: boolean
) => {
  const [{ accounts, network }] = useStore();
  const [debSellAmount, setDebSellAmount] = useState(sellAmount);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebSellAmount(sellAmount);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [sellAmount]);
  const results = useQuery<
    Promise<ApiResponse<components["schemas"]["ApprovalResponse"]>>,
    ApiError & {
      getActualType: () => {
        status: number;
        data: any;
      };
    },
    ApiResponse<components["schemas"]["ApprovalResponse"]>,
    string[]
  >(
    [
      "getApproval",
      network.selected,
      buyToken,
      debSellAmount,
      sellToken,
      accounts.selected,
    ],
    ({ signal }) =>
      getApproval(
        {
          network: network.selected,
          buyToken,
          sellAmount: debSellAmount,
          sellToken,
          takerAddress: accounts.selected,
        },
        { signal }
      ),
    {
      enabled,
      retry: false,
    }
  );
  return results;
};

export default usePortalApproval;
