import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { instituteFacilityApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Shield, Save } from 'lucide-react';
import type { InstituteFacility } from '@/types';
import { toast } from 'sonner';

const facilityFields = [
  { key: 'hasLibrary', label: 'Library' },
  { key: 'hasHostel', label: 'Hostel' },
  { key: 'hasCanteen', label: 'Canteen' },
  { key: 'hasTransport', label: 'Transport' },
  { key: 'hasAcClassrooms', label: 'AC Classrooms' },
  { key: 'hasDigitalBoards', label: 'Digital Boards' },
  { key: 'hasLaboratory', label: 'Laboratory' },
  { key: 'hasStudyRoom', label: 'Study Room' },
  { key: 'hasWifi', label: 'WiFi' },
  { key: 'hasCctv', label: 'CCTV' },
  { key: 'hasOnlinePortal', label: 'Online Portal' },
  { key: 'hasDoubtSessions', label: 'Doubt Sessions' },
  { key: 'hasMockTestSeries', label: 'Mock Test Series' },
  { key: 'hasStudyMaterial', label: 'Study Material' },
  { key: 'hasCrashCourses', label: 'Crash Courses' },
  { key: 'hasScholarshipProgram', label: 'Scholarship Program' },
  { key: 'hasFreeDemoClass', label: 'Free Demo Class' },
  { key: 'hasParentTeacherMeetings', label: 'Parent Teacher Meetings' },
  { key: 'hasPerformanceTracking', label: 'Performance Tracking' },
];

export default function FacilitiesPage() {
  const { institute } = useInstitute();
  const [facility, setFacility] = useState<InstituteFacility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<Partial<InstituteFacility>>({});

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await instituteFacilityApi.findByInstituteIdentifier(institute.identifier);
      if (data) {
        setFacility(data);
        setFormData({ ...data });
      }
    } catch (err) {
      console.error('Failed to load facilities', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  const handleToggle = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!facility?.identifier) {
      // Create new facility record
      if (!institute?.identifier) return;
      setIsSaving(true);
      try {
        await instituteFacilityApi.create({
          ...formData,
          instituteIdentifier: institute.identifier,
        } as Omit<InstituteFacility, 'identifier'>);
        await loadData();
        toast.success('Facilities saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        toast.error('Failed to save facilities');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      await instituteFacilityApi.update(facility.identifier, formData);
      await loadData();
      toast.success('Facilities saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      toast.error('Failed to save facilities');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!facility && !isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facilities</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your institute facilities</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Facilities'}
          </button>
        </div>
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <EmptyState icon={Shield} title="No facility record" description="Create your facility profile" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilityFields.map((f) => (
              <label key={f.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={(formData as any)[f.key] || false}
                  onChange={(e) => handleToggle(f.key, e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600"
                />
                <span className="text-sm font-medium text-slate-700">{f.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Student-to-Teacher Ratio</label>
              <input
                type="text"
                value={formData.studentToTeacherRatio || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, studentToTeacherRatio: e.target.value }))}
                placeholder="e.g. 15:1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facilities</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your institute facilities</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Facilities'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Available Facilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilityFields.map((f) => (
            <label key={f.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={(formData as any)[f.key] || false}
                onChange={(e) => handleToggle(f.key, e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary-600"
              />
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Student-to-Teacher Ratio</label>
            <input
              type="text"
              value={formData.studentToTeacherRatio || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, studentToTeacherRatio: e.target.value }))}
              placeholder="e.g. 15:1"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
