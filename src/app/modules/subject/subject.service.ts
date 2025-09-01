// Re-export from modular services for backward compatibility
export * from "./services/focus-session.service";
export * from "./services/study-session.service";
export * from "./services/subject-analytics.service";
export * from "./services/subject-crud.service";

// Import utilities for re-export
export { updateSubjectHours } from "./utils/subject.utils";
