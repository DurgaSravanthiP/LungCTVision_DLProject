import { Link } from 'react-router-dom'
import Button from './Button'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm text-white">
            LS
          </span>
          LungScope AI
        </Link>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="px-3">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary">Sign up</Button>
              </Link>
            </>
          ) : (
            <Link to="/diagnosis">
              <Button>Start Diagnosis</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
