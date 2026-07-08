import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { resultApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import type { Result } from '@/types';
import { toast } from 'sonner';

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
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

function StudentPhoto({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const [error, setError] = useState(false);

  if (!photoUrl || error) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold uppercase"
        style={{ backgroundColor: getAvatarColor(name) }}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={name}
      className="w-10 h-10 rounded-full object-cover bg-slate-100"
      onError={() => setError(true)}
    />
  );
}

const emptyResult: Partial<Result> = {
  exam: '',
  studentName: '',
  studentPhotoUrl: '',
  value: '',
  testimonialQuote: '',
  isFeatured: false,
  displayOrder: 0,
};

export default function ResultsPage() {
  const { institute } = useInstitute();
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Partial<Result> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ item: Result } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const r = await resultApi.findByInstituteIdentifier(institute.identifier);
      setResults(r);
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAddResult = () => {
    setEditingResult({ ...emptyResult, instituteIdentifier: institute?.identifier || '' });
    setModalOpen(true);
  };

  const openEditResult = (r: Result) => {
    setEditingResult({ ...r });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingResult) return;
    setIsSaving(true);
    try {
      if (editingResult.identifier) {
        await resultApi.update(editingResult.identifier, editingResult);
      } else {
        await resultApi.create(editingResult as Omit<Result, 'identifier'>);
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
      await resultApi.delete(deleteConfirm.item.identifier);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingResult((prev) => (prev ? { ...prev, [field]: value } : null));
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
          <h1 className="text-2xl font-bold text-slate-900">Results</h1>
          <p className="text-sm text-slate-500 mt-1">Showcase your institute achievements</p>
        </div>
        <button
          onClick={openAddResult}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Result
        </button>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={Trophy} title="No results yet" description="Add student results to showcase achievements" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Student</th>
                <th className="text-left px-5 py-3 font-medium">Exam</th>
                <th className="text-left px-5 py-3 font-medium">Score</th>
                <th className="text-left px-5 py-3 font-medium">Featured</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.identifier} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <StudentPhoto name={r.studentName} photoUrl={r.studentPhotoUrl} />
                      <span className="font-medium text-slate-900">{r.studentName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.exam || '-'}</td>
                  <td className="px-5 py-3 text-slate-600">{r.value || '-'}</td>
                  <td className="px-5 py-3">
                    {r.isFeatured ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Featured</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditResult(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteConfirm({ item: r })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              {editingResult?.identifier ? 'Edit Result' : 'Add Result'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Name</label>
                <input value={editingResult?.studentName || ''} onChange={(e) => handleChange('studentName', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Photo URL</label>
                <input value={editingResult?.studentPhotoUrl || ''} onChange={(e) => handleChange('studentPhotoUrl', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                <input value={editingResult?.exam || ''} onChange={(e) => handleChange('exam', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Score</label>
                <input value={editingResult?.value || ''} onChange={(e) => handleChange('value', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingResult?.isFeatured || false} onChange={(e) => handleChange('isFeatured', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Result"
        description="Are you sure you want to delete this result? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
