import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { makeRequest } from "@/lib/makeRequest";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CardDto } from "../../types";

interface IProps {
  card: CardDto | null;
  onClose: () => void;
  onSave: (updated: CardDto) => void;
}

type EditCardForm = {
  name: string;
};

export const EditCardModal = ({ card, onClose, onSave }: IProps) => {
  const form = useForm<EditCardForm>({
    defaultValues: { name: "" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    form.reset({ name: card?.name ?? "" });
  }, [card, form]);

  if (!card) return null;

  const handleSubmit = async (values: EditCardForm) => {
    if (!card) return;
    const nextName = values.name.trim() || card.name;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await makeRequest("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, name: nextName }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? `Request failed: ${res.status}`);

      onSave({
        ...card,
        id: Number(payload?.id ?? card.id),
        name: payload?.name ?? nextName,
      });
    } catch (e) {
      setSubmitError("Не удалось сохранить. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(card)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Редактирование карточки</DialogTitle>
          <DialogDescription>Измените данные и сохраните.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Название обязательно" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Название карточки" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
