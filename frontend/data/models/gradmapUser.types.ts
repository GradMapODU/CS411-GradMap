// ======================================================
// #region GradMap User Schema
// ======================================================
// ======================================================
// #region Types
// ======================================================
export type UserRole            = "student" | "advisor" | "admin";
export type AccountStatus       = "active"  | "disabled";
export type TermSeason          = "Spring"  | "Summer"  | "Fall" | "Winter";
export type NotificationChannel = "email"   | "sms"     | "inApp";
// #endregion
// ======================================================
// ======================================================
// #region User Profile
// ======================================================
export interface GradMapUser {
  // Identity
  // -------------   
  id: string;
  username: string;
  displayName: string;
  email?: string;

  // Access
  // -------------  
  roles: UserRole[];
  status: AccountStatus;

  // Timestamp
  // -------------  
  createdAt?: string;

  // Role info
  // -------------  
  student?: StudentProfile;
  advisor?: AdvisorProfile;
  admin?: AdminProfile;

  auth?: {
    provider: "mock" | "oduSSO";
    lastLoginAt?: string;
  };
}
// #endregion
// ======================================================
// ======================================================
// #region Student Profile
// ======================================================
export interface StudentProfile {
    studentId?: string;                 // Unique student generated ID 
    major?: string;                     // What is their major
    startYear: number;                  // When did the student start

    currentSchedule?: Course[];         // Courses currently enrolled in 
    completedCourses: Course[];         // Total list of courses completed 

    // Don't believe we need this
    //classification: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";

  expectedGraduation: {
    season: TermSeason;
    year: number;
  };

  degreePlan: {
    // Add to this
    // Minor?
    // Concentration? 
    plan: PlannedTerm[];                // Courses Planned for a specific term
  };

  academics: {
    creditsEarned: number;
    creditsInProgress: number;
    gpa?: number;
  };

  advising?: {
    assignedAdvisorIds: string[];       // ID of connected advisor

    lastAdvisedAt?: string;                                 
    appointmentHistory?: AdvisingAppointment[];
  };
}
// #endregion
// ======================================================
// ======================================================
// #region Advisor Profile
// ======================================================
export interface AdvisorProfile {
    advisorId: string;
    department?: string;
    studentCaseloadIds: string[];
    appointments?: AdvisingAppointment[];
}
// #endregion
// ======================================================
// ======================================================
// #region Admin Profile
// ======================================================
export interface AdminProfile {
  adminId: string;
  canRunReports: boolean;
}
// #endregion
// ======================================================
// ======================================================
// #region Helpers 
// ======================================================
// ---------------- Shared ----------------
export interface PlannedTerm {
  term: string;                 // "Fall 2026"
  courses: Course[];
}

export interface Course {
    courseCode: string
    credits: number;
    // Optional
    title?: string;
    section?: string;
    term?: string;
    status?: "enrolled" | "completed" | "dropped";
}

export interface AdvisingAppointment {
    appointmentId: string;
    studentUserId: string;
    advisorUserId: string;

    startsAt: string;
    endsAt: string;

    status: "scheduled" | "completed" | "noShow" | "cancelled";

    location?: string;
    summary?: string;
}
// #endregion
// ======================================================
// #endregion
// ======================================================