import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { mediaApi, branchApi, uploadApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2, Image, Video, FileText, Upload } from 'lucide-react';
import type { Media } from '@/types';
import { MediaType, MediaEntityType } from '@/types';
import { toast } from 'sonner';
import { mediaImageUrl } from '@/lib/image-url';

const emptyMedia: Partial<Media> = {
  branchIdentifier: '',
  entityType: MediaEntityType.INSTITUTE,
  mediaType: MediaType.IMAGE,
  url: '',
  thumbnailUrl: '',
  caption: '',
  altText: '',
  isFeatured: false,
  displayOrder: 0,
};

export default function MediaPage() {
  const { institute } = useInstitute();
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [branches, setBranches] = useState<{ identifier: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Partial<Media> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Media | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [m, b] = await Promise.all([
        mediaApi.findByInstituteIdentifier(institute.identifier),
        branchApi.findByInstituteIdentifier(institute.identifier),
      ]);
      setMediaItems(m);
      setBranches(b);
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAdd = () => {
    setEditingMedia({ ...emptyMedia, instituteIdentifier: institute?.identifier || '' });
    setModalOpen(true);
  };

  const openEdit = (m: Media) => {
    setEditingMedia({ ...m });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingMedia) return;
    setIsSaving(true);
    try {
      if (editingMedia.identifier) {
        await mediaApi.update(editingMedia.identifier, editingMedia);
      } else {
        await mediaApi.create(editingMedia as Omit<Media, 'identifier'>);
      }
      await loadData();
      toast.success('Saved successfully');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await mediaApi.delete(deleteConfirm.identifier);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingMedia((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getMediaIcon = (type: MediaType) => {
    if (type === MediaType.VIDEO || type === MediaType.YOUTUBE_LINK) return Video;
    if (type === MediaType.DOCUMENT) return FileText;
    return Image;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">Manage photos, videos, and documents</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Media
        </button>
      </div>

      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Image}
            title="No media yet"
            description="Upload images, videos, or documents"
            action={
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                <Plus size={16} /> Add Media
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaItems.map((item) => {
            const Icon = getMediaIcon(item.mediaType);
            return (
              <div
                key={item.identifier}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group"
              >
                <div className="aspect-video bg-slate-100 relative">
                  {item.url && (item.mediaType === 'IMAGE' || item.mediaType === 'VIDEO') ? (
                    <img
                      src={mediaImageUrl(item.thumbnailUrl || item.url)}
                      alt={item.altText || item.caption}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon size={40} className="text-slate-300" />
                    </div>
                  )}
                  {item.isFeatured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                      Featured
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 shadow-sm"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-500 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.caption || 'Untitled'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.mediaType}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              {editingMedia.identifier ? 'Edit Media' : 'Add Media'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Media</label>
                <div className="flex gap-2">
                  <input
                    value={editingMedia.url || ''}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder="Media URL or upload file"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors">
                    <Upload size={16} />
                    {isUploading ? '...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const result = await uploadApi.upload(file, 'media');
                          // Store the object key, not the full URL
                          handleChange('url', result.key);
                          handleChange('thumbnailUrl', result.key);
                          toast.success('Media uploaded successfully');
                        } catch (err) {
                          toast.error('Failed to upload media');
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>
                {editingMedia.url && (editingMedia.mediaType === 'IMAGE' || editingMedia.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                  <img src={mediaImageUrl(editingMedia.url)} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-slate-200" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Thumbnail URL</label>
                <input
                  value={editingMedia.thumbnailUrl || ''}
                  onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Caption</label>
                <input
                  value={editingMedia.caption || ''}
                  onChange={(e) => handleChange('caption', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alt Text</label>
                <input
                  value={editingMedia.altText || ''}
                  onChange={(e) => handleChange('altText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Media Type</label>
                  <select
                    value={editingMedia.mediaType || ''}
                    onChange={(e) => handleChange('mediaType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="YOUTUBE_LINK">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label>
                  <select
                    value={editingMedia.branchIdentifier || ''}
                    onChange={(e) => handleChange('branchIdentifier', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.identifier} value={b.identifier}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMedia.isFeatured || false}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Media"
        description={`Are you sure you want to delete "${deleteConfirm?.caption || 'this media'}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
