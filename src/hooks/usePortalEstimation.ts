import { getPortalEstimation } from "api/fetcher";
import { components } from "api/portals-schema";
import { ApiError, ApiResponse } from "openapi-typescript-fetch";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";

const usePortalEstimation = (
  {
    buyToken,
    sellAmount,
    sellToken,
    slippagePercentage,
  }: {
    buyToken: string;
    sellAmount: string;
    sellToken: string;
    slippagePercentage: number;
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
    Promise<ApiResponse<components["schemas"]["EstimatePortalResponse"]>>,
    ApiError & {
      getActualType: () => {
        status: number;
        data: any;
      };
    },
    ApiResponse<components["schemas"]["EstimatePortalResponse"]>,
    string[]
  >(
    [
      "getPortalEstimation",
      network.selected,
      buyToken,
      debSellAmount,
      sellToken,
      accounts.selected,
    ],
    ({ signal }) =>
      getPortalEstimation(
        {
          network: network.selected,
          buyToken,
          sellAmount: debSellAmount,
          sellToken,
          slippagePercentage,
        },
        { signal }
      ),
    {
      enabled,
      retry: false,
      refetchInterval: 10000,
    }
  );
  return results;
};

export default usePortalEstimation;
