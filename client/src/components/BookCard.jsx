import { Link } from 'react-router-dom'

function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {book.genre && (
        <span className="mb-3 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          {book.genre.name}
        </span>
      )}
      <h3 className="text-lg font-semibold leading-snug">{book.title}</h3>
      <p className="mt-1 text-stone-600">by {book.author}</p>
      <p className="mt-auto pt-4 text-sm text-stone-500">
        {book.totalCopies} {book.totalCopies === 1 ? 'copy' : 'copies'}
      </p>
    </Link>
  )
}

export default BookCard
