import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { getKyc, getUserProfile, updateUserProfile, uploadUserAvatar, type UserProfile } from '../../../services/user'
import { updateUser } from '../../auth/store/authSlice'

interface ProfileFormValues {
  fullName: string
  avatarUrl: string
  headline: string
  bio: string
  country: string
  city: string
}

export function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: '',
      avatarUrl: '',
      headline: '',
      bio: '',
      country: '',
      city: '',
    },
  })

  const avatarUrl = watch('avatarUrl')

  const currentRole = profile?.role ?? user?.role ?? 'USER'

  const isVerified = useMemo(() => {
    return currentRole && ['FOUNDER', 'INVESTOR'].includes(currentRole) && profile?.verifiedStatus === 'APPROVED'
  }, [currentRole, profile?.verifiedStatus])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      try {
        const profile = await getUserProfile(user.id)
        setProfile(profile)
        dispatch(updateUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          verifiedStatus: profile.verifiedStatus,
          avatarUrl: profile.avatarUrl ?? null,
          emailVerified: profile.emailVerified,
        }))
        reset({
          fullName: profile.fullName ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          headline: profile.headline ?? '',
          bio: profile.bio ?? '',
          country: profile.country ?? '',
          city: profile.city ?? '',
        })
        const roleToCheck = profile.role ?? user?.role
        if (roleToCheck === 'USER') {
          try {
            const kyc = await getKyc(profile.id)
            setKycStatus(kyc.status)
          } catch {
            setKycStatus('NOT_SUBMITTED')
          }
        }
      } catch {
        setError('Unable to load profile.')
      }
    }
    loadProfile()
  }, [reset, user?.id])

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
    setError(null)
    setSuccess(null)
    setAvatarUploading(true)
    try {
      const uploaded = await uploadUserAvatar(user.id, file)
      setValue('avatarUrl', uploaded.url, { shouldDirty: true })
      setSuccess('Avatar uploaded. Save changes to apply.')
    } catch {
      setError('Avatar upload failed.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const updated = await updateUserProfile(user.id, values)
      setProfile(updated)
      dispatch(updateUser({
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        verifiedStatus: updated.verifiedStatus,
        avatarUrl: updated.avatarUrl ?? null,
        emailVerified: updated.emailVerified,
      }))
      setSuccess('Profile updated.')
    } catch {
      setError('Profile update failed.')
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Profile</p>
          <h1 className="display-font text-2xl font-semibold text-white">Your profile</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/50">
            <span>Role: {currentRole}</span>
            {isVerified && (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                Verified
              </span>
            )}
            {currentRole === 'USER' && (
              <span>KYC: {kycStatus ?? '...'}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/change-password')}
            className="rounded-full btn-ghost px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Change password
          </button>
          {currentRole === 'USER' && (
            <button
              type="button"
              onClick={() => navigate('/kyc')}
              className="rounded-full btn-ghost px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
            >
              G?i KYC n?ng c?p
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-surface max-w-3xl rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Full name
            <input
              {...register('fullName')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Upload avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading || saving}
                className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-white/80"
              />
            </label>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5" />
            )}
          </div>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Avatar URL
            <input
              {...register('avatarUrl')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Headline
            <input
              {...register('headline')}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 md:col-span-2">
            Bio
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Country code
            <input
              {...register('country')}
              maxLength={2}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            City
            <input
              {...register('city')}
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
            disabled={saving}
            className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            disabled={saving}
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
