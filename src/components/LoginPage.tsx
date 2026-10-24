import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Award,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sun,
  Moon,
  Globe,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useI18n, TranslationKey } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { validateLogin, AppSession } from '../lib/auth';

interface LoginPageProps {
  onLoginSuccess: (session: AppSession) => void;
}

type RoleTab = 'student' | 'staff' | 'admin';

const DESIGNATION_DEPT_MAP: Record<string, { en: string; key: TranslationKey }> = {
  Electrician: { en: 'Electrical Dept', key: 'dept_electrical' },
  Plumber: { en: 'Maintenance', key: 'dept_maintenance' },
  'Housekeeping Supervisor': { en: 'Housekeeping', key: 'dept_housekeeping' },
  'IT / Network Engineer': { en: 'IT / Network', key: 'dept_it' },
  Warden: { en: 'Hostel & Maintenance Office', key: 'dept_hostel_office' },
  'Maintenance Head': { en: 'Hostel & Maintenance Office', key: 'dept_hostel_office' },
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  // Role selector state
  const [role, setRole] = useState<RoleTab>('student');

  // Form states
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Roll No / Staff ID / Admin ID
  const [hostel, setHostel] = useState('Hostel B');
  const [roomNumber, setRoomNumber] = useState('204');
  const [designation, setDesignation] = useState('Electrician');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpdeskModal, setShowHelpdeskModal] = useState(false);

  const fullNameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus the first field when mounting or role changes
  useEffect(() => {
    fullNameInputRef.current?.focus();
    setErrors({});
    setGeneralError(null);
  }, [role]);

  // Derived Department for Staff
  const staffDept = DESIGNATION_DEPT_MAP[designation]?.en || 'Maintenance';
  const staffDeptKey = DESIGNATION_DEPT_MAP[designation]?.key || 'dept_maintenance';

  // Demo account autofill handler
  const handleUseDemo = () => {
    setErrors({});
    setGeneralError(null);
    if (role === 'student') {
      setFullName('Aarav Patel');
      setIdentifier('ZSAI2026001');
      setHostel('Hostel B');
      setRoomNumber('204');
      setPassword('demo123');
    } else if (role === 'staff') {
      setFullName('Ramesh Kumar');
      setIdentifier('STF-014');
      setDesignation('Electrician');
      setPassword('demo123');
    } else {
      setFullName('Dr. Meera Sharma');
      setIdentifier('ADM-001');
      setPassword('demo123');
    }
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('err_name_req');
    }

    if (!identifier.trim()) {
      if (role === 'student') newErrors.identifier = t('err_roll_req');
      else if (role === 'staff') newErrors.identifier = t('err_staff_id_req');
      else newErrors.identifier = t('err_admin_id_req');
    }

    if (role === 'student' && !hostel) {
      newErrors.hostel = t('err_hostel_req');
    }

    if (role === 'staff' && !designation) {
      newErrors.designation = t('err_desig_req');
    }

    if (!password) {
      newErrors.password = t('err_password_req');
    } else if (password.length < 6) {
      newErrors.password = t('err_password_len');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Simulate brief authentication latency
    setTimeout(() => {
      const result = validateLogin({
        role,
        name: fullName,
        id: identifier,
        password,
        designation: role === 'staff' ? designation : undefined,
        department: role === 'staff' ? staffDept : undefined,
        hostel: role === 'student' ? hostel : undefined,
        room: role === 'student' && hostel !== 'Day Scholar' ? roomNumber : undefined,
      });

      setIsSubmitting(false);

      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setGeneralError(result.error || t('err_login_failed'));
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Floating Controls: Language & Theme Toggles */}
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('college_name')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`${t('lang_toggle_label')}: ${lang.toUpperCase()}`}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`${t('theme_toggle_label')}: ${theme}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Two Columns Desktop (40/60), Collapsing on Mobile */}
      <main className="flex-1 flex flex-col md:flex-row items-stretch max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 gap-8 lg:gap-12 justify-center my-auto">
        {/* Left Column (40% Desktop): College Panel */}
        <section className="w-full md:w-[40%] flex flex-col justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          {/* Mobile minimal collapsed header (< 768px) */}
          <div className="md:hidden flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {t('college_name')}
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {t('app_name')}
              </p>
            </div>
          </div>

          {/* Desktop full panel content (>= 768px) */}
          <div className="space-y-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block font-mono">
                  {t('app_name')}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t('college_name')}
                </h1>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300">
                "{t('app_tagline')}"
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{t('academic_year')}</span>
              </div>
            </div>

            {/* Helpdesk & Campus Info lines */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                    {t('helpdesk_phone_label')}
                  </span>
                  <a
                    href="tel:+9108041228900"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t('helpdesk_phone')}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                    {t('helpdesk_email_label')}
                  </span>
                  <a
                    href="mailto:helpdesk@zenith.ai"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t('helpdesk_email')}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                    {t('campus_address_label')}
                  </span>
                  <p className="leading-relaxed">{t('campus_address')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (60% Desktop): Centered Login Card */}
        <section className="w-full md:w-[60%] flex items-center justify-center">
          <div className="w-full max-w-[420px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm">
            {/* Title & Subtitle */}
            <div className="mb-5 text-left">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t('sign_in_title')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {t('sign_in_subtitle')}
              </p>
            </div>

            {/* Segmented Role Selector: Student | Staff | Admin */}
            <div
              role="tablist"
              aria-label="Select user role"
              className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 mb-2"
            >
              <button
                type="button"
                role="tab"
                id="tab-student"
                aria-selected={role === 'student'}
                aria-controls="panel-login-fields"
                onClick={() => setRole('student')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  role === 'student'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{t('role_student')}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-staff"
                aria-selected={role === 'staff'}
                aria-controls="panel-login-fields"
                onClick={() => setRole('staff')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  role === 'staff'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{t('role_staff')}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-admin"
                aria-selected={role === 'admin'}
                aria-controls="panel-login-fields"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  role === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('role_admin')}</span>
              </button>
            </div>

            {/* Helper line under selector */}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4 min-h-[16px] text-left">
              {role === 'student'
                ? t('role_helper_student')
                : role === 'staff'
                ? t('role_helper_staff')
                : t('role_helper_admin')}
            </p>

            {/* General Error Banner */}
            {generalError && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-center gap-2 p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Semantic Form */}
            <form
              id="panel-login-fields"
              role="tabpanel"
              aria-labelledby={`tab-${role}`}
              onSubmit={handleSubmit}
              className="space-y-3.5 text-left"
              noValidate
            >
              {/* Field 1: Full Name (all roles) */}
              <div>
                <label
                  htmlFor="login-fullname"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  {t('label_full_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fullNameInputRef}
                  id="login-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) {
                      setErrors((prev) => ({ ...prev, fullName: '' }));
                    }
                  }}
                  placeholder={t('placeholder_full_name')}
                  className={`w-full min-h-[44px] px-3 py-2 text-base rounded-md border bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                />
                {errors.fullName && (
                  <p
                    className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Student Fields */}
              {role === 'student' && (
                <>
                  {/* Roll Number */}
                  <div>
                    <label
                      htmlFor="login-roll"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      {t('label_roll_number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="login-roll"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value.toUpperCase());
                        if (errors.identifier) {
                          setErrors((prev) => ({ ...prev, identifier: '' }));
                        }
                      }}
                      placeholder={t('placeholder_roll_number')}
                      className={`w-full min-h-[44px] px-3 py-2 text-base font-mono uppercase rounded-md border bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                        errors.identifier
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    />
                    {errors.identifier && (
                      <p
                        className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.identifier}</span>
                      </p>
                    )}
                  </div>

                  {/* Hostel Dropdown & Optional Room Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="login-hostel"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        {t('label_hostel_block')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="login-hostel"
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-base rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hostel A">{t('opt_hostel_a')}</option>
                        <option value="Hostel B">{t('opt_hostel_b')}</option>
                        <option value="Hostel C">{t('opt_hostel_c')}</option>
                        <option value="Day Scholar">{t('opt_day_scholar')}</option>
                      </select>
                    </div>

                    {hostel !== 'Day Scholar' && (
                      <div>
                        <label
                          htmlFor="login-room"
                          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                        >
                          {t('label_room_number')}
                        </label>
                        <input
                          id="login-room"
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder={t('placeholder_room_number')}
                          className="w-full min-h-[44px] px-3 py-2 text-base rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Staff Fields */}
              {role === 'staff' && (
                <>
                  {/* Staff ID */}
                  <div>
                    <label
                      htmlFor="login-staffid"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      {t('label_staff_id')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="login-staffid"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value.toUpperCase());
                        if (errors.identifier) {
                          setErrors((prev) => ({ ...prev, identifier: '' }));
                        }
                      }}
                      placeholder={t('placeholder_staff_id')}
                      className={`w-full min-h-[44px] px-3 py-2 text-base font-mono uppercase rounded-md border bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                        errors.identifier
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    />
                    {errors.identifier && (
                      <p
                        className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.identifier}</span>
                      </p>
                    )}
                  </div>

                  {/* Designation & Read-only Department */}
                  <div>
                    <label
                      htmlFor="login-designation"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      {t('label_designation')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="login-designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-base rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Warden">{t('desig_warden')}</option>
                      <option value="Electrician">{t('desig_electrician')}</option>
                      <option value="Plumber">{t('desig_plumber')}</option>
                      <option value="Housekeeping Supervisor">{t('desig_housekeeping')}</option>
                      <option value="IT / Network Engineer">{t('desig_it')}</option>
                      <option value="Maintenance Head">{t('desig_maintenance_head')}</option>
                    </select>
                  </div>

                  {/* Auto-filled Department (Read-only) */}
                  <div>
                    <label
                      htmlFor="login-department"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      {t('label_department')}
                    </label>
                    <input
                      id="login-department"
                      type="text"
                      readOnly
                      value={t(staffDeptKey)}
                      className="w-full min-h-[44px] px-3 py-2 text-base rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 cursor-not-allowed select-none font-medium"
                    />
                  </div>
                </>
              )}

              {/* Admin Fields */}
              {role === 'admin' && (
                <>
                  {/* Admin ID or Official Email */}
                  <div>
                    <label
                      htmlFor="login-adminid"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      {t('label_admin_id')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="login-adminid"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) {
                          setErrors((prev) => ({ ...prev, identifier: '' }));
                        }
                      }}
                      placeholder={t('placeholder_admin_id')}
                      className={`w-full min-h-[44px] px-3 py-2 text-base rounded-md border bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                        errors.identifier
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    />
                    {errors.identifier && (
                      <p
                        className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                        aria-live="polite"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.identifier}</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Password Field (all roles) with show/hide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {t('label_password')} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpdeskModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none font-medium"
                  >
                    {t('forgot_password')}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder={t('placeholder_password')}
                    className={`w-full min-h-[44px] pl-3 pr-10 py-2 text-base rounded-md border bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('submitting')}</span>
                  </>
                ) : (
                  <span>
                    {role === 'student'
                      ? t('btn_signin_student')
                      : role === 'staff'
                      ? t('btn_signin_staff')
                      : t('btn_signin_admin')}
                  </span>
                )}
              </button>

              {/* Admin Note */}
              {role === 'admin' && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
                  {t('admin_note')}
                </p>
              )}

              {/* Demo Account Autofill Button */}
              <div className="pt-2 text-center border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors focus:outline-none focus:underline"
                >
                  {t('btn_use_demo')}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer minimal info */}
      <footer className="w-full py-3 px-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50">
        <p>
          © 2026 {t('college_name')} • {t('app_name')}
        </p>
      </footer>

      {/* Helpdesk Support Modal */}
      {showHelpdeskModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-lg space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t('modal_helpdesk_title')}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpdeskModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={t('btn_close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('modal_helpdesk_desc')}
            </p>

            <div className="space-y-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('helpdesk_phone_label')}:
                </span>
                <a
                  href="tel:+9108041228900"
                  className="font-mono text-blue-600 dark:text-blue-400 font-semibold"
                >
                  {t('helpdesk_phone')}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('helpdesk_email_label')}:
                </span>
                <a
                  href="mailto:helpdesk@zenith.ai"
                  className="font-mono text-blue-600 dark:text-blue-400 font-semibold"
                >
                  {t('helpdesk_email')}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpdeskModal(false)}
              className="w-full min-h-[40px] px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors focus:outline-none"
            >
              {t('btn_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
