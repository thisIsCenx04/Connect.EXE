import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getKyc, submitKyc } from '../../../services/user'

interface KycFormValues {
  legalName: string
  organization: string
  website: string
  linkedinUrl: string
  docType: string
  docNumber: string
  docFileUrl: string
}

export function KycPage() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<KycFormValues>({
    defaultValues: {
      legalName: '',
      organization: '',
      website: '',
      linkedinUrl: '',
      docType: 'ID_CARD',
      docNumber: '',
      docFileUrl: '',
    },
  })

  useEffect(() => {
    const loadKyc = async () => {
      if (!user?.id) return
      try {
        const kyc = await getKyc(user.id)
        setStatus(kyc.status)
        reset({
          legalName: kyc.legalName ?? '',
          organization: kyc.organization ?? '',
          website: kyc.website ?? '',
          linkedinUrl: kyc.linkedinUrl ?? '',
          docType: kyc.docType ?? 'ID_CARD',
          docNumber: kyc.docNumber ?? '',
          docFileUrl: kyc.docFileUrl ?? '',
        })
      } catch {
        setStatus('NOT_SUBMITTED')
      }
    }
    loadKyc()
  }, [reset, user?.id])

  const onSubmit = async (values: KycFormValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const kyc = await submitKyc(user.id, values)
      setStatus(kyc.status)
      setSuccess('KYC submitted successfully.')
    } catch {
      setError('KYC submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role !== 'INVESTOR') {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          KYC is only required for investors.
        </div>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
        >
          Back to profile
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Verification</p>
        <h1 className="display-font text-2xl font-semibold text-white">Investor verification</h1>
        <p className="text-sm text-white/70">Current status: {status ?? '...'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-surface max-w-2xl rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Legal name
            <input
              {...register('legalName')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Organization
            <input
              {...register('organization')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Website
            <input
              {...register('website')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            LinkedIn URL
            <input
              {...register('linkedinUrl')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Document type
            <select
              {...register('docType')}
              className="w-full rounded-full border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white"
            >
              <option value="ID_CARD">ID Card</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVER_LICENSE">Driver license</option>
              <option value="BUSINESS_LICENSE">Business license</option>
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Document number
            <input
              {...register('docNumber')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Document file URL
            <input
              {...register('docFileUrl')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            {submitting ? 'Submitting...' : 'Submit KYC'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/profile')}
            className="rounded-full btn-ghost px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Back to profile
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/')}
            className="rounded-full btn-ghost px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Back to home
          </button>
        </div>
      </form>
    </div>
  )
}
