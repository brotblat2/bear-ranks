export type RankRequest = {
  id: string;
  user_email: string;
  item_1: string;
  item_2: string;
  item_3: string;
  status: "pending" | "answered";
  route: "live" | "email";
  ranking_order: number[] | null;
  email_fallback_sent: boolean;
  created_at: string;
  answered_at: string | null;
};

export function rankedItems(request: RankRequest): string[] {
  const items = [request.item_1, request.item_2, request.item_3];
  return (request.ranking_order || []).map((position) => items[position - 1]);
}
