// import {
//   AnyToolSchemaLike,
//   FromSchemaLike,
// } from "bee-agent-framework/internals/helpers/schema";
// // app/api/agent/MongoInsertTool.ts
// import {
//   BaseToolRunOptions,
//   JSONToolOutput,
//   Tool,
// } from "bee-agent-framework/tools/base";

// import { GetRunContext } from "bee-agent-framework/context";
// import db from "./db";

// // Assuming Tool is the base class for creating tools in BeeAgent
// // Import your db connection logic

// export class MongoInsertTool extends Tool {
//   name!:  "MongoInsertTool1";
//   description!: "A tool for inserting posts into MongoDB";
//   inputSchema(): Promise<AnyToolSchemaLike> | AnyToolSchemaLike {
//     return {
//       type: "array",
//       items: {
//         type: "object",
//         properties: {
//           title: { type: "string" },
//           description: { type: "string" },
//           postTime: { type: "string", format: "date-time" },
//           author: { type: "string" },
//         },
//         required: ["title", "description", "postTime", "author"],
//       },
//     };
//   }
//   protected async _run(
//     arg: FromSchemaLike<Awaited<ReturnType<this["inputSchema"]>>>,
//     options: BaseToolRunOptions | undefined,
//     run: GetRunContext<this, any>
//   ): Promise<JSONToolOutput> {
//     try {
//       // Ensure that posts are in the right format
//       const posts = arg; // arg is the posts passed to the tool

//       // Perform the MongoDB insertion using db connection
//       const collection = db.getDb().collection("articles"); // Replace with your actual collection name
//       const result = await collection.insertMany(posts);

//       console.log(`${result.insertedCount} posts were inserted into MongoDB`);

//       // Return the result
//       return {
//         output: result.insertedCount, // Return the count of inserted posts
//         success: true,
//       };
//     } catch (err) {
//       console.error("Error inserting posts into MongoDB:", err);
//       return {
//         output: null,
//         success: false,
//         error: "Failed to insert posts into MongoDB", // Error message
//       };
//     }
//     throw new Error("Method not implemented.");
//   }

//   // Method to insert posts into MongoDB
//   async execute(posts: any[]) {
//     try {
//       const collection = db.getDb().collection("articles"); // Replace with your actual collection name
//       const result = await collection.insertMany(posts);
//       console.log(`${result.insertedCount} posts were inserted into MongoDB`);
//       return result;
//     } catch (err) {
//       console.error("Error inserting posts into MongoDB:", err);
//       return null;
//     }
//   }
// }

import { DynamicTool, StringToolOutput } from "bee-agent-framework/tools/base";

import db from "./db"; // Assuming you have a `db` module to handle MongoDB connections
import { z } from "zod";

// Define the DynamicTool to insert data into MongoDB
const MongoInsertTool = new DynamicTool({
  name: "MongoInsertTool",
  description: "Takes input data with title, author, description, postedDate, and additional details, and inserts the data into the MongoDB collection 'content_store.articles' when given the prompt: store in database, resulting in the data being stored successfully.",
  inputSchema: z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    postedDate: z.string(), // Ensure this is in ISO date format (yyyy-mm-ddThh:mm:ss)
    additionaldetails: z.record(z.string()), // Allows for any additional key-value pairs
  }),
  async handler(input) {
    const { title, author, description, postedDate, additionaldetails } = input;

    try {
      // Prepare the article data in the format you need
      const article = {
        title,
        author,
        description,
        postedDate: new Date(postedDate), // Ensure the postedDate is in Date format
        additionaldetails,
      };

      // Get the MongoDB collection for articles
      const collection = db.getDb().collection("articles");

      // Insert the article into MongoDB
      const result = await collection.insertOne(article);

      // Return a success message
      return new StringToolOutput(`Article inserted successfully with ID: ${result.insertedId}`);
    } catch (error) {
      console.error("Error inserting article into MongoDB:", error);
      return new StringToolOutput("Failed to insert article into MongoDB");
    }
  },
});

export default MongoInsertTool;
