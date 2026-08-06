import { useEffect, useMemo, useState, useCallback } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { branchApi, instituteCourseApi, facultyApi } from '@/api';
import type { Institute } from '@/types';

export type SetupStep = 'profile' | 'branches' | 'courses' | 'faculty';

export interface SetupStatus {
  isLoading: boolean;
  isProfileComplete: boolean;
  missingProfileFields: string[];
  hasBranch: boolean;
  hasCourse: boolean;
  hasFaculty: boolean;
  nextIncompleteStep: SetupStep | null;
  /** Whether the given step's prerequisites are satisfied */
  isStepUnlocked: (step: SetupStep) => boolean;
  /** Human-readable reason why a step is locked */
  getLockReason: (step: SetupStep) => string;
  /** Path the user should visit to satisfy the prerequisite for a locked step */
  getLockedActionPath: (step: SetupStep) => string;
}

const REQUIRED_PROFILE_FIELDS: { key: keyof Institute; label: string }[] = [
  { key: 'name', label: 'Institute Name' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'description', label: 'About Us' },
  { key: 'email', label: 'Email Address' },
  { key: 'logoUrl', label: 'Institute Logo' },
];

function isNonEmpty(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

export function useSetupStatus(): SetupStatus {
  const { institute } = useInstitute();
  const [isLoading, setIsLoading] = useState(true);
  const [branchCount, setBranchCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      if (!institute?.identifier) {
        setBranchCount(0);
        setCourseCount(0);
        setFacultyCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [branches, courses, faculty] = await Promise.all([
          branchApi.findByInstituteIdentifier(institute.identifier),
          instituteCourseApi.findByInstituteIdentifier(institute.identifier),
          facultyApi.findByInstituteIdentifier(institute.identifier),
        ]);
        if (!cancelled) {
          setBranchCount(Array.isArray(branches) ? branches.length : 0);
          setCourseCount(Array.isArray(courses) ? courses.length : 0);
          setFacultyCount(Array.isArray(faculty) ? faculty.length : 0);
        }
      } catch (err) {
        console.error('Failed to load setup status counts', err);
        if (!cancelled) {
          setBranchCount(0);
          setCourseCount(0);
          setFacultyCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, [institute?.identifier]);

  const { isProfileComplete, missingProfileFields } = useMemo(() => {
    if (!institute) {
      return { isProfileComplete: false, missingProfileFields: REQUIRED_PROFILE_FIELDS.map((f) => f.label) };
    }

    const missing: string[] = [];
    for (const field of REQUIRED_PROFILE_FIELDS) {
      if (!isNonEmpty(institute[field.key])) {
        missing.push(field.label);
      }
    }

    const hasPhoneOrWhatsApp = isNonEmpty(institute.phonePrimary) || isNonEmpty(institute.whatsappNumber);
    if (!hasPhoneOrWhatsApp) {
      missing.push('Phone Number or WhatsApp Number');
    }

    return { isProfileComplete: missing.length === 0, missingProfileFields: missing };
  }, [institute]);

  const hasBranch = branchCount > 0;
  const hasCourse = courseCount > 0;
  const hasFaculty = facultyCount > 0;

  const nextIncompleteStep: SetupStep | null = useMemo(() => {
    if (!isProfileComplete) return 'profile';
    if (!hasBranch) return 'branches';
    if (!hasCourse) return 'courses';
    if (!hasFaculty) return 'faculty';
    return null;
  }, [isProfileComplete, hasBranch, hasCourse, hasFaculty]);

  const stepPrerequisites: Record<SetupStep, { unlocked: boolean; reason: string; path: string }> = useMemo(
    () => ({
      profile: {
        unlocked: true,
        reason: '',
        path: '/profile',
      },
      branches: {
        unlocked: isProfileComplete,
        reason: isProfileComplete
          ? ''
          : `Complete your Institute Profile before adding branches. Missing: ${missingProfileFields.join(', ')}`,
        path: '/profile',
      },
      courses: {
        unlocked: isProfileComplete && hasBranch,
        reason: !isProfileComplete
          ? `Complete your Institute Profile before adding courses. Missing: ${missingProfileFields.join(', ')}`
          : !hasBranch
          ? 'Add at least one branch before adding courses.'
          : '',
        path: !isProfileComplete ? '/profile' : '/branches',
      },
      faculty: {
        unlocked: isProfileComplete && hasBranch && hasCourse,
        reason: !isProfileComplete
          ? `Complete your Institute Profile before adding faculty. Missing: ${missingProfileFields.join(', ')}`
          : !hasBranch
          ? 'Add at least one branch before adding faculty.'
          : !hasCourse
          ? 'Add at least one course before adding faculty.'
          : '',
        path: !isProfileComplete ? '/profile' : !hasBranch ? '/branches' : '/courses',
      },
    }),
    [isProfileComplete, hasBranch, hasCourse, missingProfileFields]
  );

  const isStepUnlocked = useCallback(
    (step: SetupStep) => stepPrerequisites[step].unlocked,
    [stepPrerequisites]
  );

  const getLockReason = useCallback(
    (step: SetupStep) => stepPrerequisites[step].reason,
    [stepPrerequisites]
  );

  const getLockedActionPath = useCallback(
    (step: SetupStep) => stepPrerequisites[step].path,
    [stepPrerequisites]
  );

  return {
    isLoading,
    isProfileComplete,
    missingProfileFields,
    hasBranch,
    hasCourse,
    hasFaculty,
    nextIncompleteStep,
    isStepUnlocked,
    getLockReason,
    getLockedActionPath,
  };
}
