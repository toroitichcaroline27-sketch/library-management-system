import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function BookDetail() {
  const { id } = useParams() // the :id segment of /books/:id
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)

    axios
      .get(`${API}/books/${id}`)
      .then((res) => {
        if (!ignore) setBook(res.data)
      })
      .catch((err) => {
        if (ignore) return
        console.error(err)
        setError(
          err.response?.status === 404
            ? 'This book could not be found.'
            : 'We could not load this book. Please try again.',
        )
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id])

  const backLink = (
    <Link to="/" className="text-emerald-700 underline">
      ← Back to the catalog
    </Link>
  )

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading book">
        <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-stone-200" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          {error}
        </p>
        <p className="mt-4">{backLink}</p>
      </div>
    )
  }

  return (
    <article>
      <p>{backLink}</p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        {book.genre && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            {book.genre.name}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-bold">{book.title}</h1>
        <p className="mt-1 text-lg text-stone-600">by {book.author}</p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-stone-500">ISBN</dt>
            <dd className="font-medium">{book.isbn}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Copies in the library</dt>
            <dd className="font-medium">{book.totalCopies}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Added to the catalog</dt>
            <dd className="font-medium">
              {new Date(book.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default BookDetail
