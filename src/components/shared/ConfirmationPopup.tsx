import { Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import React from "react";
import * as DTO from "../../dto";

import "./ConfirmationPopup.css";

export function ConfirmationPopup({
  popupIsOpen,
  toggleState,
  requestToCancel,
  apply,
  cancel,
}: {
  requestToCancel: DTO.IRequest | null;
  toggleState: (state: boolean) => void;
  apply: () => void;
  popupIsOpen: boolean;
  cancel: () => void;
}) {
  return (
    <React.Fragment>
      <Dialog
        open={popupIsOpen}
        onClose={() => {
          toggleState(false);
          cancel();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="title">
          Вы точно хотите отменить запись для {requestToCancel?.userFullName}?
        </DialogTitle>
        {/* <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent> */}
        <DialogActions className="controls">
          <Button
            onClick={() => {
              toggleState(false);
              apply();
            }}
          >
            Да
          </Button>
          <Button
            onClick={() => {
              toggleState(false);
              cancel();
            }}
            autoFocus
          >
            Нет
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
