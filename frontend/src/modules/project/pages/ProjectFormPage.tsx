import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProject,
  getProject,
  type ProjectLink,
  type ProjectMedia,
  updateProject,
  uploadProjectMedia,
} from '../../../services/project'
import {
  PROJECT_STAGES,
  DEAL_TYPES,
  INDUSTRIES,
  COUNTRIES,
  TAGS_BY_INDUSTRY,
  COMMON_TAGS,
  LINK_TYPES,
  STAGE_DISPLAY_NAMES,
  DEAL_TYPE_DISPLAY_NAMES,
  FUNDING_REQUIRED_STAGES,
  FUNDING_REQUIRED_DEAL_TYPES,
} from '@/constants/project'

interface ProjectFormValues {
  title: string
  summary: string
  description: string
  content: string
  stage: string
  industry: string
  dealType: string
  country: string
  fundingTargetUsd: string
  fundingNeedUsd: string
  fundingRaisedUsd: string
  valuationUsd: string
  equityPercent: string
  tractionSummary: string
  fundingTimeline: string
  tractionMetrics: string
  pitchDeckUrl: string
}

export function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [links, setLinks] = useState<ProjectLink[]>([])
  const [media, setMedia] = useState<ProjectMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [industrySearch, setIndustrySearch] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const tagDropdownRef = useRef<HTMLDivElement>(null)
  const industryDropdownRef = useRef<HTMLDivElement>(null)
  const countryDropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProjectFormValues>({
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      content: '',
      stage: 'IDEA',
      industry: '',
      dealType: 'FUNDING',
      country: 'VN',
      fundingTargetUsd: '',
      fundingNeedUsd: '',
      fundingRaisedUsd: '',
      valuationUsd: '',
      equityPercent: '',
      tractionSummary: '',
      fundingTimeline: '',
      tractionMetrics: '',
      pitchDeckUrl: '',
    },
  })

  const stageValue = watch('stage')
  const dealTypeValue = watch('dealType')
  const industryValue = watch('industry')
  const countryValue = watch('country')

  // Determine if funding fields should be shown
  const showFunding = useMemo(() => {
    const stageRequiresFunding = FUNDING_REQUIRED_STAGES.includes(stageValue as any)
    const dealRequiresFunding = FUNDING_REQUIRED_DEAL_TYPES.includes(dealTypeValue as any)
    return stageRequiresFunding || dealRequiresFunding
  }, [stageValue, dealTypeValue])

  // Determine if traction fields should be shown (for MVP and above)
  const showTraction = useMemo(() => {
    return ['MVP', 'REVENUE', 'EXIT_READY'].includes(stageValue)
  }, [stageValue])

  // Get available tags based on selected industry
  const availableTags = useMemo(() => {
    const industryTags = industryValue ? (TAGS_BY_INDUSTRY[industryValue] || []) : []
    return [...new Set([...industryTags, ...COMMON_TAGS])]
  }, [industryValue])

  const dropdownTags = useMemo(() => {
    return availableTags.filter((tag) => !selectedTags.includes(tag))
  }, [availableTags, selectedTags])

  const filteredTagOptions = useMemo(() => {
    const search = tagSearch.trim().toLowerCase()
    if (!search) return dropdownTags
    return dropdownTags.filter((tag) => tag.toLowerCase().includes(search))
  }, [dropdownTags, tagSearch])

  const filteredIndustries = useMemo(() => {
    const search = industrySearch.trim().toLowerCase()
    if (!search) return INDUSTRIES
    return INDUSTRIES.filter((industry) => industry.toLowerCase().includes(search))
  }, [industrySearch])

  const filteredCountries = useMemo(() => {
    const search = countrySearch.trim().toLowerCase()
    if (!search) return COUNTRIES
    return COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(search) || country.code.toLowerCase().includes(search)
    )
  }, [countrySearch])

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((country) => country.code === countryValue)
  }, [countryValue])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      const path = typeof (event as PointerEvent).composedPath === 'function'
        ? (event as PointerEvent).composedPath()
        : []
      const target = event.target as Node
      const isInside = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return false
        if (path.length > 0) {
          return path.includes(ref.current)
        }
        return ref.current.contains(target)
      }

      if (!isInside(tagDropdownRef)) {
        setShowTagDropdown(false)
      }
      if (!isInside(industryDropdownRef)) {
        setShowIndustryDropdown(false)
      }
      if (!isInside(countryDropdownRef)) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside, true)
    return () => document.removeEventListener('pointerdown', handleClickOutside, true)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  // Reset tags when industry changes
  useEffect(() => {
    // Keep only common tags and tags that belong to the new industry
    const newIndustryTags = industryValue ? (TAGS_BY_INDUSTRY[industryValue] || []) : []
    const validTags = selectedTags.filter(
      (tag) => COMMON_TAGS.includes(tag as any) || newIndustryTags.includes(tag)
    )
    if (validTags.length !== selectedTags.length) {
      setSelectedTags(validTags)
    }
  }, [industryValue])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProject(id)
      .then((project) => {
        reset({
          title: project.title,
          summary: project.summary ?? '',
          description: project.description,
          content: project.content ?? '',
          stage: project.stage,
          industry: project.industry,
          dealType: project.dealType,
          country: project.country ?? 'VN',
          fundingTargetUsd: project.fundingTargetUsd?.toString() ?? '',
          fundingNeedUsd: project.fundingNeedUsd?.toString() ?? '',
          fundingRaisedUsd: project.fundingRaisedUsd?.toString() ?? '',
          valuationUsd: project.valuationUsd?.toString() ?? '',
          equityPercent: project.equityPercent?.toString() ?? '',
          tractionSummary: project.tractionSummary ?? '',
          fundingTimeline: project.fundingTimeline ?? '',
          tractionMetrics: project.tractionMetrics ?? '',
          pitchDeckUrl: project.pitchDeckUrl ?? '',
        })
        setSelectedTags(project.tags ?? [])
        setLinks(project.links ?? [])
        setMedia(project.media ?? [])
      })
      .catch(() => setError('Không thể tải dự án.'))
      .finally(() => setLoading(false))
  }, [id, reset])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, role: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ upload file ảnh')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 100)

    try {
      const result = await uploadProjectMedia(file, 'projects')
      setUploadProgress(100)
      setMedia((prev) => [
        ...prev,
        {
          fileUrl: result.url,
          fileType: file.type,
          role,
          sortOrder: prev.length,
        },
      ])
    } catch {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, idx) => idx !== index))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const onSubmit = async (values: ProjectFormValues) => {
    setError(null)
    setLoading(true)
    const payload = {
      title: values.title,
      summary: values.summary || undefined,
      description: values.description,
      content: values.content || undefined,
      stage: values.stage,
      industry: values.industry,
      dealType: values.dealType,
      country: values.country || undefined,
      fundingTargetUsd: values.fundingTargetUsd ? Number(values.fundingTargetUsd) : undefined,
      fundingNeedUsd: values.fundingNeedUsd ? Number(values.fundingNeedUsd) : undefined,
      fundingRaisedUsd: values.fundingRaisedUsd ? Number(values.fundingRaisedUsd) : undefined,
      valuationUsd: values.valuationUsd ? Number(values.valuationUsd) : undefined,
      equityPercent: values.equityPercent ? Number(values.equityPercent) : undefined,
      tractionSummary: values.tractionSummary || undefined,
      fundingTimeline: values.fundingTimeline || undefined,
      tractionMetrics: values.tractionMetrics || undefined,
      pitchDeckUrl: values.pitchDeckUrl || undefined,
      tags: selectedTags,
      links: links.filter((link) => link.url && link.url.trim().length > 0),
      media: media.filter((item) => item.fileUrl && item.fileUrl.trim().length > 0),
    }
    try {
      if (id) {
        await updateProject(id, payload)
      } else {
        await createProject(payload)
      }
      navigate(id ? `/projects/${id}` : '/projects')
    } catch {
      setError('Không thể lưu dự án. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const coverImage = media.find((m) => m.role === 'COVER')
  const galleryImages = media.filter((m) => m.role === 'GALLERY')

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Kh?ng gian d? ?n</p>
            <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">
              {id ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Điền đầy đủ nội dung để tăng khả năng được duyệt và hiển thị nổi bật.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/60"
          >
            Quay lại danh sách
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tiêu đề *</span>
              <input
                {...register('title')}
                required
                placeholder="Nhập tên dự án của bạn"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Giới thiệu (ngắn) *</span>
                <div className="group relative">
                  <svg className="h-3.5 w-3.5 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute left-0 top-6 z-10 hidden w-64 rounded-lg border border-white/20 bg-[#111827] p-3 text-xs text-white/70 shadow-xl group-hover:block">
                    Tóm tắt ngắn gọn về dự án (1-2 câu). Hiển thị ở phần “giới thiệu” phía trên.
                  </div>
                </div>
              </div>
              <textarea
                {...register('summary')}
                rows={2}
                maxLength={200}
                placeholder="Tóm tắt ngắn gọn về dự án (tối đa 200 ký tự)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Giới thiệu chi tiết *</span>
                <div className="group relative">
                  <svg className="h-3.5 w-3.5 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute left-0 top-6 z-10 hidden w-64 rounded-lg border border-white/20 bg-[#111827] p-3 text-xs text-white/70 shadow-xl group-hover:block">
                    Mô tả chi tiết về dự án: vấn đề, giải pháp, target market... Hiển thị ở phần “Giới thiệu chi tiết” phía dưới.
                  </div>
                </div>
              </div>
              <textarea
                {...register('description')}
                rows={4}
                required
                placeholder="Mô tả chi tiết về dự án, vấn đề, giải pháp..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </label>

            {/* Stage & Deal Type - Always visible */}
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Giai đoạn *</span>
              <select
                {...register('stage')}
                required
                className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white [color-scheme:dark]"
              >
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage} value={stage} className="bg-[#111827]">
                    {STAGE_DISPLAY_NAMES[stage] || stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Nhu cầu *</span>
              <select
                {...register('dealType')}
                required
                className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white [color-scheme:dark]"
              >
                {DEAL_TYPES.map((deal) => (
                  <option key={deal} value={deal} className="bg-[#111827]">
                    {DEAL_TYPE_DISPLAY_NAMES[deal] || deal}
                  </option>
                ))}
              </select>
            </label>

            {/* Industry Dropdown */}
            <div className="space-y-2" ref={industryDropdownRef}>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Lĩnh vực *</span>
              <input type="hidden" {...register('industry', { required: true })} />
              <div className="relative">
                <div
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white cursor-pointer"
                  onClick={() => setShowIndustryDropdown((prev) => !prev)}
                >
                  <span className={industryValue ? 'text-white' : 'text-white/30'}>
                    {industryValue || 'Chọn lĩnh vực'}
                  </span>
                </div>
                {showIndustryDropdown && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#111827] py-1 shadow-lg">
                    
                    <div className="sticky top-0 bg-[#111827] px-3 py-2">
                      <input
                        value={industrySearch}
                        onChange={(event) => setIndustrySearch(event.target.value)}
                        placeholder="Tìm lĩnh vực..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30"
                      />
                    </div>
                    {filteredIndustries.length > 0 ? (
                      filteredIndustries.map((industry) => (
                        <div
                          key={industry}
                          onClick={() => {
                            setValue('industry', industry, { shouldDirty: true, shouldValidate: true })
                            setShowIndustryDropdown(false)
                            setIndustrySearch('')
                          }}
                          className={`cursor-pointer px-4 py-2 text-sm hover:bg-white/10 ${
                            industryValue === industry ? 'bg-sky-500/20 text-sky-300' : 'text-white'
                          }`}
                        >
                          {industry}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-white/50">Không tìm thấy kết quả.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2" ref={countryDropdownRef}>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Quốc gia</span>
              <input type="hidden" {...register('country')} />
              <div className="relative">
                <div
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white cursor-pointer"
                  onClick={() => setShowCountryDropdown((prev) => !prev)}
                >
                  <span className={selectedCountry ? 'text-white' : 'text-white/30'}>
                    {selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : 'Chọn quốc gia'}
                  </span>
                </div>
                {showCountryDropdown && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#111827] py-1 shadow-lg">
                    <div className="sticky top-0 bg-[#111827] px-3 py-2">
                      <input
                        value={countrySearch}
                        onChange={(event) => setCountrySearch(event.target.value)}
                        placeholder="Tìm quốc gia..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30"
                      />
                    </div>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            setValue('country', country.code, { shouldDirty: true })
                            setShowCountryDropdown(false)
                            setCountrySearch('')
                          }}
                          className={`cursor-pointer px-4 py-2 text-sm hover:bg-white/10 ${
                            countryValue === country.code ? 'bg-sky-500/20 text-sky-300' : 'text-white'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{country.name}</span>
                            <span className="text-xs text-white/50">{country.code}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-white/50">Không tìm thấy kết quả.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags Multi-select Dropdown */}
            <div className="space-y-2 md:col-span-2" ref={tagDropdownRef}>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tags</span>
              <div className="relative">
                <div
                  className="min-h-[48px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 cursor-pointer"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                >
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTag(tag)
                          }}
                          className="flex h-8 items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 text-xs text-sky-200 transition hover:border-sky-300 hover:text-white"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400/30 text-[10px] font-semibold text-sky-100">
                            {tag.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate">{tag}</span>
                          <span className="text-sky-200/70">x</span>
                        </button>
                      ))}
                    </div>
                  ) : (

                    <span className="text-sm text-white/30">Chọn tags cho dự án...</span>
                                    )}
                </div>
                {showTagDropdown && dropdownTags.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#111827] py-1 shadow-lg">
                    <div className="sticky top-0 bg-[#111827] px-3 py-2">
                      <input
                        value={tagSearch}
                        onChange={(event) => setTagSearch(event.target.value)}
                        placeholder="Tìm tag..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30"
                      />
                    </div>
                    {filteredTagOptions.map((tag) => (
                      <div
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="cursor-pointer px-4 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded border border-white/30" />
                          {tag}
                        </span>
                      </div>
                    ))}
                    {filteredTagOptions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-white/50">Không tìm thấy kết quả.</div>
                    )}
                  </div>
                )}
                {showTagDropdown && dropdownTags.length === 0 && availableTags.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white/60 shadow-lg">
                    T?t c? tag ?? ???c ch?n.
                  </div>
                )}
              </div>
              {!industryValue && (
                <p className="text-xs text-white/40">Chọn lĩnh vực trước để xem tags liên quan</p>
              )}
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Hình ảnh dự án</h2>
          <p className="mt-1 text-sm text-white/50">Tải lên ảnh đại diện và gallery cho dự án</p>
          
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Cover Image */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Ảnh đại diện (Cover)</span>
              {coverImage ? (
                <div className="relative group">
                  <img
                    src={coverImage.fileUrl}
                    alt="Cover"
                    className="h-48 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(media.indexOf(coverImage))}
                    className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:border-sky-400/50 hover:bg-white/10 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'COVER')}
                    disabled={uploading}
                  />
                  {uploading && uploadProgress > 0 ? (
                    <>
                      <div className="relative h-16 w-16">
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="2" />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-sky-400"
                            strokeWidth="2"
                            strokeDasharray={`${uploadProgress}, 100`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                          {uploadProgress}%
                        </span>
                      </div>
                      <span className="mt-2 text-sm text-white/50">Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 text-sm text-white/50">Tải ảnh đại diện</span>
                      <span className="mt-1 text-xs text-white/30">Tối đa 5MB</span>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Gallery</span>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, idx) => (
                  <div key={img.fileUrl} className="relative group">
                    <img
                      src={img.fileUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(media.indexOf(img))}
                      className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {galleryImages.length < 6 && (
                  <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5 hover:border-sky-400/50 hover:bg-white/10 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e, 'GALLERY')}
                      disabled={uploading}
                    />
                    <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Content - Always visible */}
        <div className="card-surface rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Sứ mệnh & Tầm nhìn</h2>
            <div className="group relative">
              <svg className="h-4 w-4 text-white/40 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 top-6 z-10 hidden w-72 rounded-lg border border-white/20 bg-[#111827] p-3 text-xs text-white/70 shadow-xl group-hover:block">
                Nội dung chi tiết về sứ mệnh, tầm nhìn, định hướng phát triển. Hiển thị ở phần “Sứ mệnh & Tầm nhìn” phía dưới.
              </div>
            </div>
          </div>
          <div className="mt-4">
            <textarea
              {...register('content')}
              rows={8}
              placeholder="Nội dung chi tiết về sứ mệnh, tầm nhìn, định hướng phát triển..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 whitespace-pre-wrap"
            />
          </div>
        </div>

        {/* Funding Section - Conditional */}
        {showFunding && (
          <div className="card-surface rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white">Thông tin gọi vốn</h2>
            <p className="mt-1 text-sm text-white/50">Thông tin về nhu cầu và kế hoạch gọi vốn</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Mục tiêu gọi vốn (USD)</span>
                <input
                  {...register('fundingTargetUsd')}
                  type="number"
                  placeholder="100000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Số tiền cần gọi (USD)</span>
                <input
                  {...register('fundingNeedUsd')}
                  type="number"
                  placeholder="50000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Đã gọi được (USD)</span>
                <input
                  {...register('fundingRaisedUsd')}
                  type="number"
                  placeholder="0"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Định giá (USD)</span>
                <input
                  {...register('valuationUsd')}
                  type="number"
                  placeholder="1000000"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Cổ phần chào bán (%)</span>
                <input
                  {...register('equityPercent')}
                  type="number"
                  step="0.01"
                  max="100"
                  placeholder="10"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Timeline gọi vốn</span>
                <input
                  {...register('fundingTimeline')}
                  placeholder="Q2 2025 - Q4 2025"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
            </div>
          </div>
        )}

        {/* Traction Section - Conditional */}
        {showTraction && (
          <div className="card-surface rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white">Traction & Ch? s?</h2>
            <p className="mt-1 text-sm text-white/50">Thông tin về tiến độ và các chỉ số của dự án</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tóm tắt Traction</span>
                <textarea
                  {...register('tractionSummary')}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về traction: số user, revenue, growth rate..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Chi tiết Metrics</span>
                <textarea
                  {...register('tractionMetrics')}
                  rows={3}
                  placeholder="MAU: 10,000 | MRR: $5,000 | Growth: 20% MoM..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                />
              </label>
            </div>
          </div>
        )}

        {/* Pitch Deck - Always visible */}
        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Pitch deck</h2>
          <div className="mt-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Link pitch deck</span>
              <input
                {...register('pitchDeckUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL phải bắt đầu với http:// hoặc https://',
                  },
                })}
                placeholder="https://docs.google.com/presentation/..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              />
            </label>
          </div>
        </div>

        {/* Links Section */}
        <div className="card-surface rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Liên kết</h2>
              <p className="text-sm text-white/50">Website, demo, fanpage...</p>
            </div>
            <button
              type="button"
              onClick={() => setLinks((prev) => [...prev, { type: 'WEBSITE', url: '' }])}
              className="rounded-full btn-ghost px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
            >
              + Thêm liên kết
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {links.map((link, index) => (
              <div key={`link-${index}`} className="grid gap-3 md:grid-cols-7 items-center">
                <select
                  value={link.type}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, type: event.target.value } : item))
                    )
                  }
                  className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white md:col-span-2 [color-scheme:dark]"
                >
                  {LINK_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#111827]">
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <input
                  value={link.label ?? ''}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, label: event.target.value } : item))
                    )
                  }
                  placeholder="Nhãn (tùy chọn)"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2 placeholder:text-white/30"
                />
                <input
                  value={link.url}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, url: event.target.value } : item))
                    )
                  }
                  placeholder="https://..."
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2 placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== index))}
                  className="rounded-full p-2 hover:bg-red-500/20 transition"
                >
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {links.length === 0 && (
              <p className="text-sm text-white/40 text-center py-4">Chưa có liên kết nào</p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="rounded-full btn-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : id ? 'Cập nhật dự án' : 'Tạo dự án'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            disabled={loading || uploading}
            className="rounded-full btn-ghost px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}
