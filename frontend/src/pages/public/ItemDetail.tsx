
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { itemsService } from '../../services/itemsService'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import type { Item } from '../../types'

function formatDate(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchItem = async () => {
      const itemId = Number(id)

      if (!id || !Number.isInteger(itemId) || itemId <= 0) {
        setError('The item reference is invalid.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await itemsService.getById(itemId)

        if (isMounted) {
          setItem(response.data)
        }
      } catch (err) {
        console.error('Failed to load item:', err)

        if (isMounted) {
          setError(
            'We couldn’t load this item. It may have been removed or there may be a connection problem.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchItem()

    return () => {
      isMounted = false
    }
  }, [id])

  const canClaim = user?.role === 'student' || user?.role === 'staff'
  const isSignedIn = Boolean(user)

  const claimPath = item ? `/items/${item.id}/claim` : '/auth/sign-in'

  const referenceLabel = item
    ? item.reference.toUpperCase().startsWith('ITEM ')
      ? item.reference
      : `ITEM ${item.reference}`
    : ''

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-600">Loading item details…</p>
        </div>
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/items"
            className="font-medium text-navy hover:underline"
          >
            ← Back to found items
          </Link>

          <div className="mt-8 rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
            <h1 className="text-xl font-bold text-navy">
              Unable to display this item.
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              {error || 'This item could not be found.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">

        {/* Back link */}
        <Link
          to="/items"
          className="text-sm font-medium text-navy hover:underline"
        >
          ← Back to found items
        </Link>

        {/* Item details */}
        <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Item image and description */}
          <div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.publicDescription}
                  className="h-80 w-full object-cover sm:h-96"
                />
              ) : (
                <div className="flex h-80 items-center justify-center bg-gray-100 text-sm text-gray-500 sm:h-96">
                  No image available
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={item.status} />

                <span className="text-xs font-semibold tracking-wide text-gray-500">
                  {referenceLabel}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-navy">
                {item.publicDescription}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {item.category}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 border-y border-gray-200 py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Date found
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy">
                    {formatDate(item.dateFound)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Location found
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy">
                    {item.locationFound}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-navy">
                  About this item
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {item.publicDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Claim and privacy information */}
          <div className="space-y-6">

            {item.status === 'in_store' && (
              <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                <h2 className="text-xl font-bold text-navy">
                  Looks like yours?
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Submit a claim with details only you would know. A guard
                  will check them before approving collection.
                </p>

                {canClaim ? (
                  <Link
                    to={claimPath}
                    className="mt-6 block rounded-lg bg-amber-500 px-6 py-3 text-center font-semibold text-navy transition hover:bg-amber-400"
                  >
                    Claim this item
                  </Link>
                ) : !isSignedIn ? (
                  <>
                    <Link
                      to="/auth/sign-in"
                      className="mt-6 block rounded-lg bg-amber-500 px-6 py-3 text-center font-semibold text-navy transition hover:bg-amber-400"
                    >
                      Claim this item
                    </Link>

                    <p className="mt-3 text-center text-xs text-gray-500">
                      Sign in to submit and track your claim.
                    </p>
                  </>
                ) : (
                  <p className="mt-5 text-sm text-gray-500">
                    Claims can only be submitted by students and staff.
                  </p>
                )}
              </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-bold text-navy">
                Your proof stays private.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Serial numbers and unique marks are shared only with the team
                verifying your claim.
              </p>
            </section>

          </div>
        </section>

        {/* What happens next */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-navy">
            What happens next?
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-amber-600">01</p>
              <h3 className="mt-2 font-bold text-navy">
                Share your proof
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Describe identifying details privately.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-amber-600">02</p>
              <h3 className="mt-2 font-bold text-navy">
                Wait for approval
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                The guard reviews your claim.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-amber-600">03</p>
              <h3 className="mt-2 font-bold text-navy">
                Sign and collect
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Bring your ID and sign at the desk.
              </p>
            </div>
          </div>
        </section>

        {/* Collection information */}
        <section className="mt-14 rounded-xl bg-navy p-7 text-white sm:p-9">
          <h2 className="text-xl font-bold">
            Collection is in person.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-gray-200">
            Lost & found office · Strathmore University, Madaraka. Ask
            campus security for the exact desk location and current
            opening hours.
          </p>
        </section>

      </div>
    </main>
  )
}
