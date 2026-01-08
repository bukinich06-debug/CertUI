import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minRows = 4, ...props }, ref) => (
    <textarea
      rows={minRows}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export default Textarea;
