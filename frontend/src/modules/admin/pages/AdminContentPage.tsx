import { useEffect, useMemo, useState } from 'react'
import {
  adminCreateContent,
  adminCreateResource,
  adminDeleteContent,
  adminDeleteResource,
  adminFetchContentList,
  adminFetchResourceList,
  adminUpdateContent,
  adminUpdateResource,
  type ContentItem,
  type ContentStatus,
  type ContentType,
  type ResourceItem,
  type ResourceType,
} from '@/services/content'
import { AdminIconButton, AdminModal } from '../components/AdminUi'

const CONTENT_TYPES: ContentType[] = ['ARTICLE', 'EVENT', 'COMPETITION', 'TREND']
const CONTENT_STATUSES: ContentStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const RESOURCE_TYPES: ResourceType[] = ['FILE', 'LINK']

const toTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

const toLocalInput = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

const toIso = (value: string) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

const buildContentForm = (item?: ContentItem) => ({
  id: item?.id ?? null,
  type: item?.type ?? 'ARTICLE',
  status: item?.status ?? 'DRAFT',
  title: item?.title ?? '',
  summary: item?.summary ?? '',
  body: item?.body ?? '',
  coverUrl: item?.coverUrl ?? '',
  startAt: toLocalInput(item?.startAt ?? null),
  endAt: toLocalInput(item?.endAt ?? null),
  location: item?.location ?? '',
  externalUrl: item?.externalUrl ?? '',
  tags: item?.tags?.join(', ') ?? '',
})

const buildResourceForm = (item?: ResourceItem) => ({
  id: item?.id ?? null,
  title: item?.title ?? '',
  description: item?.description ?? '',
  type: item?.type ?? 'LINK',
  url: item?.url ?? '',
  tags: item?.tags?.join(', ') ?? '',
  status: item?.status ?? 'PUBLISHED',
})

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14 6 3.5 3.5" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l1-3h8l1 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
)

