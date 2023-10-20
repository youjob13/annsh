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
          <ul>
            {approvedRequests.length === 0 ? (
              <span>Нет подтвержденных записей</span>
            ) : (
              approvedRequests.map((request, index) => (
                <li className="date-item" key={request.requestId + index}>
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
              ))
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
          <ul>
            {bookedRequests.length === 0 ? (
              <span>Нет неподтвержденных запросов на запись</span>
            ) : (
              bookedRequests.map((request, index) => (
                <li className="date-item" key={request.requestId + index}>
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
              ))
            )}
          </ul>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

function AvailableDates({ availableDates }: { availableDates: number[] }) {
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
          <ul>
            {availableDates.length === 0 ? (
              <p>Нет свободных дат, добавь новые</p>
            ) : (
              availableDates.map((value, index) => (
                <li key={index}>
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
