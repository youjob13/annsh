"use client";

import "./App.css";
import Schedule from "./components/Schedule";

import Services from "./components/Services";
import CalendarManager from "./components/CalendarManager";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  timestampToSpecificTimeZone,
  timestampToSpecificTimeZoneAndFormat,
} from "./utils";
import dayjs from "dayjs";
import * as DTO from "./dto";

const domain = "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com";

export default function App() {
  // CalendarManager
  const [groupedTimeByDateKey, setDateTimes] = useState<DTO.DateTimes>({
    nonAvailableDates: [],
    availableDates: {},
  });

  // todo: useCallback
  const getDates = () => {
    axios.get<DTO.ISchedule[]>(`${domain}/api/schedule`).then(({ data }) => {
      const nonAvailableDates = data
        .filter(({ isBooked }) => isBooked === true)
        .map(({ timestamp }) => timestamp);

      const availableDates = data
        .filter(({ isBooked }) => isBooked !== true)
        .map(({ timestamp }) => timestamp);

      groupTimesByDateKey(nonAvailableDates, availableDates);
    });
  };

  const groupTimesByDateKey = (
    nonAvailableDates: number[],
    availableDates: number[]
  ) => {
    const groupedTimesByDateKey = availableDates.reduce<DTO.DateTimes>(
      (acc, date) => {
        const dateKey = dayjs(date).format("MM/DD/YYYY");

        if (acc.availableDates[dateKey] != null) {
          acc.availableDates[dateKey].push(date);
        } else {
          acc.availableDates[dateKey] = [date];
        }
        return acc;
      },
      { nonAvailableDates, availableDates: {} }
    );

    setDateTimes(groupedTimesByDateKey);
  };

  const updateDates = async () => {
    try {
      const availableDatesToUpdate = Object.values(
        groupedTimeByDateKey.availableDates
      )
        .flat()
        .map(timestampToSpecificTimeZoneAndFormat);

      const nonAvailableDatesToUpdate =
        groupedTimeByDateKey.nonAvailableDates.map(
          timestampToSpecificTimeZoneAndFormat
        );

      await axios.post(`${domain}/api/schedule`, {
        dates: [...availableDatesToUpdate, ...nonAvailableDatesToUpdate],
      });
      getAvailableDates();
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    try {
      getDates();
      getAvailableDates();
      getBookedDates();
      getApprovedDates();
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  // Schedule
  const [availableDates, setAvailableDates] = useState<number[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<DTO.IRequest[]>([]);
  const [bookedRequests, setBookedRequests] = useState<DTO.IRequest[]>([]);

  const getAvailableDates = () => {
    axios
      .get<DTO.ISchedule["timestamp"][]>(`${domain}/api/schedule/available`)
      .then(({ data }) => {
        setAvailableDates(
          data.map((timestamp) => timestampToSpecificTimeZone(timestamp))
        );
      });
  };

  const getBookedDates = () => {
    axios
      .get<DTO.IRequest[]>(`${domain}/api/schedule/booked`)
      .then(({ data }) => {
        const bookedRequests = data.map((request) => ({
          ...request,
          date: timestampToSpecificTimeZone(request.date),
        }));
        setBookedRequests(bookedRequests);
      });
  };

  const getApprovedDates = () => {
    axios
      .get<DTO.IRequest[]>(`${domain}/api/schedule/approved`)
      .then(({ data }) => {
        const approvedRequests = data.map((request) => ({
          ...request,
          date: timestampToSpecificTimeZone(request.date),
        }));
        setApprovedRequests(approvedRequests);
      });
  };

  const cancelRequest = async (request: DTO.IRequest) => {
    try {
      axios
        .put<DTO.IRequest>(`${domain}/api/request/${request.date}`)
        .then(() => {
          getDates();
          getAvailableDates();
          getBookedDates();
          getApprovedDates();
        });
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <>
      <div className="customBody">
        <CalendarManager
          groupedTimeByDateKey={groupedTimeByDateKey}
          getDates={getDates}
          setDateTimes={setDateTimes}
          groupTimesByDateKey={groupTimesByDateKey}
          updateDates={updateDates}
        />
        <div className="settings">
          <Services />
          <Schedule
            cancelRequest={cancelRequest}
            availableDates={availableDates}
            approvedRequests={approvedRequests}
            bookedRequests={bookedRequests}
          />
        </div>
      </div>
    </>
  );
}
