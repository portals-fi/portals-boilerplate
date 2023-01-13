import MetamaskHandler from "components/MetamaskHandler";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { StoreProvider } from "store";
import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <>
          <Component {...pageProps} />
          <MetamaskHandler />
        </>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
