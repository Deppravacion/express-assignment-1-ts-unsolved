import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

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

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000; // this is the original line o code

// const port = 3001; // the test line
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
