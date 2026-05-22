import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { leadDistributionApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Phone, Calendar, Eye, UserCheck, X, User, Mail, FileText, Save, Pencil } from 'lucide-react';
import type { LeadDistribution } from '@/types';
import { LeadDistributionStatus } from '@/types';
import { toast } from 'sonner';

const statusConfig: Record<LeadDistributionStatus, { label: string; color: string; icon: typeof Eye }> = {
  [LeadDistributionStatus.PENDING]: { label: 'New Lead', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye },
  [LeadDistributionStatus.VIEWED]: { label: 'Viewed', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Eye },
  [LeadDistributionStatus.CONTACTED]: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Phone },
  [LeadDistributionStatus.CONVERTED]: { label: 'Converted', color: 'bg-green-50 text-green-700 border-green-200', icon: UserCheck },
  [LeadDistributionStatus.EXPIRED]: { label: 'Expired', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: X },
};

const statusFilters: { label: string; value: LeadDistributionStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'New Lead', value: LeadDistributionStatus.PENDING },
  { label: 'Viewed', value: LeadDistributionStatus.VIEWED },
  { label: 'Contacted', value: LeadDistributionStatus.CONTACTED },
  { label: 'Converted', value: LeadDistributionStatus.CONVERTED },
  { label: 'Expired', value: LeadDistributionStatus.EXPIRED },
];

const statusActions: { status: LeadDistributionStatus; label: string }[] = [
  { status: LeadDistributionStatus.VIEWED, label: 'Mark as Viewed' },
  { status: LeadDistributionStatus.CONTACTED, label: 'Mark as Contacted' },
  { status: LeadDistributionStatus.CONVERTED, label: 'Mark as Converted' },
];

export default function LeadsPage() {
  const { institute } = useInstitute();
  const [distributions, setDistributions] = useState<LeadDistribution[]>([]);
  const [filteredDistributions, setFilteredDistributions] = useState<LeadDistribution[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadDistributionStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDistribution | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await leadDistributionApi.getByInstitute(institute.identifier);
      setDistributions(data);
      setFilteredDistributions(data);
    } catch (err) {
      console.error('Failed to load leads', err);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredDistributions(distributions);
    } else {
      setFilteredDistributions(distributions.filter((d) => d.status === statusFilter));
    }
  }, [statusFilter, distributions]);

  useEffect(() => {
    if (selectedLead) {
      setNoteDraft(selectedLead.instituteNotes || '');
    }
  }, [selectedLead]);

  const handleUpdateStatus = async (identifier: string, status: LeadDistributionStatus) => {
    try {
      await leadDistributionApi.updateStatus(identifier, status);
      toast.success(`Lead marked as ${status.toLowerCase()}`);
      await loadData();
      if (selectedLead?.identifier === identifier) {
        setSelectedLead((prev: LeadDistribution | null) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedLead) return;
    setSavingNote(true);
    try {
      await leadDistributionApi.updateNotes(selectedLead.identifier, noteDraft);
      toast.success('Note saved');
      await loadData();
      setSelectedLead((prev) => (prev ? { ...prev, instituteNotes: noteDraft } : null));
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const getStatusBadge = (status: LeadDistributionStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!institute?.identifier) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState icon={User} title="No Institute" description="Please set up your institute profile first" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Leads sent by admin — {distributions.length} total</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredDistributions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={Mail} title="No leads found" description="Leads matching the selected filter will appear here" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Student</th>
                  <th className="text-left px-5 py-3 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 font-medium">Received</th>
                  <th className="text-left px-5 py-3 font-medium">Notes</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDistributions.map((dist) => (
                  <tr
                    key={dist.identifier}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(dist)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {dist.userName || 'Student'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {dist.userPhone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(dist.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {dist.instituteNotes ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 max-w-[180px] truncate">
                          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{dist.instituteNotes}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Pencil className="w-3 h-3" />
                          Add note
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(dist.status)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(dist);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedLead.userName || 'Student Lead'}</p>
                    <p className="text-xs text-gray-500">Phone: {selectedLead.userPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {getStatusBadge(selectedLead.status)}
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Received</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedLead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs text-amber-600 font-medium mb-1">Admin Notes</p>
                    <p className="text-sm text-amber-800">{selectedLead.notes}</p>
                  </div>
                )}

                {/* Institute Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Your Notes
                  </label>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Write notes about this student..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statusActions
                      .filter((a) => a.status !== selectedLead.status)
                      .map((action) => (
                        <button
                          key={action.status}
                          onClick={() => handleUpdateStatus(selectedLead.identifier, action.status)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
