import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface Option {
  id: string;
  label: string;
  value: string;
}

interface ProfileOptionsWidgetProps {
  question_id: string;
  prompt: string;
  options: Option[];
  allow_multiple: boolean;
  onSelect: (label: string, value: string) => void;
  onClose: () => void;
}

export const ProfileOptionsWidget: React.FC<ProfileOptionsWidgetProps> = ({
  prompt,
  options,
  onSelect,
  onClose,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t rounded-t-xl shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-muted/20 rounded-t-xl">
        <h3 className="font-medium text-sm text-muted-foreground">
          Ella is asking...
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-center">{prompt}</h2>

        <div className="flex flex-wrap gap-3 justify-center">
          {options.map((opt) => (
            <Button
              key={opt.id}
              variant="outline"
              size="lg"
              className="rounded-full px-6 border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-all"
              onClick={() => onSelect(opt.label, opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
