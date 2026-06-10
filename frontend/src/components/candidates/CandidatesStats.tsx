import { useCandidateStats } from "@/hooks/useCandidates"

export default function CandidatesStats() {
  const { data, isPending, isError } = useCandidateStats()

  const cardClass = "stat"

  if (isPending) {
    return (
      <div className="stats shadow w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cardClass}>
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="stats shadow w-full">
        <div className={cardClass}>
          <div className="stat-title">Total Candidates</div>
          <div className="stat-value">—</div>
        </div>
        <div className={cardClass}>
          <div className="stat-title">Reviewed</div>
          <div className="stat-value">—</div>
        </div>
        <div className={cardClass}>
          <div className="stat-title">Hired</div>
          <div className="stat-value">—</div>
        </div>
        <div className={cardClass}>
          <div className="stat-title">Rejected</div>
          <div className="stat-value">—</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stats shadow w-full">
      <div className={cardClass}>
        <div className="stat-title">Total Candidates</div>
        <div className="stat-value">{data.total}</div>
      </div>
      <div className={cardClass}>
        <div className="stat-title">Reviewed</div>
        <div className="stat-value">{data.reviewed}</div>
      </div>
      <div className={cardClass}>
        <div className="stat-title">Hired</div>
        <div className="stat-value">{data.hired}</div>
      </div>
      <div className={cardClass}>
        <div className="stat-title">Rejected</div>
        <div className="stat-value">{data.rejected}</div>
      </div>
    </div>
  )
}
