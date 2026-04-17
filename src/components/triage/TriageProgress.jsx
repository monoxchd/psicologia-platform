export default function TriageProgress({ current, total }) {
  const percent = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between text-xs text-gray-500 mb-1.5"
        aria-live="polite"
      >
        <span>Pergunta {current} de {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
