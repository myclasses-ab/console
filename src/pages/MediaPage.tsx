import { useEffect, useRef, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { useAuth } from '@/hooks/useAuth';
import { mediaApi, uploadApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Upload, Trash2, ImageIcon, Star, Info } from 'lucide-react';
import { toast } from 'sonner';
import { instituteMediaUrl } from '@/lib/image-url';
import { MediaEntityType, MediaType } from '@/types/enums';
import type { Media } from '@/types';

const MAX_MEDIA_IMAGES = 15;
const MAX_STARRED_IMAGES = 3;
const MAX_FILE_SIZE_MB = 10;

export default function MediaPage() {
  const { institute } = useInstitute();
  const { user } = useAuth();

  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await mediaApi.findByInstituteIdentifierAndEntityType(
        institute.identifier,
        MediaEntityType.INSTITUTE
      );
      setMedia(
        data
          .filter((m) => m.mediaType === MediaType.IMAGE)
          .sort((a, b) => {
            const starDiff = Number(b.isFeatured) - Number(a.isFeatured);
            if (starDiff !== 0) return starDiff;
            return (a.displayOrder || 0) - (b.displayOrder || 0);
          })
      );
    } catch (err) {
      console.error('Failed to load media', err);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [institute?.identifier]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !institute?.identifier) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    if (media.length + imageFiles.length > MAX_MEDIA_IMAGES) {
      toast.error(`You can upload up to ${MAX_MEDIA_IMAGES} images only`);
      return;
    }

    const oversized = imageFiles.filter((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`Each image must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    try {
      await Promise.all(
        imageFiles.map(async (file, index) => {
          const identifier = crypto.randomUUID();
          const uploadResult = await uploadApi.uploadInstituteMediaImage(file, identifier);

          await mediaApi.create({
            identifier,
            instituteIdentifier: institute.identifier,
            branchIdentifier: null,
            entityType: MediaEntityType.INSTITUTE,
            mediaType: MediaType.IMAGE,
            url: uploadResult.key,
            thumbnailUrl: uploadResult.key,
            caption: '',
            altText: '',
            isFeatured: false,
            displayOrder: media.length + index,
            fileSizeKb: Math.round(file.size / 1024),
            uploadedBy: user?.identifier || '',
          });
        })
      );
      toast.success('Images uploaded successfully');
      await loadMedia();
    } catch (err) {
      console.error('Failed to upload media', err);
      toast.error('Failed to upload one or more images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleStar = async (item: Media) => {
    const willStar = !item.isFeatured;
    if (willStar) {
      const starredCount = media.filter((m) => m.isFeatured).length;
      if (starredCount >= MAX_STARRED_IMAGES) {
        toast.error(`You can star up to ${MAX_STARRED_IMAGES} images only`);
        return;
      }
    }

    try {
      await mediaApi.update(item.identifier, { ...item, isFeatured: willStar });
      toast.success(willStar ? 'Image starred' : 'Image unstarred');
      await loadMedia();
    } catch (err) {
      console.error('Failed to update star status', err);
      toast.error('Failed to update star status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.url) {
        await uploadApi.deleteFile(deleteTarget.url).catch(() => {
          // Ignore cleanup failures - the DB record is what matters
        });
      }
      await mediaApi.delete(deleteTarget.identifier);
      toast.success('Image deleted');
      await loadMedia();
    } catch (err) {
      console.error('Failed to delete media', err);
      toast.error('Failed to delete image');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const canAddMore = media.length < MAX_MEDIA_IMAGES;
  const starredCount = media.filter((m) => m.isFeatured).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showcase your institute with photos of classrooms, events, and facilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {media.length}/{MAX_MEDIA_IMAGES} images
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
            disabled={isUploading || !canAddMore}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !canAddMore}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Uploading...
              </>
            ) : (
              <>
                <Plus size={16} /> Add Images
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Info size={16} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-900">
            Star up to {MAX_STARRED_IMAGES} images
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            Starred images will be shown in the institute search card as a photo slider for students.
            You have starred {starredCount} of {MAX_STARRED_IMAGES} images.
          </p>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={ImageIcon}
            title="No media yet"
            description="Upload up to 15 images to show students your institute environment, events, and achievements."
            action={
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                <Upload size={16} /> Upload Images
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.identifier}
                className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={instituteMediaUrl(item.url)}
                    alt={item.altText || item.caption || 'Institute media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Star toggle */}
                <button
                  onClick={() => handleToggleStar(item)}
                  className={`absolute top-2 left-2 p-1.5 rounded-lg shadow-sm transition-colors ${
                    item.isFeatured
                      ? 'bg-amber-100 text-amber-500'
                      : 'bg-white/90 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                  }`}
                  aria-label={item.isFeatured ? 'Unstar image' : 'Star image'}
                  title={item.isFeatured ? 'Starred' : 'Star this image'}
                >
                  <Star
                    size={16}
                    className={item.isFeatured ? 'fill-amber-500' : ''}
                  />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                  aria-label="Delete image"
                >
                  <Trash2 size={16} />
                </button>

                {/* Starred badge */}
                {item.isFeatured && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-amber-500" />
                    Starred
                  </div>
                )}
              </div>
            ))}
          </div>

          {canAddMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Upload size={16} /> Upload More Images
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
