"use client"
import { FormEvent, useState, useRef, useEffect } from "react";
import ChatInput from "@/components/ChatInput";
import ChatResponse from "@/components/ChatResponse";

const Chat = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ message: string, isUserMessage: boolean }[]>([]);
  const [isStreaming, setStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePromptSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setMessages(prevMessages => [...prevMessages, { message: currentPrompt, isUserMessage: true }]);
    setPrompt("");
    setLoading(true);
    setStreaming(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch("/api/chat-with-pdf", {
        method: "POST",
        body: JSON.stringify(currentPrompt),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        console.log("Something went wrong!");
        setLoading(false);
      } else {
        setLoading(false);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseData = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          responseData += decoder.decode(value, { stream: true });
          setMessages(prevMessages => {
            if (prevMessages[prevMessages.length - 1]?.isUserMessage) {
              return [...prevMessages, { message: responseData, isUserMessage: false }];
            } else {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1].message = responseData;
              return updatedMessages;
            }
          });
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log(error);
      }
      abortControllerRef.current = null;
      setLoading(false);
    } finally {
      setStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      setLoading(false);
    }
  };


  return (
    <div ref={chatContainerRef} className="flex flex-col h-full w-full overflow-y-auto scrollbar-none max-w-4xl mx-auto">
      <ChatResponse messages={messages} loading={loading} />
      <ChatInput
        prompt={prompt}
        isStreaming={isStreaming}
        setPrompt={setPrompt}
        handlePromptSubmit={handlePromptSubmit}
        stopStreaming={stopStreaming}
      />
    </div>
  );
}

export default Chat
