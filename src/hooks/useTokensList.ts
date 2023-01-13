import { getTokensList } from "api/fetcher";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { useStore } from "store";

const useTokenList = ({ search }: { search: string }) => {
  const [{ network }] = useStore();
  const [debSearch, setDebSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebSearch(search);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const results = useInfiniteQuery(
    ["tokensList", debSearch, network.selected],
    ({ pageParam = 0, signal }) =>
      getTokensList(
        {
          search: debSearch,
          page: pageParam,
          networks: [network.selected],
          sortBy: "liquidity",
          sortDirection: "desc",
        },
        { signal }
      ),
    {
      retry: false,
      getNextPageParam: (lastPage) =>
        lastPage.data.more ? lastPage.data.page + 1 : undefined,
    }
  );

  return results;
};

export default useTokenList;
