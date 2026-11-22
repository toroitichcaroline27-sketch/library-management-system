import { useEffect, useState } from 'react'

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  // Debounce: wait 400ms after the last keystroke before reporting the
  // query. The cleanup function cancels the previous timer every time
  // `query` changes, so only a pause in typing lets a timer finish.
  useEffect(() => {
    const timer = setTimeout(() => onSearch(query.trim()), 400)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <input
      type="search"
      placeholder="Search by title or author..."
      aria-label="Search books"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2"
    />
  )
}

export default SearchBar
