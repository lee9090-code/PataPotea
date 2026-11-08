// Used on Browse page and Landing "Recently handed in" section
// Props: item (Item type), compact? (smaller card for landing page)
// See design: Page 1 and Page 11 of patapotea.pdf

import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import type { Item } from '../../types'

export default function ItemCard({ item }: { item: Item }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.publicDescription} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {item.category}
        </span>
        <h3 className="mt-1 font-semibold text-navy">{item.publicDescription}</h3>
        <p className="text-sm text-gray-500 mt-1">Found {item.dateFound}</p>
        <p className="text-sm text-gray-500">📍 {item.locationFound}</p>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={item.status} />
          <Link to={`/items/${item.id}`} className="text-sm font-semibold text-navy hover:underline">
            View item →
          </Link>
        </div>
      </div>
    </div>
  )
}
