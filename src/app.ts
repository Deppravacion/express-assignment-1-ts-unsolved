import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { stringify } from "querystring";

const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200);
});

//### Get (/dogs) Index endpoint
app.get("/dogs", async (_req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

// Show Endpoint
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(404).send(" No Dog - No Content");
  }
  return res.json(dog).status(200);
});

//### Delete Endpoint

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "the ID should be a number." });
  }
  const dog = await prisma.dog.findUnique({
    where: { id },
  });
  if (dog === null) {
    return res.status(204).send({
      message: " Could not find a dog with that ID",
    });
  }
  await prisma.dog.delete({
    where: { id },
  });
  return res.json(dog).status(200);
});

//### Create Endpoint

const errorAgeCheck = (
  age: number | string | null | undefined
) => {
  if (typeof age !== "number") {
    return "AGE should be a number";
  }
  return null;
};

const errorNameCheck = (
  name: number | string | null | undefined
) => {
  if (typeof name !== "string") {
    return " NAME should be a string";
  }
  return null;
};

const errorBreedCheck = (
  breed: number | string | null | undefined
) => {
  if (typeof breed !== "string") {
    return "BREED should be a string";
  }
  return null;
};

const errorDescriptionCheck = (
  description: number | string | null | undefined
) => {
  if (typeof description !== "string") {
    return "DESCRIPTION should be a string";
  }
};

app.post("/dogs", async (req, res) => {
  const { name, age, breed, description } = req.body;
  const ageError = errorAgeCheck(age);
  const nameError = errorNameCheck(name);
  const breedError = errorBreedCheck(breed);
  const descriptionError =
    errorDescriptionCheck(description);

  const properties = [
    "name",
    "age",
    "breed",
    "description",
  ];
  const invalidProperties = [];
  for (const property in req.body) {
    if (!properties.includes(property)) {
      invalidProperties.push(property);
    }
  }

  if (invalidProperties.length > 0) {
    return res.status(400).send({
      errors: invalidProperties.map(
        (key) => `"${key}" is not a valid key.`
      ),
    });
  }

  const errors = [];

  if (ageError !== null) {
    errors.push(ageError);
  }
  if (breedError !== null) {
    errors.push(breedError);
  }
  if (nameError !== null) {
    errors.push(nameError);
  }
  if (descriptionError !== null) {
    errors.push(descriptionError);
  }

  try {
    const createDog = await prisma.dog.create({
      data: {
        name,
        age,
        breed,
        description,
      },
    });
    res.status(201).send(createDog);
  } catch (error) {}
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
