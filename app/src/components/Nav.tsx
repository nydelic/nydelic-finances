import React, { useState, useEffect } from "react";
import Router from "next/router";
import styles from "./Nav.module.scss";

interface NavProps {
  children: React.ReactNode;
}

const Nav = ({ children }: NavProps) => {
  const [navOpen, setNavOpen] = useState(false);
  const [navOpenDelayed, setNavOpenDelayed] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const handleRouterChangeComplete = () => {
      setNavOpen((wasOpen) => {
        if (wasOpen) {
          // closing nav... we are navigating
          setAnimationFinished(false);
        }
        return false;
      });
    };
    Router.events.on("routeChangeComplete", handleRouterChangeComplete);
    return () => {
      Router.events.off("routeChangeComplete", handleRouterChangeComplete);
    };
  }, []);

  return (
    <>
      <div className={`${styles["nav-container"]}`}>
        <div
          className={`${styles["nav-burger"]} ${
            navOpen ? styles["nav-is-open"] : styles["nav-is-closed"]
          }`}
          onClick={() => {
            setNavOpen(!navOpen);
            setAnimationFinished(false);
          }}
        >
          <div></div>
          <div></div>
        </div>
        <div className={`${styles["nav-links"]}`}>
          {[0, 1].map((number) => {
            return (
              <div
                className={`${
                  navOpenDelayed
                    ? styles["nav-delay-is-open"]
                    : styles["nav-delay-is-closed"]
                } ${navOpen ? styles["nav-is-open"] : styles["nav-is-closed"]}`}
                key={"nav-links" + number}
                onTransitionEnd={() => {
                  if (navOpen) {
                    setNavOpenDelayed(true);
                  } else {
                    setAnimationFinished(false);
                    setNavOpenDelayed(false);
                  }
                }}
                onClick={() => {
                  setNavOpen(false);
                  setAnimationFinished(false);
                }}
              >
                <div
                  className={`${styles["nav-links-list"]}`}
                  onTransitionEnd={() => {
                    if (navOpenDelayed) {
                      setAnimationFinished(true);
                    }
                  }}
                >
                  {children}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`${styles["actual-nav-links"]} ${
            animationFinished
              ? styles["animation-finished"]
              : styles["animation-not-finished"]
          }`}
        >
          <div className={`${styles["nav-links-list"]}`}>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Nav;
