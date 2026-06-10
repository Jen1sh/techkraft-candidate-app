import { useState, useCallback, useMemo } from "react"
import { Toaster } from "sonner"
import { useAuthContext } from "@/context/AuthContext"
import { useLogout } from "@/hooks/useAuth"
import { useCandidates } from "@/hooks/useCandidates"
import { useEventStream } from "@/hooks/useEventStream"
import CandidatesStats from "@/components/candidates/CandidatesStats"
import CandidatesTable from "@/components/candidates/CandidatesTable"

function App() {
  useEventStream()
  const { user } = useAuthContext()
  const logout = useLogout()

  const [statusFilter, setStatusFilter] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [keywordFilter, setKeywordFilter] = useState("")
  const [limit, setLimit] = useState(20)

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCandidates({
    status: statusFilter || undefined,
    skill: skillFilter || undefined,
    keyword: keywordFilter || undefined,
    limit,
  })

  const candidates = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordFilter(e.target.value)
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="navbar bg-base-200 shadow-sm">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl">TechCraft</a>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost flex items-center gap-2">
              <div className="avatar placeholder">
                <div className="w-8 rounded-full bg-primary text-primary-content text-sm font-semibold flex items-center justify-center">
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <span className="hidden sm:inline">{user?.name}</span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li className="menu-label text-xs opacity-50 px-3 py-1">{user?.email}</li>
              <li><button onClick={logout} className="text-error">Sign out</button></li>
            </ul>
          </div>
        </div>
      </div>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <CandidatesStats />

        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <select
            className="select select-bordered w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <label className="input w-full sm:max-w-44">
            <span className="text-xs opacity-50">#</span>
            <input
              type="text"
              className="grow"
              placeholder="Skill…"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </label>
          <label className="input w-full sm:max-w-xs">
            <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              className="grow"
              placeholder="Search name or email…"
              value={keywordFilter}
              onChange={handleSearchChange}
            />
          </label>
          <select
            className="select select-bordered w-full sm:w-32"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <CandidatesTable
          candidates={candidates}
          isLoading={isLoading}
          isError={isError}
          role={user?.role ?? null}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </main>

      <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-8 mt-8">
        <aside>
          <p>TechCraft Candidate Score &copy; {new Date().getFullYear()}</p>
        </aside>
      </footer>
    </>
  )
}

export default App
