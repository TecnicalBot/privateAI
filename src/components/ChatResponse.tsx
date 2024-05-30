import { cn } from '@/lib/utils';
import { Ellipsis } from "lucide-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import CopyButton from "./CopyButton";

interface ChatResponseProps {
  messages: { message: string, isUserMessage: boolean }[];
  loading: boolean;
}

const ChatResponse = ({ messages, loading }: ChatResponseProps) => {

  return (
    <div className="flex-1 flex-grow">
      {messages.map((message, i) => (
        <ul key={i} className=''>
          <div className={cn("flex items-end", {
            "justify-end": message.isUserMessage,
          })}>
            <div className={cn("", {
              'items-end': message.isUserMessage,
              'items-start': !message.isUserMessage,
            })}>
              <li className={cn("px-4 py-2 rounded-lg ", {
                "bg-zinc-700/50 text-white": message.isUserMessage,
                "bg-transparent text-white": !message.isUserMessage,
              })}>
                <Markdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code(props) {
                      const { children, className, node, ...rest } = props
                      const match = /language-(\w+)/.exec(className || "")
                      return match ? (
                        <div className='flex'>
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            style={dark}
                            classname="scrollbar-none"
                            wrapLines
                            wrapLongLines
                          />
                          <span className='relative top-4 right-6'>
                            <CopyButton textToCopy={String(children)} />
                          </span>
                        </div>
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.message}
                </Markdown>
              </li>
            </div>
          </div>
        </ul>
      ))}
      {loading && (
        <div className="text-left text-white">
          <div className="inline-block p-2">
            <Ellipsis />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatResponse;
