"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { DateTime } from "luxon";
import "./App.css";
import BasicAccordion from "./Accordion";
import {
  ISchedule,
  timestampToSpecificTimeZone,
  timestampToSpecificTimeZoneAndFormat,
} from "./utils";

export default function App() {
  const calendarRef = useRef<HTMLDivElement>();
  const [values, setValues] = useState<number[]>([]);
  const getDates = () => {
    axios
      .get<ISchedule[]>(
        "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/schedule"
      )
      .then(({ data }) => {
        setValues(data.map(timestampToSpecificTimeZone));
      });
  };

  useEffect(() => {
    try {
      getDates();
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  const updateDates = async (dates: number[]) => {
    try {
      const formattedDates = dates.map(timestampToSpecificTimeZoneAndFormat);
      await axios.post(
        "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/schedule",
        {
          dates: formattedDates,
        }
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  const reset = async () => {
    try {
      getDates();
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      <div className="customBody">
        <div>
          <Calendar
            multiple
            sort={true}
            format="MM/DD/YYYY HH:mm"
            ref={calendarRef}
            value={values}
            // @ts-ignore
            onChange={setValues}
            plugins={[
              <DatePanel key="date-panel" />,
              <TimePicker
                className="time-picker"
                key="time-picker"
                defaultValue={"00:00"}
                position="bottom"
                hideSeconds={true}
              />,
            ]}
          />
          <button onClick={() => reset()}>Сбросить изменения</button>
          <button onClick={() => updateDates(values)}>
            Сохранить изменения
          </button>
        </div>
        <div>
          <BasicAccordion />
        </div>
      </div>
    </>
  );
}
