import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import * as DTO from "../dto";
import "./Schedule.css";
import {
  timestampToSpecificTimeZoneAndFormat,
  timestampToSpecificTimeZoneAndReadable,
} from "../utils";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

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
}: {
  availableDates: number[];
  approvedRequests: DTO.IRequest[];
  bookedRequests: DTO.IRequest[];
  cancelRequest: (request: DTO.IRequest) => void;
}) {
  return (
    <div>
      <BookedRequests bookedRequests={bookedRequests} />
      <ApprovedRequests
        approvedRequests={approvedRequests}
        cancelRequest={cancelRequest}
      />
      <AvailableDates availableDates={availableDates} />
    </div>
  );
}

function ApprovedRequests({
  approvedRequests,
  cancelRequest,
}: {
  cancelRequest: (request: DTO.IRequest) => void;
  approvedRequests: DTO.IRequest[];
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
                        <span>{request.username}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram fullname: </span>{" "}
                        <span>{request.userFullName}</span>
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
  bookedRequests,
}: {
  bookedRequests: DTO.IRequest[];
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
                        <span>{request.username}</span>
                      </Typography>
                      <Typography fontSize={16} variant="h6" component="div">
                        <span className="label">Telegram fullname: </span>{" "}
                        <span>{request.userFullName}</span>
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
