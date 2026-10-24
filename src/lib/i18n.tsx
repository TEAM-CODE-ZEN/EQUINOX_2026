import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

const DICTIONARIES = {
  en: {
    college_name: 'Zenith School of AI',
    app_name: 'CampusAccord',
    app_tagline: 'Every concern heard. Every action tracked.',
    academic_year: 'Academic Year 2026-27',
    helpdesk_phone_label: 'Helpdesk Phone',
    helpdesk_phone: '+91 (080) 4122-8900',
    helpdesk_email_label: 'Helpdesk Email',
    helpdesk_email: 'helpdesk@zenith.ai',
    campus_address_label: 'Campus Address',
    campus_address: 'Knowledge Park IV, Innovation Corridor, Bengaluru 560100',
    sign_in_title: 'Sign in',
    sign_in_subtitle: 'Access your campus portal and services',
    role_student: 'Student',
    role_staff: 'Staff',
    role_admin: 'Admin',
    role_helper_student: 'Raise complaints and track your tickets.',
    role_helper_staff: 'Manage, assign and resolve tickets for your department.',
    role_helper_admin: 'Full access: users, departments, analytics and settings.',
    label_full_name: 'Full name',
    placeholder_full_name: 'e.g. Aarav Patel',
    label_roll_number: 'Roll number',
    placeholder_roll_number: 'ZSAI2026001',
    label_hostel_block: 'Hostel / Block',
    placeholder_hostel: 'Select hostel / block',
    opt_hostel_a: 'Hostel A',
    opt_hostel_b: 'Hostel B',
    opt_hostel_c: 'Hostel C',
    opt_day_scholar: 'Day Scholar',
    label_room_number: 'Room number (optional)',
    placeholder_room_number: 'e.g. 204',
    label_staff_id: 'Staff ID',
    placeholder_staff_id: 'STF-014',
    label_designation: 'Designation',
    placeholder_designation: 'Select designation',
    desig_warden: 'Warden',
    desig_electrician: 'Electrician',
    desig_plumber: 'Plumber',
    desig_housekeeping: 'Housekeeping Supervisor',
    desig_it: 'IT / Network Engineer',
    desig_maintenance_head: 'Maintenance Head',
    label_department: 'Department (auto-assigned)',
    dept_electrical: 'Electrical Dept',
    dept_maintenance: 'Maintenance',
    dept_housekeeping: 'Housekeeping',
    dept_it: 'IT / Network',
    dept_hostel_office: 'Hostel & Maintenance Office',
    label_admin_id: 'Admin ID or official email',
    placeholder_admin_id: 'ADM-001 or admin@zenith.ai',
    label_password: 'Password',
    placeholder_password: 'Enter password (min 6 chars)',
    btn_signin_student: 'Sign in as Student',
    btn_signin_staff: 'Sign in as Staff',
    btn_signin_admin: 'Sign in as Admin',
    admin_note: 'Authorized personnel only',
    btn_use_demo: 'Use demo account',
    forgot_password: 'Forgot password?',
    err_name_req: 'Full name is required',
    err_roll_req: 'Roll number is required',
    err_hostel_req: 'Hostel selection is required',
    err_staff_id_req: 'Staff ID is required',
    err_desig_req: 'Designation is required',
    err_admin_id_req: 'Admin ID or official email is required',
    err_password_req: 'Password is required',
    err_password_len: 'Password must be at least 6 characters',
    err_login_failed: 'Login failed. Please check your credentials and try again.',
    submitting: 'Signing in...',
    modal_helpdesk_title: 'Contact Helpdesk',
    modal_helpdesk_desc: 'To reset your credentials, unlock your account, or request student/staff registration, reach out to the campus helpdesk.',
    btn_close: 'Close',
    lang_toggle_label: 'Language',
    theme_toggle_label: 'Theme',
    logout: 'Sign out',
  },
  hi: {
    college_name: 'ज़ेनिथ स्कूल ऑफ एआई',
    app_name: 'कैंपस एकॉर्ड',
    app_tagline: 'हर चिंता सुनी गई। हर कार्रवाई ट्रैक की गई।',
    academic_year: 'शैक्षणिक वर्ष 2026-27',
    helpdesk_phone_label: 'हेल्पडेस्क फ़ोन',
    helpdesk_phone: '+91 (080) 4122-8900',
    helpdesk_email_label: 'हेल्पडेस्क ईमेल',
    helpdesk_email: 'helpdesk@zenith.ai',
    campus_address_label: 'कैंपस का पता',
    campus_address: 'नॉलेज पार्क IV, इनोवेशन कॉरिडोर, बेंगलुरु 560100',
    sign_in_title: 'साइन इन करें',
    sign_in_subtitle: 'अपने कैंपस पोर्टल और सेवाओं तक पहुंचें',
    role_student: 'विद्यार्थी',
    role_staff: 'कर्मचारी',
    role_admin: 'प्रशासक',
    role_helper_student: 'शिकायतें दर्ज करें और अपने टिकट ट्रैक करें।',
    role_helper_staff: 'अपने विभाग के टिकट प्रबंधित करें, सौंपें और हल करें।',
    role_helper_admin: 'पूर्ण पहुंच: उपयोगकर्ता, विभाग, विश्लेषण और सेटिंग्स।',
    label_full_name: 'पूरा नाम',
    placeholder_full_name: 'उदा. आरव पटेल',
    label_roll_number: 'रोल नंबर',
    placeholder_roll_number: 'ZSAI2026001',
    label_hostel_block: 'छात्रावास / ब्लॉक',
    placeholder_hostel: 'छात्रावास / ब्लॉक चुनें',
    opt_hostel_a: 'छात्रावास ए',
    opt_hostel_b: 'छात्रावास बी',
    opt_hostel_c: 'छात्रावास सी',
    opt_day_scholar: 'डे स्कॉलर',
    label_room_number: 'कमरा नंबर (वैकल्पिक)',
    placeholder_room_number: 'उदा. 204',
    label_staff_id: 'कर्मचारी आईडी',
    placeholder_staff_id: 'STF-014',
    label_designation: 'पद',
    placeholder_designation: 'पद चुनें',
    desig_warden: 'वार्डन',
    desig_electrician: 'इलेक्ट्रीशियन',
    desig_plumber: 'प्लम्बर',
    desig_housekeeping: 'हाउसकीपिंग सुपरवाइजर',
    desig_it: 'आईटी / नेटवर्क इंजीनियर',
    desig_maintenance_head: 'रखरखाव प्रमुख',
    label_department: 'विभाग (स्वतः निर्धारित)',
    dept_electrical: 'विद्युत विभाग',
    dept_maintenance: 'रखरखाव विभाग',
    dept_housekeeping: 'हाउसकीपिंग',
    dept_it: 'आईटी / नेटवर्क',
    dept_hostel_office: 'छात्रावास एवं रखरखाव कार्यालय',
    label_admin_id: 'प्रशासक आईडी या आधिकारिक ईमेल',
    placeholder_admin_id: 'ADM-001 या admin@zenith.ai',
    label_password: 'पासवर्ड',
    placeholder_password: 'पासवर्ड दर्ज करें (कम से कम 6 अक्षर)',
    btn_signin_student: 'विद्यार्थी के रूप में साइन इन करें',
    btn_signin_staff: 'कर्मचारी के रूप में साइन इन करें',
    btn_signin_admin: 'प्रशासक के रूप में साइन इन करें',
    admin_note: 'केवल अधिकृत कर्मचारी',
    btn_use_demo: 'डेमो खाते का उपयोग करें',
    forgot_password: 'पासवर्ड भूल गए?',
    err_name_req: 'पूरा नाम आवश्यक है',
    err_roll_req: 'रोल नंबर आवश्यक है',
    err_hostel_req: 'छात्रावास का चयन आवश्यक है',
    err_staff_id_req: 'कर्मचारी आईडी आवश्यक है',
    err_desig_req: 'पद का चयन आवश्यक है',
    err_admin_id_req: 'प्रशासक आईडी या आधिकारिक ईमेल आवश्यक है',
    err_password_req: 'पासवर्ड आवश्यक है',
    err_password_len: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    err_login_failed: 'लॉगिन विफल रहा। कृपया अपने विवरण जांचें और पुनः प्रयास करें।',
    submitting: 'साइन इन हो रहा है...',
    modal_helpdesk_title: 'हेल्पडेस्क से संपर्क करें',
    modal_helpdesk_desc: 'अपना क्रेडेंशियल रीसेट करने या खाता अनलॉक करने के लिए कैंपस हेल्पडेस्क से संपर्क करें।',
    btn_close: 'बंद करें',
    lang_toggle_label: 'भाषा',
    theme_toggle_label: 'थीम',
    logout: 'साइन आउट',
  },
};

export type TranslationKey = keyof typeof DICTIONARIES.en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => DICTIONARIES.en[key] || key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('campusaccord_lang');
      if (stored === 'en' || stored === 'hi') return stored;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('campusaccord_lang', lang);
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key: TranslationKey): string => {
    const dict = DICTIONARIES[lang] || DICTIONARIES.en;
    return dict[key] || DICTIONARIES.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
