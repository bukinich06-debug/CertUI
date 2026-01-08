import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { FC } from "react";

interface IProps {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}

export const Field: FC<IProps> = ({ label, value, mono, multiline = false }: IProps) => {
  if (multiline) {
    return (
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
        <Textarea
          readOnly
          value={value}
          className={`bg-muted/60 text-sm text-foreground ${mono ? "font-mono" : ""}`}
          minRows={5}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input
        readOnly
        value={value}
        className={`h-10 bg-muted/60 text-sm text-foreground ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
};
