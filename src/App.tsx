"use client";

import "./App.css";
import Schedule from "./components/Schedule";

import Services from "./components/Services";
import CalendarManager from "./components/CalendarManager/CalendarManager";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  timestampToSpecificTimeZone,
  timestampToSpecificTimeZoneAndFormat,
} from "./utils";
import * as DTO from "./dto";
import { groupTimeByDateKey } from "./components/CalendarManager/utils";
import { domain, sendLog } from "./helpers";
import { ConfirmationPopup } from "./components/shared/ConfirmationPopup";
import BasicAlerts from "./components/shared/NotificationPopup";
import { v4 as uuidv4 } from "uuid";
import Login from "./components/Login/Login";
import { Alert } from "@mui/material";

export default function App() {
  const [isAuthorized, loginToApp] = useState<boolean>(false);
  const [isWrongPassword, setWrongPassword] = useState<boolean>(false);

  const authorize = (isPasswordCorrect: boolean) => {
    if (isPasswordCorrect) {
      loginToApp(true);
      setWrongPassword(false);
    } else {
      handleWrongPassword();
    }
  };

  const handleWrongPassword = () => {
    if (!isWrongPassword) {
      setWrongPassword(true);
      setTimeout(() => {
        setWrongPassword(false);
      }, 5000);
    }
  };

  return (
    <>
      {isWrongPassword && !isAuthorized && (
        <Alert className="alert" severity="error">
          Wrong password
        </Alert>
      )}
      {!isAuthorized ? <Login authorize={authorize} /> : <AppContent />}
    </>
  );
}

function AppContent() {
  // error
  const [errors, setErrors] = useState<DTO.CustomError[]>([]);

  const updateError = (error: DTO.CustomError) => {
    setErrors([...errors, error]);

    setTimeout(() => {
      setErrors((errors) => errors.filter((e) => e.id !== error?.id));
    }, 5000);
  };

  // Services
  const [services, setServices] = useState<DTO.IService[]>([]);

  // CalendarManager
  const [groupedTimeByDateKey, setDateTimes] = useState<DTO.DateTimes>({
    nonAvailableDates: {},
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
    const groupedTimesByDateKey = groupTimeByDateKey(
      availableDates,
      nonAvailableDates
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

      const nonAvailableDatesToUpdate = Object.values(
        groupedTimeByDateKey.nonAvailableDates
      )
        .flat()
        .map(timestampToSpecificTimeZoneAndFormat);

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
      sendLog("Admin page is activated");
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
        })
        .catch((error) => {
          updateError({ ...error, id: uuidv4() });
        });
    } catch (error: any) {
      updateError({ ...error, id: uuidv4() });
    }
  };

  // ConfirmationPopup
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<DTO.IRequest | null>(
    null
  );

  const onCancelRequest = (request: DTO.IRequest) => {
    setRequestToCancel(request);
    setPopupIsOpen(true);
  };

  const applyCancelRequest = () => {
    if (requestToCancel != null) {
      cancelRequest(requestToCancel);
    }
    setRequestToCancel(null);
  };

  const cancelCancelRequest = () => {
    setRequestToCancel(null);
  };

  const changeRequestDate = async (request: DTO.IUpdatedRequest) => {
    try {
      axios
        .put<DTO.IRequest>(
          `${domain}/api/request/approved/${request.date}`,
          request
        )
        .then(() => {
          getDates();
          getAvailableDates();
          getBookedDates();
          getApprovedDates();
        })
        .catch((error) => {
          updateError({ ...error, id: uuidv4() });
        });
    } catch (error: any) {
      updateError({ ...error, id: uuidv4() });
    }
  };

  return (
    <>
      {errors.length ? <BasicAlerts errors={errors} /> : ""}
      <ConfirmationPopup
        requestToCancel={requestToCancel}
        popupIsOpen={popupIsOpen}
        toggleState={setPopupIsOpen}
        apply={applyCancelRequest}
        cancel={cancelCancelRequest}
      />
      <div className="customBody">
        <div className="instructions">
          <a
            className="link-instruction"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/youjob13/annsh/blob/master/README.md"
          >
            🔗Инструкция
          </a>
        </div>
        <div className="settings">
          <Services services={services} setServices={setServices} />
          <Schedule
            services={services}
            changeRequestDate={changeRequestDate}
            cancelRequest={onCancelRequest}
            availableDates={availableDates}
            approvedRequests={approvedRequests}
            bookedRequests={bookedRequests}
          />
        </div>
        <CalendarManager
          groupedTimeByDateKey={groupedTimeByDateKey}
          getDates={getDates}
          setDateTimes={setDateTimes}
          groupTimesByDateKey={groupTimesByDateKey}
          updateDates={updateDates}
        />
      </div>
    </>
  );
}
