import { streamResponse } from "@/lib/streamResponse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import path from "path";

export async function POST(req: Request) {
    const currentWD = process.cwd()
    const dataDir = path.join(currentWD, "/src/data")
    try {
        const userPrompt = await req.json()
        const model = new Ollama({
            model: "tinyllama",
            temperature: 0,
        });
        const embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
    
        });
        const loader = new DirectoryLoader(
            dataDir,
            {
                ".pdf": (path) => new PDFLoader(path),
            }
        );
    
        const docs = await loader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 20,
        });
        const splits = await textSplitter.splitDocuments(docs);
        const vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings)
        const retriever = vectorStore.asRetriever();
        const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        ----------------
        {context}`;
        const messages = [
            SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
            HumanMessagePromptTemplate.fromTemplate("{question}"),
        ];
        const prompt = ChatPromptTemplate.fromMessages(messages);
        const chain = RunnableSequence.from([
            {
                context: retriever.pipe(formatDocumentsAsString),
                question: new RunnablePassthrough(),
            },
            prompt,
            model,
            new StringOutputParser(),
        ]);
    
        const response = await chain.stream(userPrompt)
        const stream = streamResponse(response)
        return new Response(stream);
    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong")
    }
}