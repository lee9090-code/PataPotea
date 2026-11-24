// TODO: Section 01 — Public item info:
//   - Photo upload (JPG/PNG ≤5MB)
//   - Category select, Public description textarea
//   - Where was it found? text input
//   - Date found (DD/MM/YYYY) + Time found (HH:MM, optional)
// TODO: Section 02 — Finder & private details (staff only label):
//   - Finder name (optional), Finder contact (optional)
//   - Private identifying details textarea (serial numbers, unique marks)
// TODO: "Keep the proof off the public page." tip panel
// TODO: "Save item as In store" + "Cancel" buttons
// See mockup: Page 8 of patapotea.pdf


import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { itemsService } from '../../services/itemsService'

export default function LogItem() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    category: '',
    publicDescription: '',
    locationFound: '',
    dateFound: new Date().toLocaleDateString('en-CA'),
    privateDetails: '',
    finderName: '',
    finderContact: '',
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const data = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      if (value.trim()) data.append(key, value.trim())
    })

    if (photo) data.append('photo', photo)

    try {
      setSaving(true)
      await itemsService.logItem(data)
      navigate('/guard/items', {
        state: { message: 'Found item successfully recorded.' },
      })
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to record this item. Please check your details and try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/guard"
          className="text-sm text-gray-500 hover:text-navy"
        >
          ← Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-navy mt-3">
          Log found item
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Record the details of an item handed in to the security desk.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6"
      >
        <div>
          <h2 className="font-semibold text-navy">Item information</h2>
          <p className="text-sm text-gray-500 mt-1">
            Provide an accurate description to help the owner identify the item.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Clothing">Clothing</option>
              <option value="Books and stationery">Books and stationery</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date found *
            </label>
            <input
              type="date"
              name="dateFound"
              value={form.dateFound}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public description *
          </label>
          <textarea
            name="publicDescription"
            value={form.publicDescription}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the item without revealing private identifying details."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />
          <p className="text-xs text-gray-400 mt-1">
            This description may be visible to people searching for lost items.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Private identifying details
          </label>
          <textarea
            name="privateDetails"
            value={form.privateDetails}
            onChange={handleChange}
            rows={3}
            placeholder="Record details that a genuine claimant should be able to verify."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />
          <p className="text-xs text-gray-400 mt-1">
            Keep these details private. They can help guards verify ownership claims.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location where item was found *
          </label>
          <input
            type="text"
            name="locationFound"
            value={form.locationFound}
            onChange={handleChange}
            required
            placeholder="e.g. Library, Block B, Room 204"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={event => setPhoto(event.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy hover:file:bg-gray-200"
          />
          {photo && (
            <p className="text-xs text-gray-500 mt-2">
              Selected: {photo.name}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="font-semibold text-navy mb-4">
            Finder information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finder's name
              </label>
              <input
                type="text"
                name="finderName"
                value={form.finderName}
                onChange={handleChange}
                placeholder="Name of person who handed it in"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finder's contact
              </label>
              <input
                type="text"
                name="finderContact"
                value={form.finderContact}
                onChange={handleChange}
                placeholder="Phone number or email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            to="/guard"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-amber-brand text-navy text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving item...' : 'Save found item'}
          </button>
        </div>
      </form>
    </div>
  )
}

