import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import "./NotificationPopup.css";
import { CustomError } from "../../dto";

export default function BasicAlerts({ errors }: { errors: CustomError[] }) {
  return (
    <>
      {errors.map((error, index) => (
        <Stack
          key={error.id}
          className="notification-popup"
          sx={{ width: "100%", top: 60 * ((index + 1) / 2) }}
          spacing={2}
        >
          <Alert severity="error">{error?.response?.data}</Alert>
        </Stack>
      ))}
    </>
  );
}
