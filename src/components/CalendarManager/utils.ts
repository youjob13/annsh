import dayjs from "dayjs";
import * as DTO from "../../dto";
import { DateObject } from "react-multi-date-picker";
import { HTMLAttributes } from "react";

type Args = {
  date: DateObject;
  selectedDate: DateObject | DateObject[];
  currentMonth: object;
  isSameDate(arg1: DateObject, arg2: DateObject): boolean;
};

type FuncReturnType =
  | (HTMLAttributes<HTMLSpanElement> & {
      disabled?: boolean;
      hidden?: boolean;
    })
  | void;

export const highlightDateCannotBeRemoved = (
  groupedTimeByDateKey: DTO.DateTimes,
  day: Args,
  shouldDisable = true
): FuncReturnType => {
  const nonAvailableDates = Object.values(
    groupedTimeByDateKey.nonAvailableDates
  ).flat();
  if (
    nonAvailableDates.some((date) =>
      dayjs(date).isSame(dayjs(day.date.toDate()), "day")
    )
  ) {
    return {
      disabled: shouldDisable,
      style: {
        backgroundColor: "brown",
        color: "white",
        pointerEvents: "none",
      },
    };
  }
  return {};
};

export const extractGroupedTimeByDateKey = (
  dates: DTO.DateTimes["availableDates"] | DTO.DateTimes["nonAvailableDates"],
  type: DTO.DateType
) => {
  return Object.entries(dates).map(([dateKey, times]) => {
    return [dateKey, times.sort(), type];
  });
};

export const isTimeNotSelectedForDate = (
  groupedDatesByStatus: Record<DTO.AvailabilityStatus, number[]>
) => {
  return (
    groupedDatesByStatus[DTO.AvailabilityStatus.IS_AVAILABLE].length === 0 &&
    groupedDatesByStatus[DTO.AvailabilityStatus.IS_NON_AVAILABLE].length === 0
  );
};

export const groupTimeByDateKey = (
  availableDates: number[],
  nonAvailableDates: number[]
) => {
  const groupedAvailableDatesByDateKey = availableDates.reduce<
    DTO.DateTimes["availableDates"]
  >((acc, date) => {
    const dateKey = dayjs(date).format("MM/DD/YYYY");

    if (acc[dateKey] != null) {
      acc[dateKey].push(date);
    } else {
      acc[dateKey] = [date];
    }
    return acc;
  }, {});

  const groupedNonAvailableDatesByDateKey = nonAvailableDates.reduce<
    DTO.DateTimes["nonAvailableDates"]
  >((acc, date) => {
    const dateKey = dayjs(date).format("MM/DD/YYYY");

    if (acc[dateKey] != null) {
      acc[dateKey].push(date);
    } else {
      acc[dateKey] = [date];
    }
    return acc;
  }, {});

  const groupedTimesByDateKey: DTO.DateTimes = {
    availableDates: groupedAvailableDatesByDateKey,
    nonAvailableDates: groupedNonAvailableDatesByDateKey,
  };

  return groupedTimesByDateKey;
};
