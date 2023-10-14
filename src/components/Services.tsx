import * as React from "react";
import axios from "axios";
import * as DTO from "../dto";
import { IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import "./Service.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type INewServiceForm = Record<"key" | "name", string>;

export default function Services() {
  const [services, setServices] = React.useState<DTO.IService[]>([]);

  React.useEffect(() => {
    try {
      axios
        .get<DTO.IService[]>(
          "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/services"
        )
        .then(({ data }) => setServices(data));
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  const saveUpdatedServices = async () => {
    try {
      await axios.post(
        "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/api/services",
        {
          services,
        }
      );
    } catch (error) {
      console.error("error", error);
    }
  };

  const formHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedServices = services.map((service) => {
      if (service.key === e.target.name) {
        return {
          ...service,
          name: e.target.value,
        };
      }
      return service;
    });
    setServices(updatedServices);
  };

  const removeService = (key: string) => {
    const newServices = services.filter((value) => value.key !== key);
    setServices(newServices);
  };

  return (
    <div className="main-wrapper">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography component="div">
            <h4>Редактировать услуги</h4>
          </Typography>
        </AccordionSummary>
        <form
          className="service-form"
          onSubmit={(e) => {
            e.preventDefault();
            saveUpdatedServices();
          }}
        >
          <ul className="service-list">
            {services.map((value) => (
              <li key={value.key}>
                <TextField
                  name={value.key}
                  id="outlined-basic"
                  label="Название услуги + стоимость"
                  placeholder="Введите название услуги и её стоимость"
                  variant="outlined"
                  defaultValue={value.name}
                  onChange={formHandler}
                ></TextField>

                <IconButton
                  aria-label="delete"
                  onClick={() => removeService(value.key)}
                >
                  <DeleteIcon />
                </IconButton>
              </li>
            ))}
          </ul>
          <NewServiceForm
            services={services}
            callback={(newService: DTO.IService) => {
              setServices([...services, newService]);
              //   updateForm({ ...form, [newService.key]: newService.name });
            }}
          />
          <Button type="submit" variant="outlined">
            Сохранить
          </Button>
        </form>
      </Accordion>
    </div>
  );
}

function NewServiceForm({
  services,
  callback,
}: {
  services: DTO.IService[];
  callback: (newService: DTO.IService) => void;
}) {
  const [newServiceForm, updateNewServiceForm] =
    React.useState<INewServiceForm>({ key: "", name: "" });

  const addNewService = () => {
    const key = newServiceForm.key;
    const name = newServiceForm.name;

    if (!key) {
      alert("Заполни поле id");
      return;
    }
    if (!name) {
      alert("Заполни поле название услуги");
      return;
    }
    const isUniqueId = services.every((value) => value.key !== key);
    if (isUniqueId === false) {
      alert("Услуга с таким id уже существует, введи другой");
      return;
    }

    const newService = {
      key: key.trim(),
      name: name.trim(),
    } as DTO.IService;

    updateNewServiceForm({ key: "", name: "" });
    callback(newService);
  };

  return (
    <div className="new-service">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography fontSize={14}>Добавить новую услугу</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="new-service-controls">
            <div className="new-service-control">
              <label htmlFor="new-service-input">
                Введи id услуги (english, 3-5 символов)
              </label>
              <input
                className="new-service-input"
                name="сервис id"
                value={newServiceForm.key}
                onChange={(e) =>
                  updateNewServiceForm({
                    ...newServiceForm,
                    key: e.target.value.trim(),
                  })
                }
              />
            </div>

            <div className="new-service-control">
              <label htmlFor="new-service-input">
                Введи название услуги + стоимость
              </label>
              <input
                className="new-service-input"
                name="название услуги"
                value={newServiceForm.name}
                onChange={(e) =>
                  updateNewServiceForm({
                    ...newServiceForm,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <IconButton aria-label="add" onClick={addNewService}>
              <AddIcon />
            </IconButton>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
