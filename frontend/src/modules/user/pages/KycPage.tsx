import { type ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getKyc, submitKyc, uploadKycDocument } from '../../../services/user'

interface KycFormValues {
  legalName: string
  organization: string
  website: string
  linkedinUrl: string
  docType: string
  docNumber: string
  docFileUrl: string
  requestedRole: string
}

export function KycPage() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [docUploading, setDocUploading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm<KycFormValues>({
    defaultValues: {
      legalName: '',
      organization: '',
      website: '',
      linkedinUrl: '',
      docType: 'ID_CARD',
      docNumber: '',
      docFileUrl: '',
      requestedRole: 'INVESTOR',
    },
  })

  const docFileUrl = watch('docFileUrl')
  const isPending = status === 'PENDING'

  useEffect(() => {
    const loadKyc = async () => {
      if (!user?.id || user.role !== 'USER') return
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
          requestedRole: kyc.requestedRole ?? 'INVESTOR',
        })
      } catch {
        setStatus('NOT_SUBMITTED')
      }
    }
    loadKyc()
  }, [reset, user?.id])

  const handleDocUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
    setError(null)
    setSuccess(null)
    setDocUploading(true)
    try {
      const uploaded = await uploadKycDocument(user.id, file)
      setValue('docFileUrl', uploaded.url, { shouldDirty: true })
      setSuccess('Document uploaded. Submit KYC to finish.')
    } catch {
      setError('Document upload failed.')
    } finally {
      setDocUploading(false)
    }
  }

  const onSubmit = async (values: KycFormValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const kyc = await submitKyc(user.id, {
        legalName: values.legalName,
        organization: values.organization,
        website: values.website,
        linkedinUrl: values.linkedinUrl,
        docType: values.docType,
        docNumber: values.docNumber,
        docFileUrl: values.docFileUrl,
        requestedRole: values.requestedRole,
      })
      setStatus(kyc.status)
      setSuccess('KYC submitted successfully.')
    } catch {
      setError('KYC submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role && user.role !== 'USER') {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          Tài khoản đã được nâng cấp. Bạn không cần gửi KYC nữa.
        </div>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
        >
          Trở về hồ sơ cá nhân
        </button>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60"></p>
        <h1 className="display-font text-2xl font-semibold text-white">Yêu cầu nâng cấp vai trò</h1>
      </div>
      {isPending && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          Yêu cầu KYC đang được xử lý. Vui lòng chờ admin kiểm duyệt trước khi gửi lại.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card-surface max-w-2xl rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Yêu cầu vai trò
            <select
              {...register('requestedRole')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white"
            >
              <option value="INVESTOR">Investor</option>
              <option value="FOUNDER">Founder</option>
              <option value="MENTOR">Mentor</option>
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Tên pháp lý
            <input
              {...register('legalName')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Tổ chức
            <input
              {...register('organization')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Website
            <input
              {...register('website')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            LinkedIn URL
            <input
              {...register('linkedinUrl')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Loại tài liệu
            <select
              {...register('docType')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white"
            >
              <option value="ID_CARD">CCCD</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVER_LICENSE">Giấy phép lái xe</option>
              <option value="BUSINESS_LICENSE">Giấy phép kinh doanh</option>
            </select>
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Số tài liệu
            <input
              {...register('docNumber')}
              disabled={submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleDocUpload}
              disabled={docUploading || submitting || isPending}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-white/80"
            />
            {docFileUrl && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Tài liệu đã sẵn sàng
              </p>
            )}
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            URL tài liệu đã tải lên
            <input
              {...register('docFileUrl')}
              disabled={submitting || isPending}
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
            disabled={submitting || isPending}
            className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            {isPending ? 'KYC pending' : submitting ? 'Submitting...' : 'Submit KYC'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/profile')}
            className="rounded-full btn-ghost px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Về hồ sơ cá nhân
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/')}
            className="rounded-full btn-ghost px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Về trang chủ
          </button>
        </div>
      </form>
    </div>
  )
}
