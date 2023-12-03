import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import * as DTO from "../dto";
import "./Schedule.css";
import { timestampToSpecificTimeZoneAndReadable } from "../utils";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  styled,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Unstable_Popup as Popup } from "@mui/base/Unstable_Popup";

import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

enum SortByField {
  DATE = "date",
  USER_NAME = "username",
  USER_FULL_NAME = "userFullName",
}

const SortByDisplayName = {
  [SortByField.DATE]: "Date",
  [SortByField.USER_NAME]: "User Name",
  [SortByField.USER_FULL_NAME]: "User Full Name",
};
enum SortOrder {
  ASC,
  DESC,
}

function getTelegramUsernameLink(username: string) {
  return `https://t.me/${username}`;
}

function sortList<TList, TSortBy>(
  list: TList[],
  sortBy: TSortBy,
  order = SortOrder.ASC
) {
  return list.sort((a, b) => {
    const valueA = a[sortBy as keyof typeof a];
    const valueB = b[sortBy as keyof typeof b];

    let comparison = 0;

    if (typeof valueA === "string") {
      comparison = valueA.localeCompare(valueB as string);
    } else {
      comparison = (valueA as number) - (valueB as number);
    }

    return order === SortOrder.ASC ? comparison : -comparison;
  });
}

export default function Schedule({
  availableDates,
  approvedRequests,
  bookedRequests,
  cancelRequest,
  services,
  changeRequestDate,
}: {
  availableDates: number[];
  approvedRequests: DTO.IRequest[];
  bookedRequests: DTO.IRequest[];
  cancelRequest: (request: DTO.IRequest) => void;
  services: DTO.IService[];
  changeRequestDate: (request: DTO.IUpdatedRequest) => void;
}) {
  const servicesMap = services.reduce<Record<string, string>>(
    (acc, service) => ({ ...acc, [service.key]: service.name }),
    {}
  );
  return (
    <div>
      <BookedRequests
        servicesMap={servicesMap}
        bookedRequests={bookedRequests}
      />
      <ApprovedRequests
        servicesMap={servicesMap}
        approvedRequests={approvedRequests}
        cancelRequest={cancelRequest}
        changeRequestDate={changeRequestDate}
      />
      <AvailableDates availableDates={availableDates} />
    </div>
  );
}

