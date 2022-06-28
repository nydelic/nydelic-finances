import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import Nav from "components/Nav";

import "@nydelic/toolbox/assets/scrollbar.scss";
import "assets/globals.css";

// POLISH i18n?
const MyApp = ({ Component, pageProps, router }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/qku3dje.css" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#171717" />
        <meta name="msapplication-TileColor" content="#fafafa" />
        <meta name="theme-color" content="#fafafa" />
      </Head>
      <Nav>
        <Link href={`/`}>
          <div className="nav-link">Kontakt</div>
        </Link>
      </Nav>
      <Component {...pageProps} key={router.asPath} />
    </>
  );
};

export default MyApp;
