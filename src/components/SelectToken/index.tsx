import { getTokensList } from "api/fetcher";
import { components } from "api/portals-schema";
import LoadingSpinner from "components/LoadingSpinner";
import TokenButton from "components/TokenButton";
import { useOnScreen } from "hooks/useOnScreen";
import { FC, useEffect, useRef, useState } from "react";
import { SupportedNetworks } from "store/Reducer";
import st from "./select-token.module.scss";

interface Props {
  querySearch?: string;
  onSelected?: (token: components["schemas"]["Token"]) => void;
  selectedNetwork: SupportedNetworks;
}

const buildTokenList = (
  prev: components["schemas"]["Token"][],
  more: components["schemas"]["Token"][]
): components["schemas"]["Token"][] =>
  [...prev, ...more].filter(
    (value, index, self) =>
      !self.slice(0, index).find((t) => t.key === value.key)
  );

const SelectToken: FC<Props> = ({
  querySearch,
  onSelected,
  selectedNetwork,
}) => {
  const [tokens, setTokens] = useState<components["schemas"]["Token"][]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageItems, setPageItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [more, setMore] = useState<boolean>(false);
  // const [newPage, setNewPage] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  // const [newSearch, setNewSearch] = useState<string>(querySearch || "");
  const [search, setSearch] = useState<string>(querySearch || "");
  const debTimeout = useRef<NodeJS.Timeout>();
  const hasMoreRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(hasMoreRef, scrollableRef);

  // Change page when scrolling down:
  useEffect(() => {
    if (isOnScreen && more && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [isOnScreen, more, loading]);

  // Fetch tokens when mount or page/search change
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const tokensListResponse = (
          await getTokensList(
            {
              search,
              page,
              // platforms: ["native"],
              networks: [selectedNetwork],
              sortBy: "liquidity",
            },
            { signal: controller.signal }
          )
        ).data;
        setTokens((prev) =>
          (page > 0
            ? buildTokenList(prev, tokensListResponse.tokens)
            : tokensListResponse.tokens
          ).map((token) => ({
            ...token,
            image:
              !!token.image && token.image.startsWith("http")
                ? token.image
                : "",
          }))
        );
        setTotalItems(tokensListResponse.totalItems);
        setPageItems(tokensListResponse.pageItems);
        setMore(tokensListResponse.more);
      } catch (e) {
        if (e instanceof getTokensList.Error) {
          const error = e.getActualType();
          console.error(error);
        }
      }
      // Hack to wait for the useOnScreen to update:
      setTimeout(() => {
        setLoading(false);
      }, 500);
    })();
    return () => controller.abort();
  }, [search, page, selectedNetwork]);

  const handleOnInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(debTimeout.current);
    debTimeout.current = setTimeout(() => {
      setPage(0);
      setSearch(ev.target.value);
    }, 500);
  };

  return (
    <div className={st.tokensContainer}>
      <input
        className={st.searchInput}
        type="text"
        onChange={handleOnInputChange}
        placeholder="Ex: Eth"
        defaultValue={search}
      />
      <div className={st.tokensList} ref={scrollableRef}>
        {tokens.length === 0 && !loading && !!search && (
          <div className={st.noResults}>
            There are no results for &quot;{search}&quot;
          </div>
        )}
        {tokens.length === 0 && loading && (
          <div className={st.noResults}>
            <LoadingSpinner className={st.loadingSpinner} visible={true} />
          </div>
        )}
        {tokens.map((token) => (
          <TokenButton
            key={token.key}
            onClick={() => {
              onSelected && onSelected(token);
            }}
            token={token}
          />
        ))}
        <div ref={hasMoreRef} className={st.hasMore}>
          {more && "Loading..."}
        </div>
      </div>
    </div>
  );
};

export default SelectToken;
