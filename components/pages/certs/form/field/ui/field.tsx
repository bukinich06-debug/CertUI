import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { FC } from "react";

interface IProps {
  label: string;
  value: string;
  mono?: boolean;
}

export const Field: FC<IProps> = ({ label, value, mono }: IProps) => (
  <div className="space-y-1">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    <Input
      readOnly
      value={value}
      className={`h-10 bg-muted/60 text-sm text-foreground ${mono ? "font-mono" : ""}`}
    />
  </div>
);
