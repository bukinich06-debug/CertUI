import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { CardDto } from "../../types";
import { CardStats } from "./cardStats";

interface IProps {
  error: string | null;
  isLoading: boolean;
  cards: CardDto[];
  onCardClick: (id: number) => void;
  onEditClick: (card: CardDto) => void;
}

export const Cards = ({ error, isLoading, cards, onCardClick, onEditClick }: IProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cards.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-primary/80">Карточек пока нет</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="relative flex h-full flex-col cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => onCardClick(card.id)}
          role="button"
          tabIndex={0}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onEditClick(card);
            }}
            aria-label="Редактировать карточку"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">{card.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 pt-0">
            <CardStats stats={card.stats} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
