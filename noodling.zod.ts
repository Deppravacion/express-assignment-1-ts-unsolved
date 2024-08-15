import { z } from "zod";
console.log('message: "hello"');
const personInput = {
  name: "timmy",
  // age: 21,
} as any;

// const personSchema = z
//   .object({
//     // firstname: z.string({
//     name: z.string({
//       errorMap: (err) => ({
//         message: "Name is required and must be a string",
//       }),
//     }),
//     age: z.number(),
//   })
//   .partial();
// const personSchema = z.object({
//   name: z.string().refine((val) => val.length > 0, {
//     message: "Name is required and must be a string",
//   }),
//   age: z.number(),
// });
const personSchema = z.object({
  name: z.string({
    errorMap: (issue, _ctx) => {
      return {
        message: "Name is required and must be a string",
      };
    },
  }),
  age: z.number({
    errorMap: (issue, _ctx) => {
      return {
        message: "Age is required and must be a number",
      };
    },
  }),
});

// console.log(personSchema.parse(personInput));

//** an alternate way of calling the schema**//
const data = personSchema.safeParse(personInput);
console.log(data.success ? data.data : data.error); // success & error are apart of 'safeParse'

// the errorMap message is not being shown using the "safeParse" method
// currently trying to understand what bug that is related to.
