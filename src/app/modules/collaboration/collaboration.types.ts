export interface IStudyGroup {
  id?: string;
  name: string;
  description?: string;
  subject: string;
  isPublic: boolean;
  maxMembers: number;
  creatorId: string;
  creator?: IUser;
  members?: IStudyGroupMember[];
  notes?: INote[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudyGroupMember {
  id?: string;
  role: GroupRole;
  joinedAt: Date;
  userId: string;
  user?: IUser;
  studyGroupId: string;
  studyGroup?: IStudyGroup;
}

export interface INote {
  id?: string;
  title: string;
  content: string;
  subject?: string;
  tags: string[];
  isPublic: boolean;
  userId: string;
  user?: IUser;
  studyGroupId?: string;
  studyGroup?: IStudyGroup;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export enum GroupRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export interface IStudyGroupCreate {
  name: string;
  description?: string;
  subject: string;
  isPublic?: boolean;
  maxMembers?: number;
}

export interface IStudyGroupUpdate {
  name?: string;
  description?: string;
  subject?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

export interface INoteCreate {
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  isPublic?: boolean;
  studyGroupId?: string;
}

export interface INoteUpdate {
  title?: string;
  content?: string;
  subject?: string;
  tags?: string[];
  isPublic?: boolean;
  studyGroupId?: string;
}

export interface IStudyGroupFilters {
  subject?: string;
  isPublic?: boolean;
  name?: string;
  creatorId?: string;
}

export interface INoteFilters {
  subject?: string;
  isPublic?: boolean;
  studyGroupId?: string;
  tags?: string[];
  title?: string;
}

export interface IGroupInvitation {
  groupId: string;
  inviteeEmail: string;
  message?: string;
}

export interface ICollaborationStats {
  totalGroups: number;
  myGroups: number;
  joinedGroups: number;
  totalNotes: number;
  publicNotes: number;
  groupNotes: number;
  popularSubjects: { subject: string; count: number }[];
  recentActivity: IActivityItem[];
}

export interface IActivityItem {
  type: "group_created" | "group_joined" | "note_shared" | "member_added";
  message: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  groupId?: string;
  groupName?: string;
}

export interface IStudySession {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  scheduledTime: Date;
  duration: number; // in minutes
  meetingLink?: string;
  participants: string[]; // user IDs
  status: SessionStatus;
  createdBy: string;
}

export enum SessionStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IStudySessionCreate {
  title: string;
  description?: string;
  scheduledTime: Date;
  duration: number;
  meetingLink?: string;
}

export const DEFAULT_GROUP_SETTINGS = {
  maxMembers: 10,
  isPublic: false,
} as const;

export const COMMON_STUDY_SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Economics",
  "Psychology",
  "Philosophy",
  "Sociology",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Languages",
] as const;
