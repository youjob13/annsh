import "./Login.css";

import { Button, TextField } from "@mui/material";
import React, { SyntheticEvent } from "react";
import bcrypt from "bcryptjs";

const Theme: Record<"day" | "night", any> = {
  day: {
    img: "https://cdn.dribbble.com/users/218750/screenshots/2090988/sleeping_beauty.gif",
  },
  night: {
    img: "https://cdn.dribbble.com/users/6191/screenshots/3661586/cat_sleep_dribbble.gif",
  },
} as const;

export default function Login({
  authorize,
}: {
  authorize: (isPasswordCorrect: boolean) => void;
}) {
  const now = new Date();
  const isDay = now.getHours() > 6 && now.getHours() < 20;
  const theme = isDay ? Theme.day : Theme.night;

  const [inputValue, updateInputValue] = React.useState("");

  const handleInput: React.FormEventHandler<HTMLInputElement> = (event) => {
    updateInputValue((event.target as HTMLInputElement).value);
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
    <div className={(isDay ? "day" : "night") + " login-wrapper"}>
      <div className="content">
        <img alt="kitty animation" src={theme.img} />
        <div className="form-controls">
          <TextField
            className="input"
            id="standard-basic"
            label="Password"
            variant={isDay ? "standard" : "filled"}
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
