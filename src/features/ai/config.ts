// Central Feature Flags for AI extensions
// If any flag is set to false, that feature's UI is unmounted and existing flow behaves as before.
export const AI_FEATURES = {
  investigator: true, // Feature A: AI Complaint Investigator (Management + Admin)
  rootCause: true,    // Feature B: AI Root-Cause Detection (Admin page + Management card)
  verification: true, // Feature C: Evidence-Based Resolution Verification
};
