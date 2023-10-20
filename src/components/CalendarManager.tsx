"use client";

import "./CalendarManager.css";
import DeleteIcon from "@mui/icons-material/Delete";
import * as React from "react";
import Button from "@mui/material/Button";
import { useRef } from "react";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Calendar } from "react-multi-date-picker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { Unstable_Popup as Popup } from "@mui/base/Unstable_Popup";
import { styled } from "@mui/system";
import { v4 as uuidv4 } from "uuid";
import * as DTO from "../dto";
import dayjs from "dayjs";

export default function CalendarManager({
  groupedTimeByDateKey,
  getDates,
  setDateTimes,
  groupTimesByDateKey,
  updateDates,
}: {
  groupedTimeByDateKey: DTO.DateTimes;
  getDates: () => void;
  groupTimesByDateKey: (nonAvailableDates: number[], dates: number[]) => void;
  setDateTimes: React.Dispatch<React.SetStateAction<DTO.DateTimes>>;
  updateDates: () => void;
}) {
  const calendarRef = useRef<HTMLDivElement>();

  const reset = async () => {
    try {
      getDates();
    } catch (error) {
      console.error("error", error);
    }
  };

  const updateDateTimes = (dateKey: string, selectedTimes: number[]) => {
    setDateTimes((prev) => {
      return {
        nonAvailableDates: prev.nonAvailableDates,
        availableDates: {
          ...prev.availableDates,
          [dateKey]: Array.from(new Set(selectedTimes)),
        },
      };
    });
  };

  return (
    <div className="calendar-manager">
      <Calendar
        sort={true}
        format="MM/DD/YYYY HH:mm"
        ref={calendarRef}
        mapDays={(day) => {
          const nonAvailableDates = Object.values(
            groupedTimeByDateKey.nonAvailableDates
          ).flat();
          if (
            nonAvailableDates.some((date) =>
              dayjs(date).isSame(dayjs(day.date.toDate()), "day")
            )
          ) {
            return {
              disabled: true,
              style: {
                backgroundColor: "brown",
                color: "white",
                pointerEvents: "none",
              },
            };
          }
          return {};
        }}
        value={[
          ...Object.values(groupedTimeByDateKey.nonAvailableDates).flat(),
          ...Object.values(groupedTimeByDateKey.availableDates).flat(),
        ]}
        // @ts-ignore
        onChange={(dates: DateObject[]) => {
          if (dates) {
            const nonAvailableDates = Object.values(
              groupedTimeByDateKey.nonAvailableDates
            ).flat();
            const availableDates = dates.filter(
              (date) => !nonAvailableDates.includes(+date)
            );
            groupTimesByDateKey(nonAvailableDates, availableDates);
          }
        }}
      />
      <ul className="dates">
        {Object.entries(
          (
            [
              ...Object.entries(groupedTimeByDateKey.availableDates).map(
                ([dateKey, times]) => {
                  return [dateKey, times.sort(), "available"];
                }
              ),
              ...Object.entries(groupedTimeByDateKey.nonAvailableDates).map(
                ([dateKey, times]) => {
                  return [dateKey, times.sort(), "nonAvailable"];
                }
              ),
            ].sort(([dateKeyA], [dateKeyB]) =>
              dateKeyA < dateKeyB ? -1 : 1
            ) as [string, number[], string][]
          ).reduce<
            Record<
              string,
              Record<string /* "isAvailable" | "isNonAvailable" */, number[]>
            >
          >((acc, [dateKey, times, isAvailable]) => {
            if (acc[dateKey] == null) {
              acc[dateKey] = { isNonAvailable: [], isAvailable: [] };
            }
            if (isAvailable === "available") {
              acc[dateKey].isAvailable = times;
            } else {
              acc[dateKey].isNonAvailable = times;
            }
            return acc;
          }, {})
        ).map(([dateKey, obj]) => (
          <li key={uuidv4()} className="specific-date">
            <div className="label">
              <div>
                <span>Дата: </span>
                <p>{dateKey}</p>
              </div>
              <div>
                <span>Время: </span>
                {obj["isAvailable"].length === 0 &&
                  obj["isNonAvailable"].length === 0 &&
                  `Нет выбранного времени 
                  на текущую дату`}
                {Object.entries(obj).map(
                  ([isAvailable, times]) =>
                    times.length !== 0 && (
                      <ul key={isAvailable} className="times">
                        {isAvailable === "isAvailable" &&
                          times.map((time) => (
                            <li
                              key={time + "isAvailable"}
                              className="specific-time"
                            >
                              <p>{dayjs(time).format("HH:mm")}</p>
                            </li>
                          ))}
                        {isAvailable === "isNonAvailable" &&
                          times.map((time) => (
                            <li
                              key={time + "isNonAvailable"}
                              className="specific-time nonavailable"
                            >
                              <p>{dayjs(time).format("HH:mm")}</p>
                            </li>
                          ))}
                      </ul>
                    )
                )}
              </div>
            </div>
            <AddTimes
              initialValues={
                obj["isAvailable"].length > 0
                  ? obj["isAvailable"]
                  : [+new Date(dateKey)]
              }
              updateDateTimes={(selectedTimes) =>
                updateDateTimes(dateKey, selectedTimes)
              }
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <Button variant="contained" onClick={() => reset()}>
          Сбросить изменения
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            const isSomeDateMissedTimes = Object.values(
              groupedTimeByDateKey.availableDates
            ).some((times) => times.length === 0);

            const isSomeNonAvailableDateMissedTimes = Object.values(
              groupedTimeByDateKey.nonAvailableDates
            ).some((times) => times.length === 0);

            if (isSomeDateMissedTimes && isSomeNonAvailableDateMissedTimes) {
              alert("Укажите время для всех дат");
              return;
            }

            updateDates();
          }}
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}

function AddTimes({
  initialValues,
  updateDateTimes,
}: {
  initialValues: number[];
  updateDateTimes: (selectedTimes: number[]) => void;
}) {
  const defaultTime = new Date(initialValues[0]);
  defaultTime.setHours(0);
  defaultTime.setMinutes(0);
  defaultTime.setSeconds(0);

  const [newTime, setNewTimeControl] = React.useState<number>(+defaultTime);
  const [editableTimes, setEditableTimes] = React.useState<
    Record<string, number>
  >(initialValues.reduce((acc, v) => ({ ...acc, [uuidv4()]: v }), {}));
  const [popupAnchor, setPopupAnchor] = React.useState<null | HTMLElement>(
    null
  );

  const open = Boolean(popupAnchor);
  const id = open ? "simple-popper" : undefined;

  const togglePopup = (event: React.MouseEvent<HTMLElement>) => {
    setPopupAnchor(popupAnchor ? null : event.currentTarget);
  };

  const updateEditableTime = (timeKey: string, times: dayjs.Dayjs | null) => {
    if (times == null) {
      return;
    }

    const timestamp = +times.toDate();
    setEditableTimes((prev) => ({ ...prev, [timeKey]: timestamp }));
  };

  const updateNewTimeControl = (time: dayjs.Dayjs | null) => {
    if (time == null) {
      return;
    }
    setNewTimeControl(+time.toDate());
  };

  const addTime = () => {
    setEditableTimes((prev) => ({
      ...prev,
      [Object.keys(editableTimes).length]: newTime,
    }));
  };

  const removeTime = (timeKey: string) => {
    const { [timeKey]: removedTime, ...filteredTimes } = editableTimes;

    setEditableTimes(filteredTimes);
  };

  const applyNewTime = (event: React.MouseEvent<HTMLElement>) => {
    togglePopup(event);
    updateDateTimes(Object.values(editableTimes));
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <IconButton aria-describedby={id} type="button" onClick={togglePopup}>
          {open ? (
            <span className="add-icon close">close</span>
          ) : (
            <AddIcon className="add-icon" />
          )}
        </IconButton>
        <Popup className="dpopup" id={id} open={open} anchor={popupAnchor}>
          <PopupBody translate="no">
            <div className="popup-section">
              {Object.values(editableTimes).length > 0 && (
                <div>
                  <p>Изменить время</p>
                  <ul className="change-time">
                    {Object.entries(editableTimes).map(
                      ([timeKey, timeValue]) => (
                        <div key={timeKey}>
                          <TimePicker
                            onChange={(times) =>
                              updateEditableTime(timeKey, times)
                            }
                            defaultValue={dayjs(timeValue)}
                          />
                          <IconButton
                            type="button"
                            onClick={() => removeTime(timeKey)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="popup-section">
              <p>Добавить новое время </p>
              <TimePicker
                onChange={(time) => updateNewTimeControl(time)}
                defaultValue={dayjs(+defaultTime)}
              />
              <Button type="button" onClick={addTime}>
                Добавить
              </Button>
            </div>

            <Button aria-describedby={id} type="button" onClick={togglePopup}>
              Отменить
            </Button>
            <Button aria-describedby={id} type="button" onClick={applyNewTime}>
              Сохранить
            </Button>
          </PopupBody>
        </Popup>
      </LocalizationProvider>
    </div>
  );
}

const grey = {
  50: "#f6f8fa",
  200: "#d0d7de",
  500: "#6e7781",
  700: "#424a53",
  900: "#24292f",
};

const PopupBody = styled("div")(
  ({ theme }) => `
  width: max-content;
  padding: 12px 16px;
  margin: 8px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  background-color: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
  box-shadow: ${
    theme.palette.mode === "dark"
      ? `0px 4px 8px rgb(0 0 0 / 0.7)`
      : `0px 4px 8px rgb(0 0 0 / 0.1)`
  };
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  z-index: 1;
`
);
