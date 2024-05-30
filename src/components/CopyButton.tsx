"use client"
import { Check, Copy, CopyCheck } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton = ({ textToCopy }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="copy-button text-xs">
      {isCopied ? <Check className="text-green-400 font-bold w-4 h-4" /> : <Copy className="text-white w-4 h-4" />}
    </button>
  );
};

export default CopyButton;

