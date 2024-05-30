import { FormEvent } from "react";
import { Button } from "./ui/button";
import TextareaAutosize from 'react-textarea-autosize';
import { CircleStop, SendHorizonal } from "lucide-react";

interface ChatInputProps {
  prompt: string;
  isStreaming: boolean;
  setPrompt: (prompt: string) => void;
  handlePromptSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  stopStreaming: () => void;
}

const ChatInput = ({ prompt, isStreaming, setPrompt, handlePromptSubmit, stopStreaming }: ChatInputProps) => {
  return (
    <form onSubmit={handlePromptSubmit} className="flex items-end my-4 p-2 w-full bg-zinc-700/75 rounded-3xl text-white">
      <TextareaAutosize
        rows={1}
        maxRows={16}
        value={prompt}
        autoFocus
        placeholder="Ask me anything..."
        onChange={e => setPrompt(e.target.value)}
        className="flex-1 mr-2 min-h-10 w-full outline-none border-none py-2 px-4 resize-none bg-transparent max-h-48 scrollbar-none"
      />
      {isStreaming ? (
        <Button type="button" onClick={stopStreaming} className="bg-transparent hover:bg-transparent">
          <CircleStop className="text-white" />
        </Button>
      ) : (
        <Button type="submit" className="bg-transparent hover:bg-transparent">
          <SendHorizonal className="text-white" />
        </Button>
      )}
    </form>
  );
};

export default ChatInput;

