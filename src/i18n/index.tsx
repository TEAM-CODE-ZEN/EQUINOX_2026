import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

const translations = {
  en: {
    // General
    aiNotice: 'AI suggestions, verify before acting.',
    aiUnavailableNotice: 'AI unavailable, showing sample result.',
    loading: 'Analyzing...',
    apply: 'Apply',
    dismiss: 'Dismiss',
    cancel: 'Cancel',
    send: 'Send',
    save: 'Save',
    reopen: 'Reopen',
    close: 'Close',

    // Investigator
    investigatorTab: 'AI Investigator',
    runInvestigation: 'Run Investigation',
    runningInvestigation: 'Investigating incident with AI...',
    investigationSummary: 'Technical Incident Summary',
    likelyCauses: 'Likely Causes & Probabilities',
    checkFirst: 'What to Check First (Action Checklist)',
    safetyWarnings: 'Safety Warnings & Hazards',
    similarIncidents: 'Similar Incidents in Vicinity',
    noSimilarFound: 'No duplicate or related incidents found.',
    suggestedPriority: 'AI Suggested Priority',
    priorityReason: 'Priority Assessment Rationale',
    estimatedFixTime: 'Estimated Resolution Time',
    suggestedDepartment: 'Suggested Department',
    nextBestActions: 'Recommended Next Actions',
    askStudent: 'Ask Student Clarifying Question',
    questionsSent: 'Question posted as an official update on this ticket.',
    followUpChatTitle: 'Investigator AI Q&A',
    chatPlaceholder: 'Ask a diagnostic question about this incident...',
    chatInitialNotice: 'Ask specific questions grounded in this ticket and related history.',
    notEnoughInfo: 'Not enough information provided in the ticket context to answer with certainty.',
    isRecurring: 'Recurring Incident Pattern Detected',

    // Root Cause
    rootCausesTab: 'Root Causes',
    rootCausesTitle: 'AI Incident Cluster & Root-Cause Analysis',
    rootCausesSubtitle: 'Algorithmic pattern detection across 90-day maintenance and infrastructure logs.',
    reanalyzeRootCauses: 'Re-Analyze Clusters',
    clustersFound: 'Active Problem Clusters',
    ticketsLinked: 'Linked Problem Tickets',
    highSeverityClusters: 'Critical / High Clusters',
    lastAnalyzed: 'Last analyzed',
    createTask: 'Create Maintenance Task',
    partOfRootCause: 'Identified as part of root-cause cluster',
    permanentFix: 'Recommended Permanent Engineering Fix',
    preventiveAction: 'Preventive Measure',
    costBand: 'Estimated Cost Band',
    scope: 'Affected Scope',

    // Resolution Verification
    markFixed: 'Mark Fixed',
    resolutionModalTitle: 'Evidence-Based Resolution Verification',
    resolutionModalSubtitle: 'Submit completion evidence photo and technician repair notes for AI verification.',
    afterPhotoLabel: 'Upload "After-Fix" Photo Evidence',
    resolutionNoteLabel: 'Resolution / Work Done Note',
    partsUsedLabel: 'Parts / Tools Used (Optional)',
    submitVerification: 'Verify Resolution with AI',
    samePhotoError: 'Auto-Failed: The after photo is identical to the before photo. Please upload actual evidence of repair.',
    uploadBetterPhoto: 'Upload Clearer Evidence Photo',
    escalateToAdmin: 'Escalate to Campus Admin',
    awaitingStudent: 'Awaiting Student Confirmation',
    verifiedByAi: 'Resolution Verified by AI',
    notVerifiedByAi: 'Verification Inconclusive / Failed',
    studentConfirmTitle: 'Please Confirm Repair Completion',
    studentConfirmPrompt: 'Our technician marked this issue fixed with verified photographic evidence. Does everything work properly?',
    yesItsFixed: 'Yes, it is fixed!',
    noStillNotFixed: 'No, still not fixed',
    reopenReasonPrompt: 'Please specify what is still unresolved or defective:',
    beforePhoto: 'Before Repair',
    afterPhoto: 'After Repair',
    confidence: 'Confidence',

    // Demo Data
    loadAiDemoData: 'Load AI Demo Data',
    clearAiDemoData: 'Clear AI Demo Data',
    aiDemoDataLoaded: '6 Electrical cluster tickets, 2 verification tickets & 1 reopened ticket loaded.',
    aiDemoDataCleared: 'AI demo data cleared successfully.',
  },
  hi: {
    // General
    aiNotice: 'एआई सुझाव, कार्रवाई से पहले पुष्टि करें।',
    aiUnavailableNotice: 'एआई अनुपलब्ध, नमूना परिणाम दिखाया जा रहा है।',
    loading: 'विश्लेषण जारी है...',
    apply: 'लागू करें',
    dismiss: 'खारिज करें',
    cancel: 'रद्द करें',
    send: 'भेजें',
    save: 'सहेजें',
    reopen: 'पुनः खोलें',
    close: 'बंद करें',

    // Investigator
    investigatorTab: 'एआई अन्वेषक',
    runInvestigation: 'जांच शुरू करें',
    runningInvestigation: 'एआई से समस्या की जांच की जा रही है...',
    investigationSummary: 'तकनीकी समस्या सारांश',
    likelyCauses: 'संभावित कारण और संभावनाएँ',
    checkFirst: 'सर्वप्रथम क्या जांचें (चेकलिस्ट)',
    safetyWarnings: 'सुरक्षा चेतावनी और खतरे',
    similarIncidents: 'आसपास की समान घटनाएँ',
    noSimilarFound: 'कोई मिलती-जुलती घटना नहीं मिली।',
    suggestedPriority: 'एआई द्वारा सुझाई गई प्राथमिकता',
    priorityReason: 'प्राथमिकता का आधार',
    estimatedFixTime: 'अनुमानित समाधान समय',
    suggestedDepartment: 'सुझाया गया विभाग',
    nextBestActions: 'अनुशंसित अगले कदम',
    askStudent: 'छात्र से स्पष्टीकरण प्रश्न पूछें',
    questionsSent: 'प्रश्न इस टिकट पर संदेश के रूप में पोस्ट कर दिया गया है।',
    followUpChatTitle: 'अन्वेषक एआई प्रश्नोत्तर',
    chatPlaceholder: 'इस समस्या के बारे में कोई प्रश्न पूछें...',
    chatInitialNotice: 'टिकट संदर्भ के आधार पर प्रश्न पूछें।',
    notEnoughInfo: 'निश्चित रूप से उत्तर देने के लिए टिकट संदर्भ में पर्याप्त जानकारी नहीं है।',
    isRecurring: 'बार-बार होने वाली समस्या का पैटर्न पाया गया',

    // Root Cause
    rootCausesTab: 'मूल कारण',
    rootCausesTitle: 'एआई समस्या समूह और मूल-कारण विश्लेषण',
    rootCausesSubtitle: 'पिछले 90 दिनों के रखरखाव और बुनियादी ढांचे के रिकॉर्ड का विश्लेषण।',
    reanalyzeRootCauses: 'पुनः विश्लेषण करें',
    clustersFound: 'सक्रिय समस्या समूह',
    ticketsLinked: 'जुड़े हुए टिकट',
    highSeverityClusters: 'गंभीर / उच्च प्राथमिकता समूह',
    lastAnalyzed: 'अंतिम विश्लेषण',
    createTask: 'रखरखाव कार्य बनाएँ',
    partOfRootCause: 'मूल-कारण समूह के हिस्से के रूप में पहचाना गया',
    permanentFix: 'स्थायी इंजीनियरिंग समाधान',
    preventiveAction: 'निवारक उपाय',
    costBand: 'अनुमानित लागत श्रेणी',
    scope: 'प्रभावित दायरा',

    // Resolution Verification
    markFixed: 'समाधान दर्ज करें',
    resolutionModalTitle: 'साक्ष्य-आधारित समाधान सत्यापन',
    resolutionModalSubtitle: 'एआई सत्यापन के लिए मरम्मत के बाद की फोटो और नोट अपलोड करें।',
    afterPhotoLabel: 'मरम्मत के बाद की फोटो प्रमाण',
    resolutionNoteLabel: 'किए गए कार्य का विवरण',
    partsUsedLabel: 'उपयोग किए गए पुर्जे/औजार (वैकल्पिक)',
    submitVerification: 'एआई से समाधान सत्यापित करें',
    samePhotoError: 'अस्वीकृत: बाद की फोटो पहली फोटो के समान है। कृपया वास्तविक मरम्मत की फोटो अपलोड करें।',
    uploadBetterPhoto: 'स्पष्ट फोटो अपलोड करें',
    escalateToAdmin: 'प्रशासक को अग्रेषित करें',
    awaitingStudent: 'छात्र की पुष्टि प्रतीक्षित',
    verifiedByAi: 'एआई द्वारा समाधान सत्यापित',
    notVerifiedByAi: 'सत्यापन अनिर्णायक / असफल',
    studentConfirmTitle: 'कृपया मरम्मत कार्य की पुष्टि करें',
    studentConfirmPrompt: 'तकनीशियन ने प्रमाणित फोटो के साथ कार्य पूर्ण किया है। क्या समस्या हल हो गई है?',
    yesItsFixed: 'हाँ, समस्या हल हो गई!',
    noStillNotFixed: 'नहीं, अभी भी समस्या है',
    reopenReasonPrompt: 'कृपया बताएं कि क्या अभी भी ठीक नहीं हुआ है:',
    beforePhoto: 'मरम्मत से पहले',
    afterPhoto: 'मरम्मत के बाद',
    confidence: 'विश्वसनीयता',

    // Demo Data
    loadAiDemoData: 'एआई डेमो डेटा लोड करें',
    clearAiDemoData: 'एआई डेमो डेटा साफ करें',
    aiDemoDataLoaded: '6 विद्युत समूह टिकट, 2 सत्यापन टिकट और 1 पुनः खोला गया टिकट लोड किया गया।',
    aiDemoDataCleared: 'एआई डेमो डेटा सफलतापूर्वक साफ कर दिया गया।',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('campusaccord_language');
      if (stored === 'hi' || stored === 'en') return stored;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusaccord_language', lang);
    }
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
