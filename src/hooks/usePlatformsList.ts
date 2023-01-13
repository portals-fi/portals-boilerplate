import { getPlatformsList } from "api/fetcher";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";
import { actionTypes } from "store/Reducer";

const usePlatformsList = () => {
  const results = useQuery(["platformsList"], () => getPlatformsList({}));
  const [, dispatch] = useStore();

  useEffect(() => {
    if (!results.data?.ok || results.data.data.length <= 0) {
      return;
    }
    dispatch({
      type: actionTypes.SET_PLATFORMS_LIST,
      value: results.data.data,
    });
  }, [dispatch, results.data?.data, results.data?.ok]);

  return results;
};

export default usePlatformsList;
