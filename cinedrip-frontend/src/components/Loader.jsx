export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base">
      <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin" />
      <p className="mt-4 text-sm text-gray-400">finding your drip...</p>
    </div>
  );
}
