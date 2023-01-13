import { getAccountBalances } from "api/fetcher";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useStore } from "store";
import { AccountBalance, actionTypes } from "store/Reducer";

const useAccountBalances = () => {
  const [{ accounts, network }, dispatch] = useStore();
  const results = useQuery(
    ["accountBalances", accounts.selected, [network.selected]],
    () =>
      getAccountBalances({
        ownerAddress: accounts.selected,
        networks: [network.selected],
      }),
    {
      enabled: !!accounts.selected && !!network.selected,
    }
  );

  const accountBalances = results.data;

  useEffect(() => {
    if (
      !accountBalances?.ok ||
      !accountBalances.data ||
      accountBalances.data.balances.length <= 0
    ) {
      return;
    }
    dispatch({
      type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES,
      value: accountBalances.data.balances as unknown as AccountBalance[],
    });
  }, [
    accountBalances?.data.balances,
    accountBalances?.data,
    accountBalances?.ok,
    dispatch,
  ]);

  return results;
};

export default useAccountBalances;
