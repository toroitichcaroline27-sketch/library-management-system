import { useEffect, useState } from 'react'
import axios from 'axios'
import BookCard from './BookCard.jsx'

const API = import.meta.env.VITE_API_URL
const PAGE_SIZE = 12

function BookGrid({ search, genreId, page, onPageChange }) {
  const [books, setBooks] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0) // bumped by "Try again"

  // Refetch whenever the search text, genre, page or retry counter changes.
  useEffect(() => {
    let ignore = false // ignore answers that arrive after a newer request
    setLoading(true)
    setError(null)

    axios
      .get(`${API}/books`, {
        params: {
          search: search || undefined,
          genreId: genreId || undefined,
          page,
          limit: PAGE_SIZE,
        },
      })
      .then((res) => {
        if (ignore) return
        // The API answers { data: [...books], meta: { total, page, ... } }
        setBooks(res.data.data)
        setMeta(res.data.meta)
      })
      .catch((err) => {
        if (ignore) return
        console.error(err)
        setError(
          'We could not load the books. Check that the server is running, then try again.',
        )
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [search, genreId, page, attempt])

  if (loading) {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading books"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-stone-200 bg-stone-200"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error}</p>
        <button
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
        <p className="text-lg font-medium">No books found</p>
        <p className="mt-1">Try a different search or choose another genre.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">
        {meta.total} {meta.total === 1 ? 'book' : 'books'} found
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= meta.totalPages}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default BookGrid
