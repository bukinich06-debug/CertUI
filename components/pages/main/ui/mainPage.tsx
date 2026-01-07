"use client";

import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { Cards } from "../cards";
import { EditCardModal } from "../edit-card-modal";
import { Header } from "../header";
import { CardDto } from "../types";

export const MainPage: FC = () => {
  const router = useRouter();
  const [cards, setCards] = useState<CardDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);

  const handleCardClick = (id: number) => {
    router.push(`/certs?cardId=${id}`);
  };

  const handleCardEdit = (card: CardDto) => {
    setSelectedCard(card);
  };

  const handleSaveCard = (updated: CardDto) => {
    setCards((prev) =>
      prev.map((card) => {
        const sameCard = card.id.toString() === updated.id.toString();
        return sameCard ? { ...card, ...updated } : card;
      }),
    );
    setSelectedCard(null);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/card", { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data: CardDto[] = await res.json();
        if (isMounted) setCards(data);
      } catch (e) {
        if (isMounted) setError("Не удалось загрузить карточки. Попробуйте позже.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Header />

      <Cards
        cards={cards}
        isLoading={isLoading}
        error={error}
        onCardClick={handleCardClick}
        onEditClick={handleCardEdit}
      />

      <EditCardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onSave={handleSaveCard}
      />
    </section>
  );
};
