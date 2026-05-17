import { MultiplayerGame } from "@/components/game/MultiplayerGame";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  return <MultiplayerGame matchId={matchId} />;
}
