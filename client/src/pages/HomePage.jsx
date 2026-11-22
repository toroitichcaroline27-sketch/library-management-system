import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import BookGrid from '../components/BookGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'

const API = import.meta.env.VITE_API_URL

function HomePage() {
  // Shared filter state lives here, in the lowest common parent of
  // SearchBar, the genre filter and BookGrid ("lifting state up").
  const [search, setSearch] = useState('')
  const [genreId, setGenreId] = useState('')
  const [page, setPage] = useState(1)
  const [genres, setGenres] = useState([])

  // Load the genres once, to fill the filter dropdown.
  useEffect(() => {
    axios
      .get(`${API}/genres`)
      .then((res) => setGenres(res.data))
      .catch((err) => console.error(err))
  }, [])

  // Any change to the filters sends the user back to page 1.
  // useCallback keeps this function the same between renders, so
  // SearchBar's effect does not restart its timer needlessly.
  const handleSearch = useCallback((value) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleGenreChange = (e) => {
    setGenreId(e.target.value)
    setPage(1)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Browse the catalog</h1>
      <p className="mt-1 text-stone-600">
        Search by title or author, or filter by genre.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar onSearch={handleSearch} />

        <select
          value={genreId}
          onChange={handleGenreChange}
          aria-label="Filter by genre"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 sm:w-64"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        <BookGrid
          search={search}
          genreId={genreId}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

export default HomePage
