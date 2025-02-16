// app/api/agent/route.ts
import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { GoogleSearchTool } from "bee-agent-framework/tools/search/googleSearch";
import { GroqChatLLM } from "bee-agent-framework/adapters/groq/chat";
import  MongoInsertTool  from "./MongoInsertTool";
import { NextResponse } from "next/server";
import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
import { TokenMemory } from "bee-agent-framework/memory/tokenMemory";
import db from "./db";

// Attempt to connect to MongoDB
async function connectDb() {
  try {
    await db.connect();
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

connectDb().catch(err => {
  console.error("Failed to initialize DB connection:", err);
  process.exit(1);  // If connection fails during startup, exit the process
});

// Initialize agent
const llm = new GroqChatLLM({
  modelId: "deepseek-r1-distill-qwen-32b",
});

const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [new GoogleSearchTool(), new OpenMeteoTool(),  MongoInsertTool],
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const updates: any[] = [];
    const response = await agent.run({ prompt }).observe((emitter) => {
      emitter.on("update", async ({ data, update, meta }) => {
        updates.push({
          type: update.key,
          content: update.value,
        });
      });
    });
    console.log("response", response);
    console.log("updates", updates);
    // After fetching the posts, prepare them for MongoDB insertion
    // const posts = response.result.text.map((update) => {
    //   return {
    //     title: update.content.title,
    //     description: update.content.snippet,
    //     postTime: update.content.published_date,
    //     author: update.content.author,
    //   };
    // });

    // Insert posts into MongoDB using the MongoDBInsertTool
    // await new MongoInsertTool().execute(JSON.parse(response.result.text)).then(() => {
    //   console.log("Saved to db");
    // });

    return NextResponse.json({
      result: response.result.text,
      updates,
    });
  } catch (error) {
    console.error("Error during agent execution:", error);
    return NextResponse.json(
      { error: "Failed to process agent request" },
      { status: 500 }
    );
  }
}
