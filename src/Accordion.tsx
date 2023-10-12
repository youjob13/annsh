import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import {
  ISchedule,
  timestampToSpecificTimeZone,
  timestampToSpecificTimeZoneAndFormat,
} from "./utils";

export default function BasicAccordion() {
  const [bookedDates, setBookedDates] = React.useState<number[]>([]);
  const [availableDates, setAvailableDates] = React.useState<number[]>([]);

  const getBookedDates = () => {
    axios
      .get<ISchedule[]>(
        "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/schedule/booked"
      )
      .then(({ data }) => {
        setBookedDates(data.map(timestampToSpecificTimeZone));
      });
  };

  const getAvailableDates = () => {
    axios
      .get<ISchedule[]>(
        "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/schedule/available"
      )
      .then(({ data }) => {
        setAvailableDates(data.map(timestampToSpecificTimeZone));
      });
  };

  React.useEffect(() => {
    try {
      getBookedDates();
      getAvailableDates();
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Забронированные даты</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {bookedDates.map((value, index) => (
              <li key={index}>{timestampToSpecificTimeZoneAndFormat(value)}</li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Свободные даты</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {availableDates.map((value, index) => (
              <li key={index}>{timestampToSpecificTimeZoneAndFormat(value)}</li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
