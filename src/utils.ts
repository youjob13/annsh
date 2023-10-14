import { DateTime } from "luxon";

export const timestampToSpecificTimeZone = (timestamp: number) => {
  return DateTime.fromMillis(timestamp, {
    zone: "Europe/Berlin",
  }).toMillis();
};

export const timestampToSpecificTimeZoneAndFormat = (timestamp: number) => {
  return DateTime.fromJSDate(new Date(timestamp), {
    zone: "Europe/Berlin",
  }).toFormat("yyyy-LL-dd HH:mm");
};

export const timestampToSpecificTimeZoneAndReadable = (timestamp: number) => {
  return DateTime.fromJSDate(new Date(timestamp), {
    zone: "Europe/Berlin",
  }).toFormat("ccc dd.LL.yyyy HH:mm");
};
