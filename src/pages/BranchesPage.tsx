import { useEffect, useRef, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { branchApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import MobileListCard from '@/components/shared/MobileListCard';
import { Plus, Pencil, Trash2, MapPin, Star, X } from 'lucide-react';
import { CITIES } from '@/components/helper/cities';
import type { Branch } from '@/types';
import { toast } from 'sonner';

const emptyBranch: Partial<Branch> = {
  name: '',
  address: '',
  landmark: '',
  cityName: '',
  serviceCities: [],
  state: '',
  pincode: '',
  latitude: '',
  longitude: '',
  googleMapsUrl: '',
  phone: '',
  email: '',
  operatingHoursStart: '',
  operatingHoursEnd: '',
  operatingDays: '',
  isMainBranch: false,
  isOnlineOnly: false,
};

export default function BranchesPage() {
  const { institute } = useInstitute();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const loadBranches = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await branchApi.findByInstituteIdentifier(institute.identifier);
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [institute?.identifier]);

  const openAdd = () => {
    setEditingBranch({ ...emptyBranch, instituteIdentifier: institute?.identifier || '' });
    setCityInput('');
    setShowCitySuggestions(false);
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    const serviceCities =
      branch.serviceCities && branch.serviceCities.length > 0
        ? [...branch.serviceCities]
        : branch.cityName
          ? [branch.cityName]
          : [];
    setEditingBranch({ ...branch, serviceCities });
    setCityInput('');
    setShowCitySuggestions(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingBranch) return;
    if (!editingBranch.googleMapsUrl?.trim()) {
      toast.error('Google Maps URL is required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingBranch.identifier) {
        await branchApi.update(editingBranch.identifier, editingBranch);
      } else {
        await branchApi.create(editingBranch as Omit<Branch, 'identifier'>);
      }
      await loadBranches();
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
      await branchApi.delete(deleteConfirm.identifier);
      await loadBranches();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditingBranch((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getServiceCities = () => editingBranch?.serviceCities || [];

  const setPrimaryCity = (value: string) => {
    const current = getServiceCities();
    const trimmed = value.trim();
    const additional = current.slice(1);
    // Remove the new primary from additional cities to avoid duplication
    const filtered = additional.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
    const next = trimmed ? [trimmed, ...filtered] : [...filtered];
    setEditingBranch((prev) => (prev ? { ...prev, serviceCities: next, cityName: trimmed || prev.cityName } : null));
  };

  const addServiceCity = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = getServiceCities();
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    setEditingBranch((prev) => (prev ? { ...prev, serviceCities: [...current, trimmed] } : null));
  };

  const removeServiceCity = (index: number) => {
    const current = getServiceCities();
    if (index < 0 || index >= current.length) return;
    const next = [...current];
    next.splice(index, 1);
    setEditingBranch((prev) =>
      prev
        ? {
            ...prev,
            serviceCities: next,
            cityName: next[0] || prev.cityName || '',
          }
        : null
    );
  };

  const handleCityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (cityInput.trim()) {
        addServiceCity(cityInput);
        setCityInput('');
        setShowCitySuggestions(false);
      }
    }
  };

  const citySuggestions = cityInput.trim()
    ? CITIES.filter(
        (c) =>
          c.toLowerCase().includes(cityInput.trim().toLowerCase()) &&
          !getServiceCities().some((existing) => existing.toLowerCase() === c.toLowerCase())
      ).slice(0, 6)
    : [];

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
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your institute locations</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={MapPin}
            title="No branches yet"
            description="Add your first branch to get started"
            action={
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                <Plus size={16} /> Add Branch
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
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">City</th>
                  <th className="text-left px-5 py-3 font-medium">Address</th>
                  <th className="text-left px-5 py-3 font-medium">Main</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((branch) => (
                  <tr key={branch.identifier} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {branch.name}
                        {branch.isMainBranch && <Star size={14} className="text-amber-500 fill-amber-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {branch.serviceCities && branch.serviceCities.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span>{branch.serviceCities[0]}</span>
                          {branch.serviceCities.length > 1 && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              +{branch.serviceCities.length - 1} more
                            </span>
                          )}
                        </div>
                      ) : (
                        branch.cityName || '-'
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{branch.address}</td>
                    <td className="px-5 py-3">
                      {branch.isMainBranch ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Main</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(branch)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(branch)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
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
            {branches.map((branch) => (
              <MobileListCard
                key={branch.identifier}
                title={branch.name}
                subtitle={
                  <div className="space-y-0.5">
                    <div>{branch.address}</div>
                    <div className="text-xs text-slate-500">
                      {branch.serviceCities && branch.serviceCities.length > 0
                        ? `${branch.serviceCities[0]}${branch.serviceCities.length > 1 ? ` +${branch.serviceCities.length - 1}` : ''}`
                        : branch.cityName || '-'}
                    </div>
                  </div>
                }
                badge={
                  branch.isMainBranch ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Main Branch</span>
                  ) : null
                }
                actions={
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(branch); }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                      aria-label="Edit branch"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(branch); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      aria-label="Delete branch"
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

      {/* Add/Edit Modal */}
      {modalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              {editingBranch.identifier ? 'Edit Branch' : 'Add Branch'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch Name</label>
                <input
                  value={editingBranch.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                <input
                  value={editingBranch.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Primary City <span className="text-red-500">*</span>
                </label>
                <input
                  value={editingBranch.serviceCities?.[0] || editingBranch.cityName || ''}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  placeholder="Main branch city"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Additional Service Cities
                </label>
                <div className="relative">
                  <div className="min-h-[3rem] w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-primary-500 flex flex-wrap items-center gap-2">
                    {getServiceCities()
                      .slice(1)
                      .map((city, idx) => (
                        <span
                          key={`${city}-${idx}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-sm"
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => removeServiceCity(idx + 1)}
                            className="p-0.5 hover:bg-primary-100 rounded-full"
                            aria-label={`Remove ${city}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onKeyDown={handleCityInputKeyDown}
                      placeholder={getServiceCities().length > 1 ? 'Add another city' : 'Type and press Enter to add cities'}
                      className="flex-1 min-w-[140px] bg-transparent outline-none text-sm py-1"
                    />
                  </div>
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            addServiceCity(city);
                            setCityInput('');
                            setShowCitySuggestions(false);
                            cityInputRef.current?.focus();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Add nearby or target cities where this branch can reach students.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                <input
                  value={editingBranch.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                <input
                  value={editingBranch.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  value={editingBranch.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  value={editingBranch.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Landmark</label>
                <input
                  value={editingBranch.landmark || ''}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Google Maps URL <span className="text-red-500">*</span>
                </label>
                <input
                  value={editingBranch.googleMapsUrl || ''}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                  placeholder="https://maps.google.com/?q=19.2307,72.8567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBranch.isMainBranch || false}
                    onChange={(e) => handleChange('isMainBranch', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Main Branch</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBranch.isOnlineOnly || false}
                    onChange={(e) => handleChange('isOnlineOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Online Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
