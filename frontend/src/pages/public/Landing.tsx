
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { itemsService } from '../../services/itemsService'
import ItemCard from '../../components/items/ItemCard'
import type { Item } from '../../types'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [recentItems, setRecentItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  // Logged-in users land on their own workspace, not the stranger-facing page.
  useEffect(() => {
    if (!user) return

    switch (user.role) {
      case 'student':
      case 'staff':
        navigate('/dashboard', { replace: true })
        break
      case 'guard':
        navigate('/guard', { replace: true })
        break
      case 'admin':
        navigate('/admin', { replace: true })
        break
    }
  }, [user, navigate])

  useEffect(() => {
    let isMounted = true

    const fetchRecentItems = async () => {
      try {
        const response = await itemsService.getAll()

        if (!isMounted) return

        const items: Item[] = Array.isArray(response.data)
          ? response.data
          : []

        const latestItems = items
          .filter((item) => item.status === 'in_store')
          .sort(
            (a, b) =>
              new Date(b.dateFound).getTime() -
              new Date(a.dateFound).getTime()
          )
          .slice(0, 3)

        setRecentItems(latestItems)
      } catch (error) {
        console.error('Unable to fetch recent items:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRecentItems()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    navigate(
      `/items?q=${encodeURIComponent(searchQuery.trim())}`
    )
  }

  return (
    <main className="bg-gray-50">

      {/* HERO SECTION */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-amber-brand">
              STRATHMORE UNIVERSITY / LOST &amp; FOUND
            </p>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
              Lost something on campus? Find it fast.
            </h1>

            <h2 className="mt-5 text-xl font-semibold text-navy-light sm:text-2xl">
              Your campus. Your things. Back together.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
              Search what’s been handed in, tell us what’s missing,
              and collect it safely from the lost &amp; found desk.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search items, e.g. backpack"
                aria-label="Search lost items"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
              />

              <button
                type="submit"
                className="rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-light"
              >
                Search lost items
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/report"
                className="rounded-lg bg-amber-brand px-6 py-3 font-semibold text-white transition hover:brightness-95"
              >
                Report a lost item
              </Link>

              <p className="text-sm text-gray-500">
                Only public details. Your personal information stays private.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-brand/10 text-2xl">
              ✓
            </div>

            <h3 className="text-xl font-bold text-navy">
              In safe hands
            </h3>

            <p className="mt-3 text-gray-600">
              Logged. Stored. Ready to return.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <h2 className="text-center text-3xl font-bold text-navy">
            Everything you need to get it back.
          </h2>

          <p className="mt-3 text-center text-gray-600">
            One system for the whole campus, from the first search to the final handover.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              to="/items"
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-navy"
            >
              <h3 className="text-lg font-bold text-navy">
                Browse found items
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Search everything handed in to campus security by category,
                date, or location.
              </p>
            </Link>

            <Link
              to="/report"
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-navy"
            >
              <h3 className="text-lg font-bold text-navy">
                Report a loss
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Tell us what went missing so you can track it from your
                account as soon as it turns up.
              </p>
            </Link>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-navy">
                Private verification
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Prove an item is yours with details only you would know.
                Nothing private is ever shown publicly.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-navy">
                Guard-checked handover
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Every collection is checked in person, with ID verification
                and a signature on file.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* THREE STEPS SECTION */}
      <section className="border-y border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <h2 className="text-center text-3xl font-bold text-navy">
            From lost to found, in three steps.
          </h2>

          <p className="mt-3 text-center">
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              See how it works in detail →
            </Link>
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-3">

            <div>
              <span className="text-3xl font-extrabold text-amber-brand">
                01
              </span>

              <h3 className="mt-3 text-xl font-bold text-navy">
                Report
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Tell us what you lost or search items already handed in.
              </p>
            </div>

            <div>
              <span className="text-3xl font-extrabold text-amber-brand">
                02
              </span>

              <h3 className="mt-3 text-xl font-bold text-navy">
                Match
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Spot a match? Share private details so the guard can verify it.
              </p>
            </div>

            <div>
              <span className="text-3xl font-extrabold text-amber-brand">
                03
              </span>

              <h3 className="mt-3 text-xl font-bold text-navy">
                Collect
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Once approved, bring your ID, sign, and collect at the desk.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* RECENTLY HANDED IN SECTION */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <h2 className="text-3xl font-bold text-navy">
                Recently handed in
              </h2>

              <p className="mt-3 text-gray-600">
                A familiar item might be waiting for you.
              </p>
            </div>

            <Link
              to="/items"
              className="font-semibold text-navy transition hover:underline"
            >
              View all found items →
            </Link>

          </div>

          {loading ? (
            <p className="mt-8 text-gray-500">
              Loading recently handed-in items...
            </p>
          ) : recentItems.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-gray-500">
              No items are currently available to display. Check back soon.
            </p>
          )}

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="border-y border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-brand">
              About Patapotea
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy">
              Built for Strathmore, by people who lose things too.
            </h2>

            <p className="mt-5 leading-relaxed text-gray-600">
              Patapotea is Strathmore University's lost and found system,
              connecting students and staff who have lost something with
              campus security, who log every item that gets handed in.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="font-semibold text-navy">
                Privacy by design
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Only enough detail to recognise an item is ever shown
                publicly. Proof of ownership stays private.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="font-semibold text-navy">
                A clear record
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Every claim, approval, and handover is logged, so nothing
                gets returned to the wrong person.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* OFFICE INFORMATION BANNER */}
      <section className="bg-navy px-6 py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-2xl font-bold text-white">
              A real desk. A friendly face.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="font-semibold text-white">
              Lost &amp; found office · Strathmore University, Madaraka
            </p>

            <p className="mt-3 leading-relaxed text-gray-300">
              Ask campus security for the exact desk location and current
              opening hours before visiting.
            </p>
          </div>

        </div>
      </section>

    </main>
  )
}
