import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BookDetail from './pages/BookDetail.jsx'

function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link to="/" className="text-xl font-bold">
            🐘 Ndovu Library
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="*"
            element={
              <p>
                Page not found.{' '}
                <Link to="/" className="text-emerald-700 underline">
                  Back to the catalog
                </Link>
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
