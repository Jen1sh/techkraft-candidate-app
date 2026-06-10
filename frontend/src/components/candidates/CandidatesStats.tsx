interface Props {
  total?: number
}

export default function CandidatesStats({ total }: Props) {
  return (
    <div className="stats shadow w-full">
      <div className="stat">
        <div className="stat-title">Total Candidates</div>
        <div className="stat-value">{total ?? "—"}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Reviewed</div>
        <div className="stat-value">8</div>
      </div>
      <div className="stat">
        <div className="stat-title">Hired</div>
        <div className="stat-value">3</div>
      </div>
      <div className="stat">
        <div className="stat-title">Rejected</div>
        <div className="stat-value">2</div>
      </div>
    </div>
  )
}
