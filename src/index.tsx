import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import bcrypt from "bcryptjs";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
async function authenticateUser() {
  const pass = prompt("Знаешь как я придумал этот пароль...?", "") || "";

  const isPassTrue = bcrypt.compareSync(
    pass,
    "$2a$10$rC2ALtQrkA.fhos4EBQ7i.Cm5hNAUEHY.kJnEPhu0PxEVufDK5F8e"
  );
  if (isPassTrue === false) {
    authenticateUser();
  }
}
authenticateUser();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
