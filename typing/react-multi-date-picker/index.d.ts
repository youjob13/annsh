import { HTMLAttributes } from "react";
// import "react-multi-date-picker"; // Adjust the import path based on your actual library
import { DateObject, CalendarProps } from "react-multi-date-picker";

declare module "react-multi-date-picker" {
  interface CalendarProps {
    // @ts-ignore
    mapDays(object: {
      date: DateObject;
      selectedDate: DateObject | DateObject[];
      currentMonth: object;
      isSameDate(arg1: DateObject, arg2: DateObject): boolean;
    }):
      | (HTMLAttributes<HTMLSpanElement> & {
          disabled: boolean;
          hidden: boolean;
        })
      | void;
  }
}
