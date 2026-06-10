import { Toaster } from "sonner"
import { useAuthContext } from "@/context/AuthContext"
import { useLogout } from "@/hooks/useAuth"

function App() {
  const { user } = useAuthContext()
  const logout = useLogout()

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
                <div className="w-8 rounded-full bg-primary text-primary-content text-sm font-semibold">
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

      <div className="hero bg-base-100 min-h-[60vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Candidate Score</h1>
            <p className="py-6">
              Evaluate, track, and manage candidate scores with ease.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Candidates</div>
            <div className="stat-value">15</div>
          </div>
          <div className="stat">
            <div className="stat-title">Reviewed</div>
            <div className="stat-value">8</div>
          </div>
          <div className="stat">
            <div className="stat-title">Hired</div>
            <div className="stat-value">3</div>
            <div className="stat-desc">20% hire rate</div>
          </div>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alice Johnson</td>
                <td>Software Engineer</td>
                <td><span className="badge badge-ghost">New</span></td>
                <td>Python, FastAPI, SQL</td>
              </tr>
              <tr>
                <td>Bob Smith</td>
                <td>Frontend Developer</td>
                <td><span className="badge badge-info">Reviewed</span></td>
                <td>React, TypeScript, CSS</td>
              </tr>
              <tr>
                <td>Carol Williams</td>
                <td>Data Scientist</td>
                <td><span className="badge badge-success">Hired</span></td>
                <td>Python, ML, SQL</td>
              </tr>
            </tbody>
          </table>
        </div>
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
