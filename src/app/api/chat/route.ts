import { streamResponse } from "@/lib/streamResponse";
import ollama from "ollama";

export async function POST(req: Request) {
  try {

    const prompt = await req.json()

    const response = await ollama.generate({
      model: "tinyllama",
      prompt: prompt,
      stream: true,
    });
    
    const stream = streamResponse(response)
    return new Response(stream);
  } catch (error) {
    console.log(error)
    return new Response("Something went wrong!", {
      status: 500,
    })
  }
}


