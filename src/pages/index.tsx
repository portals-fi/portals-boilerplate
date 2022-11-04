import { getNetworksList, getPlatformsList } from "api/fetcher";
import Header from "components/Header";
import Swapper from "components/Swapper";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { useStore } from "store";
import { actionTypes, SupportedNetworks } from "store/Reducer";
import st from "../styles/Home.module.scss";

const amountRegExp = /^[0-9]*[.]?[0-9]*$/;

const Home: NextPage = () => {
  const [{ platforms }, dispatch] = useStore();

  useEffect(() => {
    (async () => {
      const [netResults, platResults] = await Promise.all([
        getNetworksList({}),
        getPlatformsList({}),
      ]);
      dispatch({
        type: actionTypes.SET_AVAILABLE_NETWORKS,
        value: netResults.data as SupportedNetworks[],
      });
      dispatch({
        type: actionTypes.SET_PLATFORMS_LIST,
        value: platResults.data,
      });
    })();
  }, [dispatch]);

  return (
    <div className={st.container}>
      <Head>
        <title>Portals API Boilerplate</title>
        <meta name="description" content="Portals API Boilerplate" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={st.main}>
        <Swapper />
      </main>
      <footer className={st.footer}></footer>
    </div>
  );
};

export default Home;
