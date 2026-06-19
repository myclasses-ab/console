import { useEffect, useState, useRef, useCallback } from "react";
import { useInstitute } from "@/context/InstituteContext";
import { instituteApi, uploadApi } from "@/api";
import type { Institute } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import {
  Save,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ImageIcon,
  Search,
  BarChart3,
  Upload,
  X,
  Eye,
  Star,
  CheckCircle,
  Award,
  Users,
  Calendar,
  ArrowRight,
  Info,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { instituteLogoUrl, instituteBannerUrl } from "@/lib/image-url";
import { motion, AnimatePresence } from "framer-motion";
import InstitutePreviewFull from "@/components/institute/InstitutePreviewFull";

/* ───────────────────────────────
   Reusable UI Components
   ─────────────────────────────── */

function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shadow-sm">
          <Icon size={18} className="text-primary-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon: Icon,
  maxLength,
}: {
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon?: any;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm ${Icon ? "pl-10" : ""}`}
      />
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder = "",
  rows = 5,
  maxLength,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-sm leading-relaxed"
      />
      {maxLength && (
        <div className="text-right text-xs text-slate-400 mt-1">
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ───────────────────────────────
   Image Upload Component
   ─────────────────────────────── */

function ImageUploader({
  label,
  sublabel,
  previewUrl,
  aspect = "square",
  onFileSelect,
  onClear,
  isUploading,
}: {
  label: string;
  sublabel?: string;
  previewUrl: string;
  aspect?: "square" | "wide";
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isUploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) onFileSelect(file);
    },
    [onFileSelect]
  );

  const sizeClasses = aspect === "wide" ? "h-48" : "h-40 w-40";

  return (
    <div>
      <Label>{label}</Label>
      {sublabel && <p className="text-xs text-slate-500 mb-3">{sublabel}</p>}
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
          isDragging
            ? "border-primary-500 bg-primary-50"
            : previewUrl
            ? "border-slate-200 hover:border-primary-400"
            : "border-slate-300 hover:border-primary-400 bg-slate-50/50"
        } ${aspect === "wide" ? "w-full" : "w-40"}`}
      >
        <div className={`${sizeClasses} relative`}>
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <Upload size={16} />
                  Change {label}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload size={18} />
              </div>
              <span className="text-xs font-medium">Click or drop image</span>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
      {previewUrl && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
        >
          <X size={12} />
          Remove {label}
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────────
   Preview Component
   Mirrors frontend hero + overview
   ─────────────────────────────── */

function InstitutePreview({ institute }: { institute: any }) {
  const logo = instituteLogoUrl(institute.logoUrl);
  const banner = instituteBannerUrl(institute.bannerUrl);
  const rating = Number(institute.averageRating || 0).toFixed(1);

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {/* Mini Banner */}
      <div className="relative h-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 z-10" />
        <img
          src={banner || "/assets/sample_image_for_anything.png"}
          alt="banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-end p-4">
          <div className="flex items-end gap-3">
            <div className="w-14 h-14 rounded-xl bg-white shadow-lg p-1 flex items-center justify-center -mb-4">
              <img
                src={logo || "/assets/sample_image_for_anything.png"}
                alt="logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="pb-1">
              <h3 className="text-white font-bold text-sm leading-tight drop-shadow">
                {institute.name || "Institute Name"}
              </h3>
              {institute.tagline && (
                <p className="text-white/90 text-xs truncate max-w-[180px] drop-shadow">
                  {institute.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-6 px-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{rating}</span>
          </div>
          {institute.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              <CheckCircle size={10} />
              Verified
            </span>
          )}
          {institute.yearsOfExperience > 0 && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={10} />
              {institute.yearsOfExperience}+ yrs
            </span>
          )}
        </div>

        {institute.description && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <Building2 size={12} className="text-primary-500" />
              About Us
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
              {institute.description}
            </p>
          </div>
        )}

        {/* <div className="space-y-1.5">
          {institute.phonePrimary && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone size={12} className="text-slate-400" />
              {institute.phonePrimary}
            </div>
          )}
          {institute.email && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail size={12} className="text-slate-400" />
              <span className="truncate">{institute.email}</span>
            </div>
          )}
          {institute.websiteUrl && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Globe size={12} className="text-slate-400" />
              <span className="truncate">{institute.websiteUrl}</span>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

/* ───────────────────────────────
   Completion Tips
   ─────────────────────────────── */

function ProfileTips({ institute }: { institute: any }) {
  const tips = [
    { label: "Complete your profile 100%", desc: "Complete all sections to rank higher in search results", check: (i: any) => i.name && i.tagline && i.description && i.logoUrl && i.bannerUrl },
    { label: "Upload high quality photos", desc: "Good photos build trust and credibility", check: (i: any) => i.logoUrl && i.bannerUrl },
    { label: "Keep your profile updated", desc: "Regular updates improve visibility", check: () => true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-primary-500" />
        Tips to get more leads
      </h3>
      <div className="space-y-3">
        {tips.map((tip, idx) => {
          const done = tip.check(institute);
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500" : "bg-slate-100"}`}>
                <CheckCircle size={12} className={done ? "text-white" : "text-slate-400"} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{tip.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────
   Main Page
   ─────────────────────────────── */

export default function InstituteProfilePage() {
  const { institute, refreshInstitute } = useInstitute();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState({ logo: false, banner: false });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (institute) {
      setFormData({ ...institute });
    }
  }, [institute]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!institute?.identifier) return;
    setIsSaving(true);
    try {
      await instituteApi.update(institute.identifier, formData);
      await refreshInstitute();
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!institute?.identifier) return;
    setIsUploading((p) => ({ ...p, logo: true }));
    try {
      const oldLogoKey = formData["logoUrl"] || institute.logoUrl;
      const result = await uploadApi.uploadLogo(file, institute.identifier, oldLogoKey);
      handleChange("logoUrl", result.key);
      toast.success("Logo uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading((p) => ({ ...p, logo: false }));
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!institute?.identifier) return;
    setIsUploading((p) => ({ ...p, banner: true }));
    try {
      const oldBannerKey = formData["bannerUrl"] || institute.bannerUrl;
      const result = await uploadApi.uploadBanner(file, institute.identifier, oldBannerKey);
      handleChange("bannerUrl", result.key);
      toast.success("Banner uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload banner");
    } finally {
      setIsUploading((p) => ({ ...p, banner: false }));
    }
  };

  const handleClearLogo = () => handleChange("logoUrl", "");
  const handleClearBanner = () => handleChange("bannerUrl", "");

  if (!institute) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completionPercent = (() => {
    const fields = ["name", "tagline", "description", "email", "phonePrimary", "logoUrl", "bannerUrl", "websiteUrl"];
    const filled = fields.filter((f) => {
      const v = formData[f];
      return v !== undefined && v !== null && v !== "";
    }).length;
    return Math.round((filled / fields.length) * 100);
  })();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institute Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your institute information and preview how students see it
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Completion bar */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-slate-800">Profile Completion</span>
            <span className="text-sm font-bold text-primary-600">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <ShieldCheck size={24} className="text-primary-500 flex-shrink-0" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-24">
        {/* ── Left Column: Form ── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Information */}
          <SectionCard title="Basic Information" icon={Building2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label required>Institute Name</Label>
                <Input
                  value={formData["name"] || ""}
                  onChange={(v) => handleChange("name", v)}
                  placeholder="e.g. The Gurukul Classes"
                />
              </div>
              <div className="md:col-span-2">
                <Label required>Tagline</Label>
                <Input
                  value={formData["tagline"] || ""}
                  onChange={(v) => handleChange("tagline", v)}
                  placeholder="One line about your institute"
                  maxLength={120}
                />
              </div>
              <div className="md:col-span-2">
                <Label required>About Us</Label>
                <TextArea
                  value={formData["description"] || ""}
                  onChange={(v) => handleChange("description", v)}
                  placeholder="Tell students about your institute, teaching methodology, and what makes you unique..."
                  rows={6}
                  maxLength={2000}
                />
              </div>
              <div>
                <Label>Founded Year</Label>
                <Input
                  type="number"
                  value={formData["foundedYear"] || ""}
                  onChange={(v) => handleChange("foundedYear", v)}
                  placeholder="e.g. 2010"
                />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData["yearsOfExperience"] || ""}
                  onChange={(v) => handleChange("yearsOfExperience", v)}
                  placeholder="e.g. 14"
                />
              </div>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard title="Contact Information" icon={Phone}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  icon={Mail}
                  value={formData["email"] || ""}
                  onChange={(v) => handleChange("email", v)}
                  placeholder="contact@institute.com"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  icon={Phone}
                  value={formData["phonePrimary"] || ""}
                  onChange={(v) => handleChange("phonePrimary", v)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input
                  icon={Phone}
                  value={formData["whatsappNumber"] || ""}
                  onChange={(v) => handleChange("whatsappNumber", v)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label>Website URL</Label>
                <Input
                  icon={Globe}
                  value={formData["websiteUrl"] || ""}
                  onChange={(v) => handleChange("websiteUrl", v)}
                  placeholder="https://www.institute.com"
                />
              </div>
            </div>
          </SectionCard>

          {/* Type & Ownership */}
          <SectionCard title="Type & Ownership" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Institute Type</Label>
                <Select
                  value={formData["type"] || ""}
                  onChange={(v) => handleChange("type", v)}
                  options={[
                    { label: "Select type", value: "" },
                    { label: "Offline", value: "OFFLINE" },
                    { label: "Online", value: "ONLINE" },
                    { label: "Hybrid", value: "HYBRID" },
                  ]}
                />
              </div>
              <div>
                <Label>Ownership Type</Label>
                <Select
                  value={formData["ownershipType"] || ""}
                  onChange={(v) => handleChange("ownershipType", v)}
                  options={[
                    { label: "Select ownership", value: "" },
                    { label: "Individual", value: "INDIVIDUAL" },
                    { label: "Partnership", value: "PARTNERSHIP" },
                    { label: "Company", value: "COMPANY" },
                    { label: "Franchise", value: "FRANCHISE" },
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* Branding */}
          <SectionCard title="Branding & Media" icon={ImageIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUploader
                label="Institute Logo"
                sublabel="Recommended: 512×512px, JPG or PNG (max 2MB)"
                previewUrl={instituteLogoUrl(formData["logoUrl"])}
                aspect="square"
                onFileSelect={handleLogoUpload}
                onClear={handleClearLogo}
                isUploading={isUploading.logo}
              />
              <div className="md:col-span-1">
                <ImageUploader
                  label="Cover Banner"
                  sublabel="Recommended: 1200×400px, JPG or PNG (max 5MB)"
                  previewUrl={instituteBannerUrl(formData["bannerUrl"])}
                  aspect="wide"
                  onFileSelect={handleBannerUpload}
                  onClear={handleClearBanner}
                  isUploading={isUploading.banner}
                />
              </div>
            </div>
          </SectionCard>

          {/* SEO */}
          <SectionCard title="SEO & Visibility" icon={Search}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label>Meta Title</Label>
                <Input
                  value={formData["metaTitle"] || ""}
                  onChange={(v) => handleChange("metaTitle", v)}
                  placeholder="Title shown in search engines"
                  maxLength={70}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Meta Description</Label>
                <TextArea
                  value={formData["metaDescription"] || ""}
                  onChange={(v) => handleChange("metaDescription", v)}
                  placeholder="Short description for search engines"
                  rows={3}
                  maxLength={160}
                />
              </div>
            </div>
          </SectionCard>

          {/* Statistics (read-only) */}
          <SectionCard title="Statistics" icon={BarChart3}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Total Students</p>
                <p className="text-lg font-bold text-slate-900">{formData["totalStudentsEnrolled"] || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Verified</p>
                <p className="text-lg font-bold text-slate-900">{institute.isVerified ? "Yes" : "No"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Featured</p>
                <p className="text-lg font-bold text-slate-900">{institute.isFeatured ? "Yes" : "No"}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right Column: Sticky Sidebar ── */}
        <div className="xl:col-span-1">
          <div className="sticky top-4 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Eye size={16} className="text-primary-500" />
                  Profile Preview
                </h3>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                >
                  Full Preview
                  <ArrowRight size={12} />
                </button>
              </div>
              <InstitutePreview institute={formData} />
            </div>

            <ProfileTips institute={formData} />

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-primary-200" />
                <h3 className="text-sm font-bold">Quick Tip</h3>
              </div>
              <p className="text-sm text-primary-100 leading-relaxed">
                Institutes with complete profiles get up to <strong className="text-white">3x more inquiries</strong>. Make sure to fill all sections and upload high-quality images.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Save size={18} className="text-primary-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {isSaving ? "Saving your changes..." : "Unsaved changes"}
              </p>
              <p className="text-xs text-slate-500">
                {isSaving ? "Please wait a moment" : "Don't forget to save your work"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Full Preview Modal ── */}
      <AnimatePresence>
        {showPreviewModal && (
          <InstitutePreviewFull
            institute={formData as Institute}
            onClose={() => setShowPreviewModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
