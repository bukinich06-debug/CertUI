"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, LogIn, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getDialogContent } from "../helpers/getDialogContent";
import { CodeAccessVariant } from "../types";

type Iprops = {
  variant: CodeAccessVariant;
  fallbackHref?: string;
};

const getIcon = (variant: CodeAccessVariant) => {
  switch (variant) {
    case "auth":
      return <LogIn className="h-5 w-5" />;
    case "forbidden":
      return <ShieldOff className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

export const CodeAccessDialog = ({ variant, fallbackHref = "/main" }: Iprops) => {
  const router = useRouter();

  const { title, description, primaryAction, secondaryAction } = getDialogContent(
    variant,
    fallbackHref,
  );

  const icon = getIcon(variant);

  const navigate = (href: string) => {
    router.replace(href);
  };

  const handleClose = () => {
    navigate(secondaryAction?.href ?? primaryAction.href ?? fallbackHref);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Dialog open onOpenChange={(open) => (!open ? handleClose() : null)}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              {icon}
              <DialogTitle className="text-xl">{title}</DialogTitle>
            </div>

            <DialogDescription className="text-base leading-relaxed text-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {secondaryAction && (
              <Button
                type="button"
                variant={secondaryAction.variant ?? "outline"}
                onClick={() => navigate(secondaryAction.href)}
              >
                {secondaryAction.label}
              </Button>
            )}

            <Button type="button" onClick={() => navigate(primaryAction.href)}>
              {primaryAction.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