function ApprovedRequests({
  servicesMap,
  approvedRequests,
  cancelRequest,
  changeRequestDate,
}: {
  servicesMap: Record<string, string>;
  cancelRequest: (request: DTO.IRequest) => void;
  changeRequestDate: (request: DTO.IUpdatedRequest) => void;
  approvedRequests: DTO.IRequest[];
}) {
  const [sortBy, changeSortBy] = React.useState(SortByField.DATE);
  const [sortOrder, changeSortOrder] = React.useState(SortOrder.ASC);
  const [popupAnchor, setPopupAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [requestToUpdate, setRequestToUpdate] =
    React.useState<DTO.IRequest | null>(null);

  const open = Boolean(popupAnchor);
  const id = open ? "simple-popper" : undefined;

  const togglePopup = (event: React.MouseEvent<HTMLElement>) => {
    setPopupAnchor(popupAnchor ? null : event.currentTarget);
  };

  const cancelEditMode = () => {
    setRequestToUpdate(null);
  };

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography component="div">
            <h4>Подтвержденные записи</h4>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Sorting
            sortBy={sortBy}
            changeSortBy={changeSortBy}
            sortOrder={sortOrder}
            changeSortOrder={changeSortOrder}
          />
          <ul>
            {approvedRequests.length === 0 ? (
              <span>Нет подтвержденных записей</span>
            ) : (
              sortList(approvedRequests, sortBy, sortOrder).map(
                (request, index) => (
                  <li className="date-item" key={request.date + index}>
                    <div>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Дата: </span>
                        <span>
                          {timestampToSpecificTimeZoneAndReadable(request.date)}
                        </span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram username: </span>{" "}
                        {request.username != null ? (
                          <a
                            className="link"
                            target="_blank"
                            href={getTelegramUsernameLink(request.username)}
                            rel="noreferrer"
                          >
                            {request.username}
                          </a>
                        ) : (
                          <span>У пользователя отсутсвует username</span>
                        )}
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram fullname: </span>{" "}
                        <span>{request.userFullName}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Выбранная услуга: </span>{" "}
                        <span>{servicesMap[request.serviceType]}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">
                          Введенная пользователем информация:
                        </span>
                        <span>{request.userCustomData}</span>
                      </Typography>
                    </div>
                    <div className="resolution-controls">
                      <Button
                        aria-describedby={String(request.date)}
                        aria-label="add"
                        variant="contained"
                        onClick={(event) => {
                          togglePopup(event);
                          setRequestToUpdate(request);
                        }}
                      >
                        Изменить дату записи
                      </Button>
                      {requestToUpdate && (
                        <UpdateDate
                          changeRequestDate={changeRequestDate}
                          id={id}
                          open={open}
                          popupAnchor={popupAnchor}
                          request={requestToUpdate}
                          togglePopup={togglePopup}
                          cancelEditMode={cancelEditMode}
                        />
                      )}

                      <Button
                        aria-label="add"
                        variant="contained"
                        onClick={() => cancelRequest(request)}
                      >
                        Отменить запись
                      </Button>
                    </div>
                  </li>
                )
              )
            )}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function BookedRequests({
  servicesMap,
  bookedRequests,
}: {
  bookedRequests: DTO.IRequest[];
  servicesMap: Record<string, string>;
}) {
  const [sortBy, changeSortBy] = React.useState(SortByField.DATE);
  const [sortOrder, changeSortOrder] = React.useState(SortOrder.ASC);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography component="div">
            <h4>Неподтвержденные запросы на запись</h4>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Sorting
            sortBy={sortBy}
            changeSortBy={changeSortBy}
            sortOrder={sortOrder}
            changeSortOrder={changeSortOrder}
          />
          <ul>
            {bookedRequests.length === 0 ? (
              <span>Нет неподтвержденных запросов на запись</span>
            ) : (
              sortList(bookedRequests, sortBy, sortOrder).map(
                (request, index) => (
                  <li className="date-item" key={request.date + index}>
                    <div>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Дата: </span>
                        <span>
                          {timestampToSpecificTimeZoneAndReadable(request.date)}
                        </span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram username: </span>{" "}
                        {request.username != null ? (
                          <a
                            className="link"
                            target="_blank"
                            href={getTelegramUsernameLink(request.username)}
                            rel="noreferrer"
                          >
                            {request.username}
                          </a>
                        ) : (
                          <span>У пользователя отсутсвует username</span>
                        )}
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram fullname: </span>{" "}
                        <span>{request.userFullName}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Выбранная услуга: </span>{" "}
                        <span>{servicesMap[request.serviceType]}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">
                          Введенная пользователем информация:
                        </span>
                        <span>{request.userCustomData}</span>
                      </Typography>
                    </div>
                  </li>
                )
              )
            )}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function AvailableDates({ availableDates }: { availableDates: number[] }) {
  const [sortOrder, changeSortOrder] = React.useState(SortOrder.ASC);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography component="div">
            <h4>Свободные даты</h4>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Порядок сортировки
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={sortOrder}
              label="Age"
              onChange={(event) => {
                changeSortOrder(event.target.value as SortOrder);
              }}
            >
              {[SortOrder[SortOrder.ASC], SortOrder[SortOrder.DESC]].map(
                (value) => (
                  <MenuItem
                    key={value}
                    value={SortOrder[value as keyof typeof SortOrder]}
                  >
                    {value}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <ul>
            {availableDates.length === 0 ? (
              <p>Нет свободных дат, добавь новые</p>
            ) : (
              availableDates
                .sort((a, b) => (sortOrder === SortOrder.ASC ? a - b : b - a))
                .map((value, index) => (
                  <li key={value}>
                    {timestampToSpecificTimeZoneAndReadable(value)}
                  </li>
                ))
            )}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function Sorting({
  sortBy,
  changeSortBy,
  sortOrder,
  changeSortOrder,
}: {
  sortBy: SortByField;
  changeSortBy: React.Dispatch<React.SetStateAction<SortByField>>;
  sortOrder: SortOrder;
  changeSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
}) {
  return (
    <div className="sorting">
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Сортировать по:</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={sortBy}
          label="Age"
          onChange={(event) => {
            changeSortBy(event.target.value as SortByField);
          }}
        >
          {Object.values(SortByField).map((value) => (
            <MenuItem key={value} value={value}>
              {SortByDisplayName[value]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">
          Порядок сортировки
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={sortOrder}
          label="Age"
          onChange={(event) => {
            changeSortOrder(event.target.value as SortOrder);
          }}
        >
          {[SortOrder[SortOrder.ASC], SortOrder[SortOrder.DESC]].map(
            (value) => (
              <MenuItem
                key={value}
                value={SortOrder[value as keyof typeof SortOrder]}
              >
                {value}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>
    </div>
  );
}

function UpdateDate({
  changeRequestDate,
  togglePopup,
  id,
  open,
  popupAnchor,
  request,
  cancelEditMode,
}: {
  changeRequestDate: (request: DTO.IUpdatedRequest) => void;
  togglePopup: (event: React.MouseEvent<HTMLElement>) => void;
  id: string | undefined;
  open: boolean;
  popupAnchor: HTMLElement | null;
  request: DTO.IRequest;
  cancelEditMode: () => void;
}) {
  const [updatedDate, setValue] = React.useState<Dayjs | null>(
    dayjs(request.date)
  );
  const [updatedTime, setUpdatedTime] = React.useState<Dayjs | null>(null);

  const updateEditableTime = (time: dayjs.Dayjs | null) => {
    if (time == null) {
      return;
    }
    setUpdatedTime(time);
  };

  const saveUpdatedDate = (request: DTO.IRequest) => {
    if (updatedTime == null || updatedDate == null) {
      return;
    }

    const time = dayjs(updatedTime);
    const hours = time.hour();
    const minutes = time.minute();
    const seconds = time.second();

    const dateToUpdate = updatedDate
      .hour(hours)
      .minute(minutes)
      .second(seconds)
      .millisecond(0);

    changeRequestDate({ ...request, updatedDate: +dateToUpdate });
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Popup className="dpopup" id={id} open={open} anchor={popupAnchor}>
          <PopupBody translate="no">
            <DemoContainer components={["DatePicker", "DatePicker"]}>
              <DatePicker
                label="Controlled picker"
                value={updatedDate}
                onChange={(newValue) => setValue(newValue)}
              />
            </DemoContainer>
            <div className="popup-section">
              <TimePicker
                onChange={(times) => updateEditableTime(times)}
                defaultValue={dayjs(request.date)}
              />
            </div>

            <Button
              aria-describedby={id}
              type="button"
              onClick={(event) => {
                togglePopup(event);
                cancelEditMode();
              }}
            >
              Отменить
            </Button>
            <Button
              disabled={!updatedDate || !updatedTime}
              aria-describedby={id}
              type="button"
              onClick={(event) => {
                saveUpdatedDate(request);
                togglePopup(event);
              }}
            >
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
