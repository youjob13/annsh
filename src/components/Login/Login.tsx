import "./Login.css";

import { Button, TextField } from "@mui/material";
import React, { SyntheticEvent } from "react";
import bcrypt from "bcryptjs";

export default function Login({
  authorize,
}: {
  authorize: (isPasswordCorrect: boolean) => void;
}) {
  const [inputValue, updateInputValue] = React.useState("");

  const handleInput: React.FormEventHandler<HTMLInputElement> = (event) => {
    updateInputValue((event.target as HTMLInputElement).value);
    console.log("inputValue", inputValue);
  };

  const handleEnterPress = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if (event.key === "Enter") {
      checkPassword(event);
    }
  };

  const checkPassword = (event: SyntheticEvent) => {
    event.preventDefault();
    const isPassTrue = bcrypt.compareSync(
      inputValue,
      "$2a$10$rC2ALtQrkA.fhos4EBQ7i.Cm5hNAUEHY.kJnEPhu0PxEVufDK5F8e"
    );

    authorize(isPassTrue);
  };

  return (
    <div className="login-wrapper">
      <div className="content">
        <img
          alt="kitty animation"
          src="https://cdn.dribbble.com/users/6191/screenshots/3661586/cat_sleep_dribbble.gif"
        />
        <div className="form-controls">
          <TextField
            className="input"
            id="standard-basic"
            label="Password"
            variant="standard"
            onKeyUp={handleEnterPress}
            onInput={handleInput}
          />
          <Button
            disabled={!inputValue}
            className="button"
            variant="contained"
            onClick={checkPassword}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
