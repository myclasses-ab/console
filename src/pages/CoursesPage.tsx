import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { instituteCourseApi, branchApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import MobileListCard from '@/components/shared/MobileListCard';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import type { InstituteCourse, Branch } from '@/types';
import { toast } from 'sonner';

const emptyCourse: Partial<InstituteCourse> = {
  branchIdentifier: '',
  courseName: '',
  fee: 0,
  scholarshipAvailable: false,
  scholarshipDetails: '',
  durationMonths: 0,
  studyMaterialIncluded: false,
  testSeriesIncluded: false,
  recordedLecturesAvailable: false,
  admissionOpen: false,
};

export default function CoursesPage() {
  const { institute } = useInstitute();
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<InstituteCourse> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InstituteCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [c, b] = await Promise.all([
        instituteCourseApi.findByInstituteIdentifier(institute.identifier),
        branchApi.findByInstituteIdentifier(institute.identifier),
      ]);
      setCourses(c);
      setBranches(b);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const openAdd = () => {
    setEditingCourse({ ...emptyCourse, instituteIdentifier: institute?.identifier || '' });
    setModalOpen(true);
  };

  const openEdit = (course: InstituteCourse) => {
    setEditingCourse({ ...course });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingCourse) return;
    setIsSaving(true);
    try {
      if (editingCourse.identifier) {
        await instituteCourseApi.update(editingCourse.identifier, editingCourse);
      } else {
        await instituteCourseApi.create(editingCourse as Omit<InstituteCourse, 'identifier'>);
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
      await instituteCourseApi.delete(deleteConfirm.identifier);
      await loadData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingCourse((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getBranchName = (id: string | null) => {
    if (!id) return 'N/A';
    return branches.find((b) => b.identifier === id)?.name || id.slice(0, 8);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your institute courses</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Add your first course to get started"
            action={
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                <Plus size={16} /> Add Course
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Course Name</th>
                  <th className="text-left px-5 py-3 font-medium">Branch</th>
                  <th className="text-left px-5 py-3 font-medium">Fee</th>
                  <th className="text-left px-5 py-3 font-medium">Duration</th>
                  <th className="text-left px-5 py-3 font-medium">Admission</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.identifier} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{course.courseName || 'Untitled Course'}</td>
                    <td className="px-5 py-3 text-slate-600">{getBranchName(course.branchIdentifier)}</td>
                    <td className="px-5 py-3 text-slate-600">
                      ₹{Number(course.fee).toLocaleString() || 0}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{course.durationMonths} months</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.admissionOpen ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {course.admissionOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(course)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {courses.map((course) => (
              <MobileListCard
                key={course.identifier}
                title={course.courseName || 'Untitled Course'}
                subtitle={
                  <div className="space-y-0.5">
                    <div>{getBranchName(course.branchIdentifier)}</div>
                    <div className="text-xs text-slate-500">
                      ₹{Number(course.fee).toLocaleString() || 0} · {course.durationMonths} months
                    </div>
                  </div>
                }
                badge={
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.admissionOpen ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {course.admissionOpen ? 'Admission Open' : 'Admission Closed'}
                  </span>
                }
                actions={
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(course); }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                      aria-label="Edit course"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(course); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      aria-label="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              {editingCourse.identifier ? 'Edit Course' : 'Add Course'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label>
                <select
                  value={editingCourse.branchIdentifier || ''}
                  onChange={(e) => handleChange('branchIdentifier', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.identifier} value={b.identifier}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Name</label>
                <input
                  value={editingCourse.courseName || ''}
                  onChange={(e) => handleChange('courseName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fee (₹)</label>
                <input
                  type="number"
                  value={editingCourse.fee || ''}
                  onChange={(e) => handleChange('fee', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (months)</label>
                <input
                  type="number"
                  value={editingCourse.durationMonths || ''}
                  onChange={(e) => handleChange('durationMonths', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { label: 'Scholarship', field: 'scholarshipAvailable' },
                  { label: 'Study Material', field: 'studyMaterialIncluded' },
                  { label: 'Test Series', field: 'testSeriesIncluded' },
                  { label: 'Recorded Lectures', field: 'recordedLecturesAvailable' },
                  { label: 'Admission Open', field: 'admissionOpen' },
                ].map((t) => (
                  <label key={t.field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(editingCourse as any)[t.field] || false}
                      onChange={(e) => handleChange(t.field, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600"
                    />
                    <span className="text-sm text-slate-700">{t.label}</span>
                  </label>
                ))}
              </div>
              {editingCourse.scholarshipAvailable && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Scholarship Details</label>
                  <textarea
                    value={editingCourse.scholarshipDetails || ''}
                    onChange={(e) => handleChange('scholarshipDetails', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteConfirm?.courseName || 'this course'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
