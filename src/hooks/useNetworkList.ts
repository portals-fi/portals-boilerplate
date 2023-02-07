import { getNetworksList } from "api/fetcher";
import { ApiResponse } from "openapi-typescript-fetch";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";
import { actionTypes, SupportedNetworks } from "store/Reducer";

const useNetworkList = () => {
  const results = useQuery<
    ApiResponse<string[]>,
    unknown,
    ApiResponse<SupportedNetworks[]>,
    string[]
  >(["networksList"], () => getNetworksList({}));

  const [, dispatch] = useStore();

  useEffect(() => {
    if (!results.data?.ok || results.data.data.length <= 0) {
      return;
    }

    dispatch({
      type: actionTypes.SET_AVAILABLE_NETWORKS,
      value: results.data.data,
    });
  }, [dispatch, results.data?.data, results.data?.ok]);

  return results;
};

export default useNetworkList;
