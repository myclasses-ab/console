import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { resultApi, awardAndRecognitionApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2, Trophy, Award } from 'lucide-react';
import type { Result, AwardAndRecognition } from '@/types';
import { RankOrScoreType } from '@/types';
import { toast } from 'sonner';

const emptyResult: Partial<Result> = {
  examTypeIdentifier: '',
  examYear: new Date().getFullYear(),
  studentName: '',
  studentPhotoUrl: '',
  rankOrScoreType: RankOrScoreType.AIR_RANK,
  value: '',
  collegeAdmitted: '',
  testimonialQuote: '',
  isVerified: false,
  isFeatured: false,
  displayOrder: 0,
};

const emptyAward: Partial<AwardAndRecognition> = {
  title: '',
  issuingBody: '',
  year: new Date().getFullYear(),
  description: '',
  certificateUrl: '',
  isVerified: false,
  displayOrder: 0,
};

export default function ResultsPage() {
  const { institute } = useInstitute();
  const [activeTab, setActiveTab] = useState<'results' | 'awards'>('results');
  const [results, setResults] = useState<Result[]>([]);
  const [awards, setAwards] = useState<AwardAndRecognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Partial<Result> | null>(null);
  const [editingAward, setEditingAward] = useState<Partial<AwardAndRecognition> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'result' | 'award'; item: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [r, a] = await Promise.all([
        resultApi.findByInstituteIdentifier(institute.identifier),
        awardAndRecognitionApi.findByInstituteIdentifier(institute.identifier),
      ]);
      setResults(r);
      setAwards(a);
    } catch (err) {
      console.error('Failed to load results/awards', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAddResult = () => {
    setEditingResult({ ...emptyResult, instituteIdentifier: institute?.identifier || '' });
    setEditingAward(null);
    setModalOpen(true);
  };

  const openAddAward = () => {
    setEditingAward({ ...emptyAward, instituteIdentifier: institute?.identifier || '' });
    setEditingResult(null);
    setModalOpen(true);
  };

  const openEditResult = (r: Result) => {
    setEditingResult({ ...r });
    setEditingAward(null);
    setModalOpen(true);
  };

  const openEditAward = (a: AwardAndRecognition) => {
    setEditingAward({ ...a });
    setEditingResult(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'results' && editingResult) {
        if (editingResult.identifier) {
          await resultApi.update(editingResult.identifier, editingResult);
        } else {
          await resultApi.create(editingResult as Omit<Result, 'identifier'>);
        }
      } else if (activeTab === 'awards' && editingAward) {
        if (editingAward.identifier) {
          await awardAndRecognitionApi.update(editingAward.identifier, editingAward);
        } else {
          await awardAndRecognitionApi.create(editingAward as Omit<AwardAndRecognition, 'identifier'>);
        }
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
      if (deleteConfirm.type === 'result') {
        await resultApi.delete(deleteConfirm.item.identifier);
      } else {
        await awardAndRecognitionApi.delete(deleteConfirm.item.identifier);
      }
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    if (editingResult) setEditingResult((prev) => (prev ? { ...prev, [field]: value } : null));
    if (editingAward) setEditingAward((prev) => (prev ? { ...prev, [field]: value } : null));
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
          <h1 className="text-2xl font-bold text-slate-900">Results & Awards</h1>
          <p className="text-sm text-slate-500 mt-1">Showcase your institute achievements</p>
        </div>
        <button
          onClick={activeTab === 'results' ? openAddResult : openAddAward}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add {activeTab === 'results' ? 'Result' : 'Award'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'awards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Awards
        </button>
      </div>

      {activeTab === 'results' ? (
        results.length === 0 ? (
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
                  <th className="text-left px-5 py-3 font-medium">Year</th>
                  <th className="text-left px-5 py-3 font-medium">Rank/Score</th>
                  <th className="text-left px-5 py-3 font-medium">Featured</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr key={r.identifier} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{r.studentName}</td>
                    <td className="px-5 py-3 text-slate-600">{r.examTypeIdentifier.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-slate-600">{r.examYear}</td>
                    <td className="px-5 py-3 text-slate-600">{r.value}</td>
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
                        <button onClick={() => setDeleteConfirm({ type: 'result', item: r })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : awards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={Award} title="No awards yet" description="Add awards and recognitions" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Title</th>
                <th className="text-left px-5 py-3 font-medium">Issuing Body</th>
                <th className="text-left px-5 py-3 font-medium">Year</th>
                <th className="text-left px-5 py-3 font-medium">Verified</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {awards.map((a) => (
                <tr key={a.identifier} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{a.title}</td>
                  <td className="px-5 py-3 text-slate-600">{a.issuingBody}</td>
                  <td className="px-5 py-3 text-slate-600">{a.year}</td>
                  <td className="px-5 py-3">
                    {a.isVerified ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Verified</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditAward(a)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'award', item: a })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
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
              {editingResult?.identifier ? 'Edit Result' : editingAward?.identifier ? 'Edit Award' : activeTab === 'results' ? 'Add Result' : 'Add Award'}
            </h2>
            {editingResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Name</label>
                  <input value={editingResult.studentName || ''} onChange={(e) => handleChange('studentName', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Type ID</label>
                  <input value={editingResult.examTypeIdentifier || ''} onChange={(e) => handleChange('examTypeIdentifier', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Year</label>
                  <input type="number" value={editingResult.examYear || ''} onChange={(e) => handleChange('examYear', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Rank/Score Type</label>
                  <select value={editingResult.rankOrScoreType || ''} onChange={(e) => handleChange('rankOrScoreType', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="AIR_RANK">AIR Rank</option>
                    <option value="STATE_RANK">State Rank</option>
                    <option value="PERCENTILE">Percentile</option>
                    <option value="MARKS">Marks</option>
                    <option value="SELECTION">Selection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Value</label>
                  <input value={editingResult.value || ''} onChange={(e) => handleChange('value', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">College Admitted</label>
                  <input value={editingResult.collegeAdmitted || ''} onChange={(e) => handleChange('collegeAdmitted', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center gap-6">
                  {[{ label: 'Featured', field: 'isFeatured' }, { label: 'Verified', field: 'isVerified' }].map((t) => (
                    <label key={t.field} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(editingResult as any)[t.field] || false} onChange={(e) => handleChange(t.field, e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                      <span className="text-sm text-slate-700">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input value={editingAward?.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Issuing Body</label>
                  <input value={editingAward?.issuingBody || ''} onChange={(e) => handleChange('issuingBody', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                  <input type="number" value={editingAward?.year || ''} onChange={(e) => handleChange('year', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea value={editingAward?.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Certificate URL</label>
                  <input value={editingAward?.certificateUrl || ''} onChange={(e) => handleChange('certificateUrl', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingAward?.isVerified || false} onChange={(e) => handleChange('isVerified', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                    <span className="text-sm text-slate-700">Verified</span>
                  </label>
                </div>
              </div>
            )}
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
        title={`Delete ${deleteConfirm?.type === 'result' ? 'Result' : 'Award'}`}
        description={`Are you sure you want to delete this ${deleteConfirm?.type}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
