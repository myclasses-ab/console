import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitute } from '@/context/InstituteContext';
import { inquiryApi, creditsApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import MobileListCard from '@/components/shared/MobileListCard';
import { Mail, X, Save, Phone, Calendar, User, BookOpen, Lock, Coins } from 'lucide-react';
import type { Inquiry } from '@/types';
import { InquiryStatus } from '@/types';
import { toast } from 'sonner';

const statusOptions: InquiryStatus[] = [
  InquiryStatus.NEW,
  InquiryStatus.CONTACTED,
  InquiryStatus.FOLLOW_UP,
  InquiryStatus.ENROLLED,
  InquiryStatus.NOT_INTERESTED,
  InquiryStatus.DROPPED,
];

const statusFilters: { label: string; value: InquiryStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'New', value: InquiryStatus.NEW },
  { label: 'Contacted', value: InquiryStatus.CONTACTED },
  { label: 'Follow Up', value: InquiryStatus.FOLLOW_UP },
  { label: 'Enrolled', value: InquiryStatus.ENROLLED },
  { label: 'Not Interested', value: InquiryStatus.NOT_INTERESTED },
  { label: 'Dropped', value: InquiryStatus.DROPPED },
];

const statusColors: Record<InquiryStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-purple-50 text-purple-700',
  FOLLOW_UP: 'bg-amber-50 text-amber-700',
  ENROLLED: 'bg-green-50 text-green-700',
  NOT_INTERESTED: 'bg-slate-100 text-slate-600',
  DROPPED: 'bg-red-50 text-red-700',
};

export default function LeadsPage() {
  const { institute } = useInstitute();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);

  const loadData = async (): Promise<Inquiry[]> => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return [];
    }
    setIsLoading(true);
    try {
      const [data, credit] = await Promise.all([
        inquiryApi.findByInstituteIdentifier(institute.identifier),
        creditsApi.getBalance(institute.identifier).catch(() => null),
      ]);
      setInquiries(data);
      setFilteredInquiries(data);
      setCreditBalance(credit?.balance ?? 0);
      return data;
    } catch (err) {
      console.error('Failed to load leads', err);
      toast.error('Failed to load leads');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredInquiries(inquiries);
    } else {
      setFilteredInquiries(inquiries.filter((i) => i.status === statusFilter));
    }
  }, [statusFilter, inquiries]);

  const openDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.instituteNotes || '');
  };

  const handleUpdateStatus = async (newStatus: InquiryStatus) => {
    if (!selectedInquiry) return;
    setIsSaving(true);
    try {
      await inquiryApi.update(selectedInquiry.identifier, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      const refreshed = await loadData();
      const updated = refreshed.find((i) => i.identifier === selectedInquiry.identifier);
      if (updated) {
        setSelectedInquiry(updated);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSaving(true);
    try {
      await inquiryApi.update(selectedInquiry.identifier, { instituteNotes: notes });
      toast.success('Notes saved');
      const refreshed = await loadData();
      const updated = refreshed.find((i) => i.identifier === selectedInquiry.identifier);
      if (updated) {
        setSelectedInquiry(updated);
      }
    } catch (err) {
      console.error('Failed to save notes', err);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlock = async (inquiry: Inquiry) => {
    if (!institute?.identifier) return;
    if (creditBalance < 1) {
      setShowNoCreditsModal(true);
      return;
    }
    setUnlockingId(inquiry.identifier);
    try {
      await inquiryApi.unlock(inquiry.identifier, institute.identifier);
      toast.success('Contact details unlocked');
      const refreshed = await loadData();
      const updated = refreshed.find((i) => i.identifier === inquiry.identifier);
      if (updated) {
        setSelectedInquiry(updated);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to unlock contact details');
    } finally {
      setUnlockingId(null);
    }
  };

  const displayName = (inquiry: Inquiry) => inquiry.studentName || inquiry.name || 'Student';
  const displayPhone = (inquiry: Inquiry) => inquiry.studentPhone || inquiry.phone || 'N/A';
  const displayCourse = (inquiry: Inquiry) => inquiry.courseName || inquiry.courseIdentifier || 'N/A';
  const displayCourseFee = (inquiry: Inquiry) => {
    const fee = inquiry.courseFee;
    if (fee == null || fee === '') return 'N/A';
    const numFee = Number(fee);
    if (Number.isNaN(numFee) || numFee <= 0) return 'N/A';
    return `₹${numFee.toLocaleString('en-IN')}`;
  };
  const displayDate = (inquiry: Inquiry) => {
    if (!inquiry.createdAt) return 'N/A';
    return new Date(inquiry.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Leads</h1>
        <p className="text-sm text-slate-500 mt-1">
          Student inquiries — {inquiries.length} total
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={Mail} title="No leads found" description="Leads matching the selected filter will appear here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Student</th>
                  <th className="text-left px-5 py-3 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 font-medium">Course</th>
                  <th className="text-left px-5 py-3 font-medium">Course Fee</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.identifier}
                    onClick={() => openDetail(inquiry)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium text-slate-900">{displayName(inquiry)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {displayPhone(inquiry)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {displayCourse(inquiry)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="font-medium">{displayCourseFee(inquiry)}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {displayDate(inquiry)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!inquiry.contactUnlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlock(inquiry);
                          }}
                          disabled={unlockingId === inquiry.identifier}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {unlockingId === inquiry.identifier ? 'Unlocking...' : 'Unlock 1 credit'}
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">Unlocked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredInquiries.map((inquiry) => (
              <MobileListCard
                key={inquiry.identifier}
                title={displayName(inquiry)}
                onClick={() => openDetail(inquiry)}
                subtitle={
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {displayPhone(inquiry)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {displayCourse(inquiry)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-xs text-slate-400">Fee:</span>
                      {displayCourseFee(inquiry)}
                    </div>
                  </div>
                }
                badge={
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                }
                meta={displayDate(inquiry)}
                actions={
                  !inquiry.contactUnlocked ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnlock(inquiry); }}
                      disabled={unlockingId === inquiry.identifier}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {unlockingId === inquiry.identifier ? '...' : '1 cr'}
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium px-2 py-1.5">Unlocked</span>
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {showNoCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNoCreditsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Not enough credits</h2>
            <p className="text-sm text-slate-600 mb-6">
              You don't have credit to unblock this lead. Buy credit from the credit page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowNoCreditsModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-white text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNoCreditsModal(false);
                  navigate('/credits');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedInquiry(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Lead Details</h2>
              <button onClick={() => setSelectedInquiry(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-slate-900">{displayName(selectedInquiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{displayPhone(selectedInquiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInquiry.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Course</p>
                  <p className="text-sm font-medium text-slate-900">{displayCourse(selectedInquiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Course Fee</p>
                  <p className="text-sm font-medium text-slate-900">{displayCourseFee(selectedInquiry)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Standard</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInquiry.standard || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Source</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInquiry.source}</p>
                </div>
              </div>

              {selectedInquiry.message && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Message</p>
                  <p className="text-sm text-slate-700">{selectedInquiry.message}</p>
                </div>
              )}

              {!selectedInquiry.contactUnlocked && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Contact details are masked</p>
                    <p className="text-xs text-amber-700">Unlock this lead to reveal the student name and phone number.</p>
                  </div>
                  <button
                    onClick={() => handleUnlock(selectedInquiry)}
                    disabled={unlockingId === selectedInquiry.identifier}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {unlockingId === selectedInquiry.identifier ? 'Unlocking...' : 'Unlock 1 credit'}
                  </button>
                </div>
              )}

              {/* Status Update */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedInquiry.status === status
                          ? statusColors[status]
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Institute Notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this lead..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
