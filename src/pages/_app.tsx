import MetamaskHandler from "components/MetamaskHandler";
import type { AppProps } from "next/app";
import { StoreProvider } from "store";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <>
        <Component {...pageProps} />
        <MetamaskHandler />
      </>
    </StoreProvider>
  );
}

export default MyApp;
