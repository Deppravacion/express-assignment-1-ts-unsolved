import express from "express";
import { prisma } from "../prisma/prisma-instance";
import {
  errorHandleMiddleware,
  validateReqId,
} from "./error-handler";
import "express-async-errors";
import HttpStatusCode from "./status-codes";

const {
  OK,
  CREATED,
  NO_CONTENT,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = HttpStatusCode;

const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(OK);
});

//### Get (/dogs) Index endpoint
app.get("/dogs", async (_req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(OK).send(dogs);
});

// Show Endpoint
app.get("/dogs/:id", validateReqId, async (req, res) => {
  const id = +req.params.id;
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.sendStatus(NO_CONTENT);
  }
  return res.status(OK).json(dog);
});

//### Delete Endpoint

app.delete("/dogs/:id", validateReqId, async (req, res) => {
  const id = +req.params.id;
  await prisma.dog
    .delete({
      where: { id },
    })
    .then((dog) => {
      return res.json(dog).status(OK);
    })
    .catch(() => {
      return res.sendStatus(NO_CONTENT);
    });
});

//### Error Checking

function errorcheckProperties(
  age: string,
  name: string,
  breed: string,
  description: string
) {
  const errors = [];
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof breed !== "string") {
    errors.push("breed should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }
  return errors;
}

//## CREATE Endpoint
app.post("/dogs", async (req, res) => {
  const { name, age, breed, description } = req.body;

  const validProperties = [
    "name",
    "age",
    "breed",
    "description",
  ];
  const invalidProperties = [];

  for (const key in req.body) {
    if (!validProperties.includes(key)) {
      invalidProperties.push(key);
    }
  }

  if (invalidProperties.length > 0) {
    return res.status(BAD_REQUEST).send({
      errors: invalidProperties.map(
        (key) => `'${key}' is not a valid key`
      ),
    });
  }

  const errors = errorcheckProperties(
    age,
    name,
    breed,
    description
  );

  if (errors.length > 0) {
    return res.status(BAD_REQUEST).send({ errors });
  }

  try {
    const dogData = {
      name,
      age,
      breed,
      description,
    };

    const createDog = await prisma.dog.create({
      data: dogData,
    });
    res.status(CREATED).send(createDog);
  } catch (error) {
    console.error("Database error:", error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .send({ error: "Internal Server Error" });
  }
});

//### Update Endpoint

app.patch("/dogs/:id", validateReqId, async (req, res) => {
  const { name, age, breed, description } = req.body;
  const id = +req?.params?.id;
  const validProperties = [
    "name",
    "age",
    "breed",
    "description",
  ];
  const invalidProperties = [];

  for (const key in req.body) {
    if (!validProperties.includes(key)) {
      invalidProperties.push(key);
    }
  }

  if (invalidProperties.length > 0) {
    return res.status(BAD_REQUEST).send({
      errors: invalidProperties.map(
        (key) => `'${key}' is not a valid key`
      ),
    });
  }

  try {
    const updatedDog = await prisma.dog.update({
      where: { id },
      data: { name, age, breed, description },
    });
    return res.status(CREATED).json(updatedDog);
  } catch (error) {
    console.error(error);
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ error: "Database Error" });
  }
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000; // this is the original line o code

// const port = 3001; // the test line
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
