import { getPortal } from "api/fetcher";
import { components } from "api/portals-schema";
import { ApiError, ApiResponse } from "openapi-typescript-fetch";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";

const usePortal = (
  {
    buyToken,
    sellAmount,
    sellToken,
    slippagePercentage = 0.005,
    validate = false,
  }: {
    buyToken: string;
    sellAmount: string;
    sellToken: string;
    slippagePercentage?: number;
    validate?: boolean;
  },
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
    Promise<ApiResponse<components["schemas"]["PortalResponse"]>>,
    ApiError & {
      getActualType: () => {
        status: number;
        data: any;
      };
    },
    ApiResponse<components["schemas"]["PortalResponse"]>,
    string[]
  >(
    [
      "getPortal",
      network.selected,
      buyToken,
      debSellAmount,
      sellToken,
      accounts.selected,
    ],
    ({ signal }) =>
      getPortal(
        {
          network: network.selected,
          buyToken,
          sellAmount: debSellAmount,
          sellToken,
          slippagePercentage,
          takerAddress: accounts.selected,
          validate,
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

export default usePortal;
