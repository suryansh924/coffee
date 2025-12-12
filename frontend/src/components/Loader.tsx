import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: number;
  text?: string;
}

export const Loader = ({ className = "", size = 24, text }: LoaderProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Loader2 className="animate-spin text-primary" size={size} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const PageLoader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader size={48} text={text} />
    </div>
  );
};
