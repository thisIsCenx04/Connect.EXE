import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import {
  createCheckout,
  fetchBillingSummary,
  fetchManualPaymentInfo,
  fetchPlans,
  type BillingSummary,
  type ManualCheckoutResponse,
  type ManualPaymentInfo,
  type Plan,
} from '../../../services/payment'

const PREMIUM_PACKAGES = [
  { months: 1, price: 29000, discount: 0, label: 'Tháng đơn lẻ' },
  { months: 3, price: 75000, discount: 13, label: 'Gói 3 tháng' },
  { months: 6, price: 145000, discount: 16, label: 'Gói 6 tháng' },
  { months: 12, price: 250000, discount: 28, label: 'Gói cả năm' },
]

const PREMIUM_FEATURES = [
  'Tìm kiếm nâng cao với bộ lọc chi tiết (filter by skills, availability, interests)',
  'Tạo dự án riêng tư (private projects) để lưu ý và file riêng',
  'Analytics về profile (xem ai đã xem hồ sơ của bạn)',
  'Ưu tiên trong hệ thống gợi ý',
  'Badge/Certification trên hồ sơ',
  'Chat video trực tiếp (premium video calling)',
  'Hỗ trợ ưu tiên từ team dev',
]

const vndFormatter = new Intl.NumberFormat('vi-VN')
const formatVnd = (value: number) => `${vndFormatter.format(value)} VNĐ`

export function PricingPage() {
  const navigate = useNavigate()
  const { accessToken } = useAppSelector((state) => state.auth)
  const [plans, setPlans] = useState<Plan[]>([])
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [manualInfo, setManualInfo] = useState<ManualPaymentInfo | null>(null)
  const [checkout, setCheckout] = useState<ManualCheckoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchPlans()
      .then((data) => {
        if (!active) return
        setPlans(data)
      })
      .catch(() => {
        if (!active) return
        setError('Kh?ng th? t?i c?c g?i gi?.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchManualPaymentInfo()
      .then((data) => {
        if (!active) return
        setManualInfo(data)
      })
      .catch(() => null)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setSummary(null)
      return
    }
    let active = true
    fetchBillingSummary()
      .then((data) => {
        if (!active) return
        setSummary(data)
      })
      .catch(() => null)
    return () => {
      active = false
    }
  }, [accessToken])

  const currentPlanCode = summary?.subscription.planCode

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.priceMonthUsd - b.priceMonthUsd)
  }, [plans])

  const freePlan = useMemo(() => sortedPlans.find((plan) => plan.code === 'FREE'), [sortedPlans])

  const handleUpgrade = async (months: number) => {
    if (!accessToken) {
      navigate('/register')
      return
    }
    setError(null)
    setLoading(true)
    setCheckout(null)
    try {
      const result = await createCheckout('PRO', months)
      setCheckout(result)
    } catch {
      setError('Không thể cập nhật gói. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="card-surface relative overflow-hidden rounded-[28px] border border-white/10 p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">B?ng gi?</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">Chọn gói Premium phù hợp cho bạn</h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Mở khóa tính năng nâng cao, ưu tiên hiển thị và hỗ trợ chuyên sâu.
          </p>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cao c?p</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Gói trả phí</h3>
              <p className="text-sm text-white/60">Chọn chu kỳ thanh toán phù hợp.</p>
            </div>
            {currentPlanCode === 'PRO' && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200">
                Đang dùng
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-emerald-100">
              Chuy?n kho?n ng?n h?ng
            </span>
            <span className="text-xs text-white/50">Duy?t th? c?ng</span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {PREMIUM_PACKAGES.map((pkg) => (
              <div key={pkg.months} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{pkg.label}</p>
                  {pkg.discount > 0 && (
                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
                      -{pkg.discount}%
                    </span>
                  )}
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">{formatVnd(pkg.price)}</div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{pkg.months} tháng</p>
                <button
                  type="button"
                  onClick={() => handleUpgrade(pkg.months)}
                  disabled={loading}
                  className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
                >
                  {accessToken ? 'Chọn gói' : 'Đăng ký'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex w-full flex-col items-center gap-3 md:w-[200px]">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">QR n?p ti?n</div>
                {manualInfo?.qrImageUrl || checkout?.qrImageUrl ? (
                  <img
                    src={checkout?.qrImageUrl ?? manualInfo?.qrImageUrl ?? ''}
                    alt="QR"
                    className="h-40 w-40 rounded-2xl border border-white/10 bg-white object-contain p-3"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs text-white/40">
                    Ch?a c? QR
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4 text-sm text-white/70">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Ng?n h?ng</div>
                    <div className="mt-1 text-white">
                      {checkout?.bankName ?? manualInfo?.bankName ?? '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">S? t?i kho?n</div>
                    <div className="mt-1 text-white">
                      {checkout?.bankAccountNumber ?? manualInfo?.bankAccountNumber ?? '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">T?n t?i kho?n</div>
                    <div className="mt-1 text-white">
                      {checkout?.bankAccountName ?? manualInfo?.bankAccountName ?? '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Chi nhánh</div>
                    <div className="mt-1 text-white">
                      {checkout?.bankBranch ?? manualInfo?.bankBranch ?? '--'}
                    </div>
                  </div>
                </div>

                {checkout ? (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">N?i dung chuy?n kho?n</div>
                    <div className="mt-2 text-lg font-semibold text-emerald-100">{checkout.transferContent}</div>
                    <div className="mt-2 text-xs text-emerald-200/80">S? ti?n: {formatVnd(checkout.amountVnd)}</div>
                    <div className="mt-2 text-xs text-emerald-200/80">
                      Vui l?ng ghi ??ng n?i dung tr?n ?? admin duy?t nhanh.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-white/40">
                    T?o ??n ?? nh?n n?i dung chuy?n kho?n.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">T?nh n?ng Premium</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Tính năng Premium</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {freePlan && (
        <section className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mi?n ph?</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{freePlan.name}</h3>
              <p className="text-sm text-white/60">Giữ miễn phí để trải nghiệm cơ bản.</p>
            </div>
            {currentPlanCode === 'FREE' && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200">
                Đang dùng
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  )
}