export function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [resourceItems, setResourceItems] = useState<ResourceItem[]>([])
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'ALL'>('ALL')
  const [contentStatusFilter, setContentStatusFilter] = useState<ContentStatus | 'ALL'>('ALL')
  const [resourceStatusFilter, setResourceStatusFilter] = useState<ContentStatus | 'ALL'>('ALL')
  const [contentForm, setContentForm] = useState(buildContentForm())
  const [resourceForm, setResourceForm] = useState(buildResourceForm())
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null)
  const [contentModal, setContentModal] = useState<null | 'detail' | 'edit' | 'create' | 'delete'>(null)
  const [resourceModal, setResourceModal] = useState<null | 'detail' | 'edit' | 'create' | 'delete'>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const contentStatusLabel = useMemo(
    () => ({
      DRAFT: 'border-slate-200 bg-slate-50 text-slate-600',
      PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      ARCHIVED: 'border-amber-200 bg-amber-50 text-amber-700',
    }),
    []
  )

  useEffect(() => {
    let active = true
    adminFetchContentList(
      contentTypeFilter === 'ALL' ? undefined : contentTypeFilter,
      contentStatusFilter === 'ALL' ? undefined : contentStatusFilter
    )
      .then((data) => {
        if (!active) return
        setContentItems(data)
      })
      .catch(() => {
        if (!active) return
        setError('Unable to load content list.')
      })
    return () => {
      active = false
    }
  }, [contentTypeFilter, contentStatusFilter])

  useEffect(() => {
    let active = true
    adminFetchResourceList(resourceStatusFilter === 'ALL' ? undefined : resourceStatusFilter)
      .then((data) => {
        if (!active) return
        setResourceItems(data)
      })
      .catch(() => {
        if (!active) return
        setError('Unable to load resources.')
      })
    return () => {
      active = false
    }
  }, [resourceStatusFilter])

  const resetContentForm = () => setContentForm(buildContentForm())
  const resetResourceForm = () => setResourceForm(buildResourceForm())

  const handleSaveContent = async () => {
    setError(null)
    setMessage(null)
    const payload = {
      type: contentForm.type as ContentType,
      status: contentForm.status as ContentStatus,
      title: contentForm.title,
      summary: contentForm.summary || null,
      body: contentForm.body || null,
      coverUrl: contentForm.coverUrl || null,
      startAt: toIso(contentForm.startAt),
      endAt: toIso(contentForm.endAt),
      location: contentForm.location || null,
      externalUrl: contentForm.externalUrl || null,
      tags: contentForm.tags ? toTags(contentForm.tags) : [],
    }

    try {
      if (contentForm.id) {
        const updated = await adminUpdateContent(contentForm.id, payload)
        setContentItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setMessage('Content updated successfully.')
      } else {
        const created = await adminCreateContent(payload)
        setContentItems((prev) => [created, ...prev])
        setMessage('Content created successfully.')
      }
      resetContentForm()
      setContentModal(null)
    } catch {
      setError('Unable to save content.')
    }
  }

  const handleSaveResource = async () => {
    setError(null)
    setMessage(null)
    const payload = {
      title: resourceForm.title,
      description: resourceForm.description || null,
      type: resourceForm.type as ResourceType,
      url: resourceForm.url,
      tags: resourceForm.tags ? toTags(resourceForm.tags) : [],
      status: resourceForm.status as ContentStatus,
    }

    try {
      if (resourceForm.id) {
        const updated = await adminUpdateResource(resourceForm.id, payload)
        setResourceItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setMessage('Resource updated successfully.')
      } else {
        const created = await adminCreateResource(payload)
        setResourceItems((prev) => [created, ...prev])
        setMessage('Resource created successfully.')
      }
      resetResourceForm()
      setResourceModal(null)
    } catch {
      setError('Unable to save resource.')
    }
  }

  const handleDeleteContent = async () => {
    if (!selectedContent) return
    setError(null)
    setMessage(null)
    try {
      await adminDeleteContent(selectedContent.id)
      setContentItems((prev) => prev.filter((entry) => entry.id !== selectedContent.id))
      setMessage('Content deleted.')
      setContentModal(null)
    } catch {
      setError('Unable to delete content.')
    }
  }

  const handleDeleteResource = async () => {
    if (!selectedResource) return
    setError(null)
    setMessage(null)
    try {
      await adminDeleteResource(selectedResource.id)
      setResourceItems((prev) => prev.filter((entry) => entry.id !== selectedResource.id))
      setMessage('Resource deleted.')
      setResourceModal(null)
    } catch {
      setError('Unable to delete resource.')
    }
  }

  const openContentDetail = (item: ContentItem) => {
    setSelectedContent(item)
    setContentModal('detail')
  }

  const openContentEdit = (item: ContentItem) => {
    setSelectedContent(item)
    setContentForm(buildContentForm(item))
    setContentModal('edit')
  }

  const openContentDelete = (item: ContentItem) => {
    setSelectedContent(item)
    setContentModal('delete')
  }

  const openContentCreate = () => {
    resetContentForm()
    setContentModal('create')
  }

  const openResourceDetail = (item: ResourceItem) => {
    setSelectedResource(item)
    setResourceModal('detail')
  }

  const openResourceEdit = (item: ResourceItem) => {
    setSelectedResource(item)
    setResourceForm(buildResourceForm(item))
    setResourceModal('edit')
  }

  const openResourceDelete = (item: ResourceItem) => {
    setSelectedResource(item)
    setResourceModal('delete')
  }

  const openResourceCreate = () => {
    resetResourceForm()
    setResourceModal('create')
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Content hub</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">Manage Startup Hub & Resources</h2>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      )}
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Startup hub</p>
            <h3 className="text-lg font-semibold text-slate-900">News, events, competitions</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={contentTypeFilter}
              onChange={(event) => setContentTypeFilter(event.target.value as ContentType | 'ALL')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              <option value="ALL">All types</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={contentStatusFilter}
              onChange={(event) => setContentStatusFilter(event.target.value as ContentStatus | 'ALL')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              <option value="ALL">All statuses</option>
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <AdminIconButton label="Create content" tone="primary" onClick={openContentCreate}>
              <PlusIcon />
            </AdminIconButton>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.8fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span>Title</span>
            <span>Type</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-slate-200">
            {contentItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.8fr] items-center gap-3 px-6 py-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.summary || 'No summary'}</div>
                </div>
                <span className="text-slate-600">{item.type}</span>
                <span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${contentStatusLabel[item.status]}`}>
                    {item.status}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <AdminIconButton label="View detail" onClick={() => openContentDetail(item)}>
                    <EyeIcon />
                  </AdminIconButton>
                  <AdminIconButton label="Edit content" onClick={() => openContentEdit(item)}>
                    <EditIcon />
                  </AdminIconButton>
                  <AdminIconButton label="Delete content" tone="danger" onClick={() => openContentDelete(item)}>
                    <TrashIcon />
                  </AdminIconButton>
                </div>
              </div>
            ))}
            {contentItems.length === 0 && (
              <div className="px-6 py-6 text-sm text-slate-500">No content found.</div>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resource library</p>
            <h3 className="text-lg font-semibold text-slate-900">Templates, guides, references</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={resourceStatusFilter}
              onChange={(event) => setResourceStatusFilter(event.target.value as ContentStatus | 'ALL')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              <option value="ALL">All statuses</option>
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <AdminIconButton label="Create resource" tone="primary" onClick={openResourceCreate}>
              <PlusIcon />
            </AdminIconButton>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.8fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span>Title</span>
            <span>Type</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-slate-200">
            {resourceItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.6fr_0.6fr_0.6fr_0.8fr] items-center gap-3 px-6 py-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.description || item.url}</div>
                </div>
                <span className="text-slate-600">{item.type}</span>
                <span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${contentStatusLabel[item.status]}`}>
                    {item.status}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <AdminIconButton label="View detail" onClick={() => openResourceDetail(item)}>
                    <EyeIcon />
                  </AdminIconButton>
                  <AdminIconButton label="Edit resource" onClick={() => openResourceEdit(item)}>
                    <EditIcon />
                  </AdminIconButton>
                  <AdminIconButton label="Delete resource" tone="danger" onClick={() => openResourceDelete(item)}>
                    <TrashIcon />
                  </AdminIconButton>
                </div>
              </div>
            ))}
            {resourceItems.length === 0 && (
              <div className="px-6 py-6 text-sm text-slate-500">No resources found.</div>
            )}
          </div>
        </div>
      </div>
      <AdminModal
        open={contentModal === 'detail'}
        title="Content detail"
        onClose={() => setContentModal(null)}
        size="md"
      >
        {selectedContent ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Title</span>
              <span>{selectedContent.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Type</span>
              <span>{selectedContent.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span>{selectedContent.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tags</span>
              <span>{selectedContent.tags?.join(', ') || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Schedule</span>
              <span>
                {selectedContent.startAt ? new Date(selectedContent.startAt).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location</span>
              <span>{selectedContent.location || '—'}</span>
            </div>
            {selectedContent.externalUrl && (
              <a
                href={selectedContent.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                Open external link
              </a>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Select content to view details.</div>
        )}
      </AdminModal>

      <AdminModal
        open={contentModal === 'edit' || contentModal === 'create'}
        title={contentModal === 'edit' ? 'Edit content' : 'Create content'}
        onClose={() => setContentModal(null)}
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-500">
            Type
            <select
              value={contentForm.type}
              onChange={(event) => setContentForm((prev) => ({ ...prev, type: event.target.value as ContentType }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Status
            <select
              value={contentForm.status}
              onChange={(event) => setContentForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Title
            <input
              value={contentForm.title}
              onChange={(event) => setContentForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Title"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Summary
            <textarea
              value={contentForm.summary}
              onChange={(event) => setContentForm((prev) => ({ ...prev, summary: event.target.value }))}
              rows={2}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Body
            <textarea
              value={contentForm.body}
              onChange={(event) => setContentForm((prev) => ({ ...prev, body: event.target.value }))}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Start at
            <input
              type="datetime-local"
              value={contentForm.startAt}
              onChange={(event) => setContentForm((prev) => ({ ...prev, startAt: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500">
            End at
            <input
              type="datetime-local"
              value={contentForm.endAt}
              onChange={(event) => setContentForm((prev) => ({ ...prev, endAt: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500">
            Location
            <input
              value={contentForm.location}
              onChange={(event) => setContentForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="Ho Chi Minh"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500">
            External URL
            <input
              value={contentForm.externalUrl}
              onChange={(event) => setContentForm((prev) => ({ ...prev, externalUrl: event.target.value }))}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Tags (comma separated)
            <input
              value={contentForm.tags}
              onChange={(event) => setContentForm((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="startup, pitch, accelerator"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Cover URL
            <input
              value={contentForm.coverUrl}
              onChange={(event) => setContentForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleSaveContent}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              {contentForm.id ? 'Update content' : 'Create content'}
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={contentModal === 'delete'}
        title="Delete content"
        onClose={() => setContentModal(null)}
        size="sm"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>Are you sure you want to delete this content?</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setContentModal(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteContent}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
      </AdminModal>
      <AdminModal
        open={resourceModal === 'detail'}
        title="Resource detail"
        onClose={() => setResourceModal(null)}
        size="md"
      >
        {selectedResource ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Title</span>
              <span>{selectedResource.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Type</span>
              <span>{selectedResource.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span>{selectedResource.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tags</span>
              <span>{selectedResource.tags?.join(', ') || '—'}</span>
            </div>
            <a
              href={selectedResource.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Open resource
            </a>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Select resource to view details.</div>
        )}
      </AdminModal>

      <AdminModal
        open={resourceModal === 'edit' || resourceModal === 'create'}
        title={resourceModal === 'edit' ? 'Edit resource' : 'Create resource'}
        onClose={() => setResourceModal(null)}
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-500">
            Type
            <select
              value={resourceForm.type}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, type: event.target.value as ResourceType }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Status
            <select
              value={resourceForm.status}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, status: event.target.value as ContentStatus }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            >
              {CONTENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Title
            <input
              value={resourceForm.title}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Title"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Description
            <textarea
              value={resourceForm.description}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            URL
            <input
              value={resourceForm.url}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Tags (comma separated)
            <input
              value={resourceForm.tags}
              onChange={(event) => setResourceForm((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="pitch, template, checklist"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleSaveResource}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              {resourceForm.id ? 'Update resource' : 'Create resource'}
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={resourceModal === 'delete'}
        title="Delete resource"
        onClose={() => setResourceModal(null)}
        size="sm"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>Are you sure you want to delete this resource?</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setResourceModal(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteResource}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
      </AdminModal>
    </section>
  )
}
