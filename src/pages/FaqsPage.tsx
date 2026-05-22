import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { faqApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown } from 'lucide-react';
import type { Faq } from '@/types';
import { toast } from 'sonner';

const emptyFaq: Partial<Faq> = {
  question: '',
  answer: '',
  displayOrder: 0,
  isActive: true,
};

export default function FaqsPage() {
  const { institute } = useInstitute();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Faq | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await faqApi.findByInstituteIdentifier(institute.identifier);
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAdd = () => {
    setEditingFaq({ ...emptyFaq, instituteIdentifier: institute?.identifier || '' });
    setModalOpen(true);
  };

  const openEdit = (f: Faq) => {
    setEditingFaq({ ...f });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingFaq) return;
    setIsSaving(true);
    try {
      if (editingFaq.identifier) {
        await faqApi.update(editingFaq.identifier, editingFaq);
      } else {
        await faqApi.create(editingFaq as Omit<Faq, 'identifier'>);
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
      await faqApi.delete(deleteConfirm.identifier);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingFaq((prev) => (prev ? { ...prev, [field]: value } : null));
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
          <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={HelpCircle} title="No FAQs yet" description="Add FAQs to help students" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {faqs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((faq) => (
              <div key={faq.identifier} className="group">
                <button
                  onClick={() => setExpandedId(expandedId === faq.identifier ? null : faq.identifier)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400 w-6">{faq.displayOrder}</span>
                    <span className="text-sm font-medium text-slate-900">{faq.question}</span>
                    {!faq.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(faq);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(faq);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform ${expandedId === faq.identifier ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {expandedId === faq.identifier && (
                  <div className="px-5 pb-4 pl-14">
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">{editingFaq.identifier ? 'Edit FAQ' : 'Add FAQ'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Question</label>
                <input
                  value={editingFaq.question || ''}
                  onChange={(e) => handleChange('question', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Answer</label>
                <textarea
                  value={editingFaq.answer || ''}
                  onChange={(e) => handleChange('answer', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={editingFaq.displayOrder || ''}
                    onChange={(e) => handleChange('displayOrder', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={editingFaq.isActive ?? true}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete FAQ"
        description={`Are you sure you want to delete this FAQ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
