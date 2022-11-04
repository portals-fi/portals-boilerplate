import { getTokensList } from "api/fetcher";
import { components } from "api/portals-schema";
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

const SelectToken: FC<Props> = ({
  querySearch,
  onSelected,
  selectedNetwork,
}) => {
  const [tokens, setTokens] = useState<components["schemas"]["Token"][]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageItems, setPageItems] = useState<number>(0);
  const [more, setMore] = useState<boolean>(false);
  const [newPage, setNewPage] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [newSearch, setNewSearch] = useState<string>(querySearch || "");
  const [search, setSearch] = useState<string>();
  const debTimeout = useRef<NodeJS.Timeout>();
  const hasMoreRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(hasMoreRef, scrollableRef);

  useEffect(() => {
    if (search !== newSearch || page !== newPage) {
      (async () => {
        try {
          const tokensListResponse = (
            await getTokensList({
              search: encodeURIComponent(newSearch),
              page: newPage,
              // platforms: ["native"],
              networks: [selectedNetwork],
              sortBy: "liquidity",
            })
          ).data;

          setTokens((prev) =>
            newPage > 0
              ? [...prev, ...tokensListResponse.tokens]
              : tokensListResponse.tokens
          );
          setTotalItems(tokensListResponse.totalItems);
          setPageItems(tokensListResponse.pageItems);
          setMore(tokensListResponse.more);
          setPage(tokensListResponse.page);
          setSearch(newSearch || "");
        } catch (e) {
          if (e instanceof getTokensList.Error) {
            const error = e.getActualType();
            console.error(error);
          }
        }
      })();
    }
  }, [newSearch, newPage, search, page, selectedNetwork]);

  useEffect(() => {
    if (isOnScreen && more) {
      setNewPage((prev) => prev + 1);
    }
  }, [isOnScreen, more]);

  const handleOnInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(debTimeout.current);
    debTimeout.current = setTimeout(() => {
      setNewPage(0);
      setNewSearch(ev.target.value);
    }, 500);
  };

  return (
    <div className={st.tokensContainer}>
      <input
        className={st.searchInput}
        type="text"
        onChange={handleOnInputChange}
        placeholder="Ex: Eth"
        defaultValue={newSearch}
      />
      <div className={st.tokensList} ref={scrollableRef}>
        {tokens.map((token) => (
          <TokenButton
            key={token.key}
            onClick={() => {
              onSelected && onSelected(token);
            }}
            token={token}
          />
        ))}
        <div
          style={{ height: "20px", width: "100%" }}
          ref={hasMoreRef}
          className={st.hasMore}
        >
          {more && "Loading..."}
        </div>
      </div>
    </div>
  );
};

export default SelectToken;
