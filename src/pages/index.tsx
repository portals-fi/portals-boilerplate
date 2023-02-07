import Header from "components/Header";
import Swapper from "components/Swapper";
import useNetworkList from "hooks/useNetworkList";
import usePlatformsList from "hooks/usePlatformsList";
import type { NextPage } from "next";
import Head from "next/head";
import st from "../styles/Home.module.scss";

const Home: NextPage = () => {
  usePlatformsList();
  useNetworkList();

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
