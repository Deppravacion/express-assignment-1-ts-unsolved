import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200);
});

//### Get (/dogs) Index endpoint
app.get(
  "/dogs",
  validateRequest({
    params: z
      .object({
        id: z.string(),
      })
      .strict()
      .partial(),
  }),
  async (_req, res) => {
    const dogs = await prisma.dog.findMany();
    res.status(200).send(dogs);
  }
);

// Show Endpoint
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(204).send();
  }
  return res.status(200).json(dog);
});

//### Delete Endpoint

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
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

//### Error Checking
function errorCheckAge(age: number) {
  if (typeof age !== "number") {
    return "age should be a number";
  }
  return null;
}

function errorCheckName(name: string) {
  if (typeof name !== "string") {
    return "name should be a string";
  }
  return null;
}

function errorCheckBreed(breed: string) {
  if (typeof breed !== "string") {
    return "breed should be a string";
  }
  return null;
}

function errorCheckDescription(description: string) {
  if (typeof description !== "string") {
    return "description should be a string";
  }
  return null;
}

//## CREATE Endpoint
app.post(
  "/dogs",
  validateRequest({
    body: z.object({
      name: z.string(),
      age: z.number(),
      breed: z.string(),
      description: z.string(),
    }),
  }),
  async (req, res) => {
    console.log("Received request:", req.body);

    const { name, age, breed, description } = req.body;
    const ageError = errorCheckAge(age);
    const nameError = errorCheckName(name);
    const breedError = errorCheckBreed(breed);
    const descriptionError =
      errorCheckDescription(description);

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
      return res.status(400).send({
        errors: invalidProperties.map(
          (key) => `'${key}' is not a valid key`
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

    if (errors.length > 0) {
      return res.status(400).send({ errors });
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
      res.status(201).send(createDog);
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .send({ error: "Internal Server Error" });
    }
  }
);

//### Update Endpoint

app.patch("/dogs/:id", async (req, res) => {
  const body = req.body;
  const id = +req?.params?.id;
  const name = req?.body?.name;
  const age = req?.body?.age;
  const description = req?.body?.description;
  const breed = req?.body?.breed;

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
    return res.status(400).send({
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
    return res.status(201).json(updatedDog);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
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
