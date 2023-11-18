import axios from "axios";

// export const domain = "http://localhost:4000";
export const domain = "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com";

export const sendLog = (message?: string) => {
  axios.post(`${domain}/api/logs`, { message });
};
