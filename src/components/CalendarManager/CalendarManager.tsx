"use client";

import "./CalendarManager.css";
import DeleteIcon from "@mui/icons-material/Delete";
import * as React from "react";
import Button from "@mui/material/Button";
import { useRef } from "react";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Calendar, DateObject } from "react-multi-date-picker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { Unstable_Popup as Popup } from "@mui/base/Unstable_Popup";
import { styled } from "@mui/system";
import { v4 as uuidv4 } from "uuid";
import * as DTO from "../../dto";
import dayjs from "dayjs";
import {
  extractGroupedTimeByDateKey,
  groupTimeByDateKey,
  highlightDateCannotBeRemoved,
  isTimeNotSelectedForDate,
} from "./utils";

type GroupedDatesTimeByDateKey = Record<
  DTO.DateType,
  Record<DTO.AvailabilityStatus, number[]>
>;

const getDatesToRender = (groupedTimeByDateKey: DTO.DateTimes) => {
  return Object.entries(
    (
      [
        ...extractGroupedTimeByDateKey(
          groupedTimeByDateKey.availableDates,
          DTO.DateType.AVAILABLE
        ),
        ...extractGroupedTimeByDateKey(
          groupedTimeByDateKey.nonAvailableDates,
          DTO.DateType.NON_AVAILABLE
        ),
      ].sort(([dateKeyA], [dateKeyB]) => (dateKeyA < dateKeyB ? -1 : 1)) as [
        DTO.DateType,
        number[],
        string
      ][]
    ).reduce<GroupedDatesTimeByDateKey>(
      (acc, [dateKey, times, availabilityStatus]) => {
        if (acc[dateKey] == null) {
          acc[dateKey] = {
            [DTO.AvailabilityStatus.IS_NON_AVAILABLE]: [],
            [DTO.AvailabilityStatus.IS_AVAILABLE]: [],
          };
        }
        if (availabilityStatus === DTO.DateType.AVAILABLE) {
          acc[dateKey][DTO.AvailabilityStatus.IS_AVAILABLE] = times;
        } else {
          acc[dateKey][DTO.AvailabilityStatus.IS_NON_AVAILABLE] = times;
        }
        return acc;
      },
      {} as GroupedDatesTimeByDateKey
    )
  );
};

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
  const [selectedDatesInBatchMode, updateDatesInBatchMode] =
    React.useState<DTO.DateTimes>({
      availableDates: {},
      nonAvailableDates: {},
    });
  const [isBatchModeActive, toggleBatchMode] = React.useState<boolean>(false);
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

  const updateGroupedDates = (dates: DateObject[]) => {
    if (dates) {
      if (isBatchModeActive) {
        const nonAvailableDates = Object.values(
          selectedDatesInBatchMode.nonAvailableDates
        ).flat();
        const availableDates = dates
          .filter((date) => !nonAvailableDates.includes(+date))
          .map(Number);

        updateDatesInBatchMode(
          groupTimeByDateKey(availableDates, nonAvailableDates)
        );
      } else {
        const nonAvailableDates = Object.values(
          groupedTimeByDateKey.nonAvailableDates
        ).flat();
        const availableDates = dates.filter(
          (date) => !nonAvailableDates.includes(+date)
        );

        groupTimesByDateKey(nonAvailableDates, availableDates as any);
      }
    }
  };

  return (
    <div className={isBatchModeActive ? "component-wrapper" : ""}>
      <div className="calendar-manager">
        <Button
          variant="contained"
          onClick={() => {
            reset();
            updateDatesInBatchMode({
              availableDates: {},
              nonAvailableDates: {},
            });
            toggleBatchMode(!isBatchModeActive);
          }}
        >
          {isBatchModeActive ? "Выключить" : "Включить"} батч режим
        </Button>

        {isBatchModeActive && (
          <div className="batch-mode-title">
            <p>
              <strong>Batch Mode</strong>
            </p>
            <a
              className="link"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/youjob13/annsh/blob/master/README.md"
            >
              🔗Режим позволяет добавить выбранное время, для всех выбранных дат
              в этом режиме
            </a>
          </div>
        )}

        <Calendar
          sort={true}
          format="MM/DD/YYYY HH:mm"
          ref={calendarRef}
          mapDays={(day) =>
            isBatchModeActive
              ? highlightDateCannotBeRemoved(
                  selectedDatesInBatchMode,
                  day,
                  false
                )
              : highlightDateCannotBeRemoved(groupedTimeByDateKey, day)
          }
          value={
            isBatchModeActive
              ? [
                  ...Object.values(
                    selectedDatesInBatchMode.nonAvailableDates
                  ).flat(),
                  ...Object.values(
                    selectedDatesInBatchMode.availableDates
                  ).flat(),
                ]
              : [
                  ...Object.values(
                    groupedTimeByDateKey.nonAvailableDates
                  ).flat(),
                  ...Object.values(groupedTimeByDateKey.availableDates).flat(),
                ]
          }
          onChange={(dates: DateObject[]) => updateGroupedDates(dates)}
        />
        {isBatchModeActive === false ? (
          <>
            <ul className="dates">
              {getDatesToRender(groupedTimeByDateKey).map(
                ([dateKey, groupedDatesByStatus]) => (
                  <li key={uuidv4()} className="specific-date">
                    <div className="label">
                      <div>
                        <span>Дата: </span>
                        <p>{dateKey}</p>
                      </div>
                      <div>
                        <span>Время: </span>
                        {isTimeNotSelectedForDate(groupedDatesByStatus) &&
                          `Нет выбранного времени на текущую дату`}
                        {Object.entries(groupedDatesByStatus).map(
                          ([availabilityStatus, times]) =>
                            times.length !== 0 && (
                              <ul key={uuidv4()} className="times">
                                {TimeItem(
                                  availabilityStatus as DTO.AvailabilityStatus,
                                  times
                                )}
                              </ul>
                            )
                        )}
                      </div>
                    </div>
                    <AddTimes
                      initialValues={
                        groupedDatesByStatus[
                          DTO.AvailabilityStatus.IS_AVAILABLE
                        ].length > 0
                          ? groupedDatesByStatus[
                              DTO.AvailabilityStatus.IS_AVAILABLE
                            ]
                          : [+new Date(dateKey)]
                      }
                      updateDateTimes={(selectedTimes) =>
                        updateDateTimes(dateKey, selectedTimes)
                      }
                    />
                  </li>
                )
              )}
            </ul>
          </>
        ) : (
          <>
            <BatchAddTimes
              datesToAddTimes={selectedDatesInBatchMode}
              updateDateTimes={({ availableDates, nonAvailableDates }) => {
                const getRes = (prev: DTO.DateTimes) => {
                  const availableDatesUpdated = {
                    ...prev.availableDates,
                    ...Object.entries(availableDates).reduce(
                      (acc, [dateKey, times]) => {
                        const res = Array.from(
                          new Set([
                            ...times,
                            ...(prev.availableDates[dateKey] ?? []),
                          ])
                        );
                        return {
                          ...acc,
                          [dateKey]: res,
                        };
                      },
                      {}
                    ),
                  };

                  const nonAvailableDatesUpdated = {
                    ...prev.nonAvailableDates,
                    ...Object.entries(nonAvailableDates).reduce(
                      (acc, [dateKey, times]) => {
                        const res = Array.from(
                          new Set([
                            ...times,
                            ...(prev.nonAvailableDates[dateKey] ?? []),
                          ])
                        );
                        return {
                          ...acc,
                          [dateKey]: res,
                        };
                      },
                      {}
                    ),
                  };

                  return {
                    availableDates: availableDatesUpdated,
                    nonAvailableDates: nonAvailableDatesUpdated,
                  };
                };

                updateDatesInBatchMode(getRes);
                setDateTimes(getRes);
                toggleBatchMode(false);
              }}
            />
          </>
        )}

        {isBatchModeActive === false && (
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

                if (
                  isSomeDateMissedTimes &&
                  isSomeNonAvailableDateMissedTimes
                ) {
                  alert("Укажите время для всех дат");
                  return;
                }

                updateDates();
              }}
            >
              Сохранить изменения
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeItem(availabilityStatus: DTO.AvailabilityStatus, times: number[]) {
  return times.map((time) => (
    <li
      key={time + availabilityStatus}
      className={"specific-time " + availabilityStatus}
    >
      <p>{dayjs(time).format("HH:mm")}</p>
    </li>
  ));
}

function BatchAddTimes({
  datesToAddTimes,
  updateDateTimes,
}: {
  datesToAddTimes: DTO.DateTimes;
  updateDateTimes: (args: {
    availableDates: Record<string, number[]>;
    nonAvailableDates: Record<string, number[]>;
  }) => void;
}) {
  const defaultTime = new Date();
  defaultTime.setHours(0);
  defaultTime.setMinutes(0);
  defaultTime.setSeconds(0);

  const [newTime, setNewTimeControl] = React.useState<number>(+defaultTime);
  const [resTime, setResTime] = React.useState<{
    availableDates: Record<string, number[]>;
    nonAvailableDates: Record<string, number[]>;
  }>({ availableDates: {}, nonAvailableDates: {} });
  const [editableTimes, setEditableTimes] = React.useState<
    Record<string, number>
  >({});
  const [popupAnchor, setPopupAnchor] = React.useState<null | HTMLElement>(
    null
  );

  const open = Boolean(popupAnchor);
  const id = open ? "simple-popper" : undefined;

  const togglePopup = (event: React.MouseEvent<HTMLElement>) => {
    setPopupAnchor(popupAnchor ? null : event.currentTarget);
  };

  const updateEditableTime = (key: string, times: dayjs.Dayjs | null) => {
    if (times == null) {
      return;
    }

    const timestamp = +times.toDate();
    setEditableTimes((prev) => ({ ...prev, [key]: timestamp }));
  };

  const updateNewTimeControl = (time: dayjs.Dayjs | null) => {
    if (time == null) {
      return;
    }
    setNewTimeControl(+time.toDate());
  };

  const addTime = () => {
    const isTimeAlreadyExists = Object.values(editableTimes).some(
      (time) =>
        dayjs(time).hour() === dayjs(newTime).hour() &&
        dayjs(time).minute() === dayjs(newTime).minute()
    );
    if (isTimeAlreadyExists) {
      return;
    }
    setEditableTimes((prev) => ({ ...prev, [uuidv4()]: newTime }));
  };

  const removeTime = (timestamp: number) => {
    const { [timestamp]: removedTime, ...filteredTimes } = editableTimes;

    setEditableTimes(filteredTimes);
  };

  const applyNewTime = (event: React.MouseEvent<HTMLElement>) => {
    togglePopup(event);

    const handler = (
      acc: Record<string, number[]>,
      [dateKey, times]: [string, number[]]
    ): Record<string, number[]> => {
      const timesToEdit = Object.values(editableTimes);
      const datesWithAddedTimes = timesToEdit
        .slice(0, timesToEdit.length)
        .map((time) => {
          const date = new Date(dateKey);
          const dayJsTime = dayjs(time);
          date.setHours(dayJsTime.hour(), dayJsTime.minute(), 0, 0);
          return +date;
        });

      return { ...acc, [dateKey]: datesWithAddedTimes };
    };

    const { availableDates, nonAvailableDates } = datesToAddTimes;

    const updatedAvailableDates = Object.entries(availableDates).reduce(
      handler,
      {}
    );
    const updatedNonAvailableDates = Object.entries(nonAvailableDates).reduce(
      handler,
      {}
    );

    setResTime({
      availableDates: updatedAvailableDates,
      nonAvailableDates: updatedNonAvailableDates,
    });
  };

  const cancel = (event: React.MouseEvent<HTMLElement>) => {
    togglePopup(event);
    setEditableTimes({});
  };

  const save = () => {
    updateDateTimes(resTime);
  };

  return (
    <div className="batch-time">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <IconButton
          aria-describedby={id}
          className="icon-btn"
          type="button"
          onClick={(event) => {
            if (
              Object.values(datesToAddTimes.nonAvailableDates).flat().length ===
                0 &&
              Object.values(datesToAddTimes.availableDates).flat().length === 0
            ) {
              return;
            }
            togglePopup(event);
          }}
        >
          {open ? <span className="add-icon close">close</span> : <AddIcon />}
        </IconButton>

        <div>
          {!(
            Object.values(datesToAddTimes.nonAvailableDates).length === 0 &&
            Object.values(datesToAddTimes.availableDates).length === 0
          ) && (
            <div className="dates-in-batch-mode">
              Выбранные даты:
              <ul className="dates">
                {getDatesToRender(datesToAddTimes).map(
                  ([dateKey, groupedDatesByStatus]) => (
                    <li key={uuidv4()} className="specific-date">
                      <span>{dateKey}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <div className="dates-in-batch-mode">
            {Object.values(editableTimes).length !== 0 && (
              <p>Выбранное время: </p>
            )}
            {Object.entries(editableTimes).map(([timeKey, time]) => (
              <li key={uuidv4()} className="specific-date">
                <span>{dayjs(time).format("HH:mm")}</span>
              </li>
            ))}
          </div>
        </div>

        <Button type="button" onClick={save}>
          Добавить время для выбранных дат
        </Button>

        <Popup className="dpopup" id={id} open={open} anchor={popupAnchor}>
          <PopupBody translate="no">
            <div className="popup-section">
              {Object.entries(editableTimes).length > 0 && (
                <div>
                  <p>Изменить время</p>
                  <ul className="change-time">
                    {Object.entries(editableTimes).map(([timeKey, time]) => (
                      <li key={uuidv4()}>
                        <TimePicker
                          onChange={(times) =>
                            updateEditableTime(timeKey, times)
                          }
                          defaultValue={dayjs(time)}
                        />
                        <IconButton
                          type="button"
                          onClick={() => removeTime(time)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </li>
                    ))}
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

            <Button aria-describedby={id} type="button" onClick={cancel}>
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
                        <div key={uuidv4()}>
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
