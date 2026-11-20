
import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import type { Item } from '../../types'

interface ItemCardProps {
  item: Item
  compact?: boolean
}

export default function ItemCard({
  item,
  compact = false,
}: ItemCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md ${
        compact ? 'flex items-center gap-4' : ''
      }`}
    >
      {/* Item image */}
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-gray-100 ${
          compact ? 'h-24 w-24 rounded-lg' : 'h-44 w-full'
        }`}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.publicDescription}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-3xl" aria-hidden="true">
              📦
            </span>
            <span className="mt-1 text-xs">No image available</span>
          </div>
        )}
      </div>

      {/* Item information */}
      <div className={`min-w-0 flex-1 ${compact ? 'p-3' : 'p-4'}`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {item.category}
        </span>

        <h3
          className={`mt-1 font-semibold text-navy ${
            compact ? 'line-clamp-2 text-sm' : 'text-base'
          }`}
        >
          {item.publicDescription}
        </h3>

        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">
            Found {item.dateFound}
          </p>

          <p className="text-sm text-gray-500">
            <span aria-hidden="true">📍</span> {item.locationFound}
          </p>
        </div>

        <div
          className={`mt-3 flex items-center justify-between gap-2 ${
            compact ? 'flex-wrap' : ''
          }`}
        >
          <StatusBadge status={item.status} />

          <Link
            to={`/items/${item.id}`}
            className="shrink-0 text-sm font-semibold text-navy hover:underline"
          >
            View item →
          </Link>
        </div>
      </div>
    </article>
  )
}
