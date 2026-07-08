import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { facultyApi, uploadApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2, Users, Upload } from 'lucide-react';
import type { Faculty } from '@/types';
import { toast } from 'sonner';
import { facultyImageUrl } from '@/lib/image-url';

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#14b8a6', '#0ea5e9', '#a855f7', '#ec4899',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function FacultyAvatar({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imageUrl = photoUrl ? facultyImageUrl(photoUrl) : null;
  const showImage = !!imageUrl && status === 'loaded';

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
      <div
        className={`absolute inset-0 flex items-center justify-center text-white text-sm font-bold uppercase transition-opacity duration-200 ${
          showImage ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        {getInitials(name)}
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            showImage ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

const emptyFaculty: Partial<Faculty> = {
  name: '',
  photoUrl: '',
  subject: '',
  qualification: '',
  experienceYears: 0,
  displayOrder: 0,
  subjectIdentifiers: [],
  examTypeIdentifiers: [],
};

export default function FacultyPage() {
  const { institute } = useInstitute();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Partial<Faculty> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Faculty | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await facultyApi.findByInstituteIdentifier(institute.identifier);
      setFaculty(data);
    } catch (err) {
      console.error('Failed to load faculty', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAdd = () => {
    setIsEditMode(false);
    setEditingFaculty({ ...emptyFaculty, instituteIdentifier: institute?.identifier || '', identifier: crypto.randomUUID() });
    setModalOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setIsEditMode(true);
    setEditingFaculty({ ...f });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingFaculty) return;
    setIsSaving(true);
    try {
      if (isEditMode) {
        await facultyApi.update(editingFaculty.identifier!, editingFaculty);
      } else {
        await facultyApi.create(editingFaculty);
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
      await facultyApi.delete(deleteConfirm.identifier);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingFaculty((prev) => (prev ? { ...prev, [field]: value } : null));
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
          <h1 className="text-2xl font-bold text-slate-900">Faculty</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your institute faculty</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {faculty.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Users}
            title="No faculty yet"
            description="Add your first faculty member to get started"
            action={
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                <Plus size={16} /> Add Faculty
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Faculty</th>
                  <th className="text-left px-5 py-3 font-medium">Subject</th>
                  <th className="text-left px-5 py-3 font-medium">Experience</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {faculty.map((f) => (
                  <tr key={f.identifier} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <FacultyAvatar photoUrl={f.photoUrl} name={f.name} />
                        <div>
                          <p className="font-medium text-slate-900">{f.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{f.subject}</td>
                    <td className="px-5 py-3 text-slate-600">{f.experienceYears} years</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(f)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              {isEditMode ? 'Edit Faculty' : 'Add Faculty'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input
                  value={editingFaculty.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo</label>
                <div className="flex gap-2">
                  <input
                    value={editingFaculty.photoUrl || ''}
                    onChange={(e) => handleChange('photoUrl', e.target.value)}
                    placeholder="Photo URL or upload below"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors">
                    <Upload size={16} />
                    {isUploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !editingFaculty?.identifier) return;
                        setIsUploading(true);
                        try {
                          // Pass old photo key to delete it before uploading new one
                          const oldPhotoKey = editingFaculty.photoUrl;
                          const result = await uploadApi.uploadFacultyImage(file, editingFaculty.identifier, oldPhotoKey);
                          // Store the object key, not the full URL
                          handleChange('photoUrl', result.key);
                          toast.success('Photo uploaded successfully');
                        } catch (err) {
                          toast.error('Failed to upload photo');
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </label>
                </div>
                {editingFaculty.photoUrl && (
                  <img src={facultyImageUrl(editingFaculty.photoUrl)} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-slate-200" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input
                  value={editingFaculty.subject || ''}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualification</label>
                <input
                  value={editingFaculty.qualification || ''}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience (years)</label>
                <input
                  type="number"
                  value={editingFaculty.experienceYears || ''}
                  onChange={(e) => handleChange('experienceYears', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Faculty"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
