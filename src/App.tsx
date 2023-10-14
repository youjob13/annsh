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

const domain = "http://localhost:4000";

export default function App() {
  // CalendarManager
  const [dateList, setDates] = useState<number[]>([]);
  const [groupedTimeByDateKey, setDateTimes] = useState<DTO.DateTimes>({});

  const [nonAvailableDates, setNonAvailableDates] = useState<number[]>([]);

  // todo: useCallback
  const getDates = () => {
    axios.get<DTO.ISchedule[]>(`${domain}/api/schedule`).then(({ data }) => {
      const dates = data.map(({ timestamp }) =>
        timestampToSpecificTimeZone(timestamp)
      );

      setDates(dates);
      groupTimesByDateKey(dates);

      const nonAvailableDates = data
        .filter(({ isBooked }) => isBooked === true)
        .map(({ timestamp }) => timestamp);
      setNonAvailableDates(nonAvailableDates);
    });
  };

  const groupTimesByDateKey = (dates: number[]) => {
    const groupedTimesByDateKey = dates.reduce<DTO.DateTimes>((acc, date) => {
      const dateKey = dayjs(date).format("MM/DD/YYYY");

      if (acc[dateKey] != null) {
        acc[dateKey].push(date);
      } else {
        acc[dateKey] = [date];
      }
      return acc;
    }, {});

    setDateTimes(groupedTimesByDateKey);
  };

  const updateDates = async () => {
    try {
      const dateToUpdate = Object.values(groupedTimeByDateKey)
        .flat()
        .map(timestampToSpecificTimeZoneAndFormat);

      await axios.post(`${domain}/api/schedule`, {
        dates: dateToUpdate,
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
          dateList={dateList}
          nonAvailableDates={nonAvailableDates}
          groupedTimeByDateKey={groupedTimeByDateKey}
          getDates={getDates}
          setDateTimes={setDateTimes}
          groupTimesByDateKey={groupTimesByDateKey}
          setDates={setDates}
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
