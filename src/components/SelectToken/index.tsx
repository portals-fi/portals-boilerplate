import { components } from "api/portals-schema";
import LoadingSpinner from "components/LoadingSpinner";
import TokenButton from "components/TokenButton";
import { useOnScreen } from "hooks/useOnScreen";
import useTokenList from "hooks/useTokensList";
import { FC, useLayoutEffect, useRef, useState } from "react";
import st from "./select-token.module.scss";

interface Props {
  querySearch?: string;
  onSelected?: (token: components["schemas"]["TokenResponseDto"]) => void;
}

const SelectToken: FC<Props> = ({ querySearch, onSelected }) => {
  const [search, setSearch] = useState<string>(querySearch || "");
  const debTimeout = useRef<NodeJS.Timeout>();
  const hasMoreRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(hasMoreRef, scrollableRef);

  const {
    isLoading,
    data,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    hasNextPage,
  } = useTokenList({ search });

  useLayoutEffect(() => {
    if (isOnScreen && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, isOnScreen]);

  const handleOnInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(debTimeout.current);
    debTimeout.current = setTimeout(() => {
      refetch();
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
        {data?.pages.length === 0 && !isLoading && !!search && (
          <div className={st.noResults}>
            There are no results for &quot;{search}&quot;
          </div>
        )}
        {data?.pages.length === 0 && isLoading && (
          <div className={st.noResults}>
            <LoadingSpinner className={st.loadingSpinner} visible={true} />
          </div>
        )}
        {data?.pages.map((pageContent) =>
          pageContent.data.tokens
            .map((token) => ({
              ...token,
              image:
                !!token.image && token.image.startsWith("http")
                  ? token.image
                  : "",
            }))
            .map((token) => (
              <TokenButton
                key={token.key}
                onClick={() => {
                  onSelected && onSelected(token);
                }}
                token={token}
              />
            ))
        )}
        <div ref={hasMoreRef} className={st.hasMore}>
          {hasNextPage ? "Loading..." : ""}
        </div>
      </div>
    </div>
  );
};

export default SelectToken;
