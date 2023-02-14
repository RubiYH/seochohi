import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
//cookie
import { CookiesProvider } from "react-cookie";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";

const Wrapper = ({ children }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return children;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <CookiesProvider>
    <BrowserRouter>
      <Wrapper>
        <App />
      </Wrapper>
    </BrowserRouter>
  </CookiesProvider>
  // </React.StrictMode>
);
