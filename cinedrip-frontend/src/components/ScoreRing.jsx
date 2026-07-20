export default function ScoreRing({ score }) {
  const color =
    score >= 80 ? 'text-green-400' : score >= 60 ? 'text-purple-400' : 'text-gray-400';

  return (
    <div className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
      <span className={`text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
}
