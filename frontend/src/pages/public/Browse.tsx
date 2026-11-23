
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { itemsService } from '../../services/itemsService'
import ItemCard from '../../components/items/ItemCard'
import type { Item } from '../../types'

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('q') || ''
  )
  const [category, setCategory] = useState('all')
  const [area, setArea] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    let isMounted = true

    const fetchItems = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await itemsService.getAll()

        if (isMounted) {
          setItems(Array.isArray(response.data) ? response.data : [])
        }
      } catch (err) {
        console.error('Failed to load items:', err)

        if (isMounted) {
          setError('We couldn’t load the found items. Check your connection and try again.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchItems()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(
    () => [...new Set(items.map(item => item.category))].sort(),
    [items]
  )

  const areas = useMemo(
    () => [...new Set(items.map(item => item.locationFound))].sort(),
    [items]
  )

  const filteredItems = useMemo(() => {
    const today = new Date()

    return items
      .filter(item =>
        ['in_store', 'claim_pending', 'approved'].includes(item.status)
      )
      .filter(item => {
        const query = searchQuery.trim().toLowerCase()

        const matchesSearch =
          !query ||
          item.publicDescription.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.locationFound.toLowerCase().includes(query)

        const matchesCategory =
          category === 'all' || item.category === category

        const matchesArea =
          area === 'all' || item.locationFound === area

        const foundDate = new Date(item.dateFound)
        const daysOld =
          (today.getTime() - foundDate.getTime()) /
          (1000 * 60 * 60 * 24)

        const matchesDate =
          dateRange === 'all' ||
          (dateRange === '7' && daysOld <= 7 && daysOld >= 0) ||
          (dateRange === '30' && daysOld <= 30 && daysOld >= 0)

        return (
          matchesSearch &&
          matchesCategory &&
          matchesArea &&
          matchesDate
        )
      })
      .sort(
        (a, b) =>
          new Date(b.dateFound).getTime() -
          new Date(a.dateFound).getTime()
      )
  }, [items, searchQuery, category, area, dateRange])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()

    if (query) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('all')
    setArea('all')
    setDateRange('all')
    setSearchParams({})
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">

        {/* Page heading */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            Lost & Found
          </p>

          <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
            Find your familiar.
          </h1>

          <p className="mt-3 text-gray-600">
            Browse items handed in to campus security.
          </p>
        </section>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search by item or category"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />

          <button
            type="submit"
            className="rounded-lg bg-navy px-7 py-3 font-semibold text-white transition hover:bg-navy-dark"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-navy"
          >
            <option value="all">All categories</option>
            {categories.map(itemCategory => (
              <option key={itemCategory} value={itemCategory}>
                {itemCategory}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={event => setDateRange(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-navy"
          >
            <option value="all">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>

          <select
            value={area}
            onChange={event => setArea(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-navy"
          >
            <option value="all">All areas</option>
            {areas.map(itemArea => (
              <option key={itemArea} value={itemArea}>
                {itemArea}
              </option>
            ))}
          </select>

        </section>

        {/* Item count and sorting */}
        <section className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-navy">
            {filteredItems.length} found items
          </p>

          <span className="text-sm text-gray-500">
            Newest first
          </span>
        </section>

        {/* Items */}
        <section className="mt-5">
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <p className="text-gray-600">
                Getting things ready… Please wait.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 font-semibold text-navy hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-navy">
                No matching items found.
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or clearing your filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 font-semibold text-navy hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Report a lost item banner */}
        <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-xl bg-navy p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="text-2xl font-bold">
              Can’t see what you lost?
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              Post a lost report. You can track it from your account.
            </p>
          </div>

          <Link
            to="/report"
            className="shrink-0 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-navy transition hover:bg-amber-400"
          >
            Report a lost item
          </Link>
        </section>

        {/* Privacy information */}
        <section className="mt-6 rounded-lg border border-gray-200 bg-white px-6 py-5">
          <h2 className="font-semibold text-navy">
            Enough to recognise. Not enough to impersonate.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Serial numbers, unique marks, and proof of ownership are never
            displayed on public listings.
          </p>
        </section>

      </div>
    </main>
  )
}
