// TODO: Item summary card (image, name, PT/CL ref, Approved badge, owner name + student number)
// TODO: Step 01 — "Check the owner's ID" checkbox
// TODO: Step 02 — Signature canvas (draw on device)
// TODO: "Clear signature" button
// TODO: "Mark as collected" button — disabled until both checks are complete
// TODO: "One item. One clear record." info panel
// See mockup: Page 15 of patapotea.pdf


import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { claimsService } from '../../services/claimsService'

interface ClaimDetails {
  id: number
  reference: string
  status: string
  itemRecord?: {
    reference?: string
    category?: string
  }
}

export default function Handover() {
  const { claimId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [idChecked, setIdChecked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClaim = async () => {
      try {
        setLoading(true)
        const response = await claimsService.getById(Number(claimId))
        setClaim(response.data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load the approved claim.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (claimId) loadClaim()
  }, [claimId])

  const getCanvasPosition = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const position = getCanvasPosition(event)

    if (!canvas || !context || !position) return

    drawingRef.current = true
    canvas.setPointerCapture(event.pointerId)

    context.beginPath()
    context.moveTo(position.x, position.y)
  }

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return

    const context = canvasRef.current?.getContext('2d')
    const position = getCanvasPosition(event)

    if (!context || !position) return

    context.lineWidth = 2
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#1B2A3B'
    context.lineTo(position.x, position.y)
    context.stroke()
  }

  const stopDrawing = () => {
    drawingRef.current = false
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const submitHandover = async () => {
    if (!claim) return

    if (claim.status !== 'approved') {
      setError('Only approved claims can be handed over.')
      return
    }

    if (!idChecked) {
      setError('Confirm that the claimant ID has been checked.')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png')

    const blankCanvas = document.createElement('canvas')
    blankCanvas.width = canvas.width
    blankCanvas.height = canvas.height

    if (canvas.toDataURL() === blankCanvas.toDataURL()) {
      setError('Please capture the claimant signature before continuing.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.post(`/handover/${claim.id}`, {
        idChecked: true,
        signatureData,
      })

      navigate('/guard/claims', {
        state: { message: `Handover for ${claim.reference} recorded successfully.` },
      })
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to record the handover. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading handover details...
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error || 'Claim not found.'}
        </div>
        <Link to="/guard/claims" className="inline-block mt-4 text-sm text-navy font-medium">
          ← Back to claims
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/guard/claims" className="text-sm text-gray-500 hover:text-navy">
          ← Back to claims
        </Link>
        <h1 className="text-2xl font-bold text-navy mt-3">Item handover</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete the final verification and record collection of the item.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-navy">Approved claim details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Claim reference</p>
            <p className="font-semibold text-sm text-navy mt-1">{claim.reference}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Item reference</p>
            <p className="font-semibold text-sm text-navy mt-1">
              {claim.itemRecord?.reference || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Item category</p>
            <p className="text-sm text-gray-800 mt-1">
              {claim.itemRecord?.category || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Claim status</p>
            <p className="text-sm font-semibold text-green-700 mt-1">
              {claim.status}
            </p>
          </div>
        </div>
      </section>

      {claim.status !== 'approved' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This claim is not approved for collection. The handover cannot be completed.
        </div>
      ) : (
        <>
          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-navy">Identity verification</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={idChecked}
                onChange={event => setIdChecked(event.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-500"
              />
              <span className="text-sm text-gray-700">
                I confirm that I have checked the claimant's university ID and verified their identity.
              </span>
            </label>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-navy">Claimant signature</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ask the claimant to sign in the space below using a mouse, stylus or touchscreen.
              </p>
            </div>

            <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={900}
                height={250}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                onPointerCancel={stopDrawing}
                className="block w-full h-48 touch-none cursor-crosshair"
                aria-label="Claimant signature area"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm font-medium text-gray-600 hover:text-navy"
              >
                Clear signature
              </button>
            </div>
          </section>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              to="/guard/claims"
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={submitHandover}
              disabled={saving}
              className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Recording handover...' : 'Confirm handover'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

