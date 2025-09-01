import { z } from "zod";
import { GroupRole } from "./collaboration.types";

export const createStudyGroupSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Group name is required",
      })
      .min(1, "Group name cannot be empty")
      .max(100, "Group name too long"),

    description: z.string().max(500, "Description too long").optional(),

    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(1, "Subject cannot be empty"),

    isPublic: z.boolean().optional(),

    maxMembers: z
      .number()
      .int()
      .min(2, "Group must allow at least 2 members")
      .max(50, "Maximum 50 members allowed")
      .optional(),
  }),
});

export const updateStudyGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Group name cannot be empty")
      .max(100, "Group name too long")
      .optional(),
    description: z.string().max(500, "Description too long").optional(),
    subject: z.string().min(1, "Subject cannot be empty").optional(),
    isPublic: z.boolean().optional(),
    maxMembers: z
      .number()
      .int()
      .min(2, "Group must allow at least 2 members")
      .max(50, "Maximum 50 members allowed")
      .optional(),
  }),
});

export const getStudyGroupsSchema = z.object({
  query: z.object({
    subject: z.string().optional(),
    isPublic: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    name: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getStudyGroupSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Group ID is required",
    }),
  }),
});

export const deleteStudyGroupSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Group ID is required",
    }),
  }),
});

export const joinGroupSchema = z.object({
  params: z.object({
    groupId: z.string({
      required_error: "Group ID is required",
    }),
  }),
});

export const leaveGroupSchema = z.object({
  params: z.object({
    groupId: z.string({
      required_error: "Group ID is required",
    }),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(GroupRole, {
      required_error: "Role is required",
      invalid_type_error: "Invalid role",
    }),
  }),
  params: z.object({
    groupId: z.string({
      required_error: "Group ID is required",
    }),
    memberId: z.string({
      required_error: "Member ID is required",
    }),
  }),
});

export const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Note title is required",
      })
      .min(1, "Note title cannot be empty")
      .max(200, "Title too long"),

    content: z
      .string({
        required_error: "Note content is required",
      })
      .min(1, "Note content cannot be empty"),

    subject: z.string().optional(),

    tags: z.array(z.string()).optional(),

    isPublic: z.boolean().optional(),

    studyGroupId: z.string().optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Note title cannot be empty")
      .max(200, "Title too long")
      .optional(),
    content: z.string().min(1, "Note content cannot be empty").optional(),
    subject: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    studyGroupId: z.string().optional(),
  }),
});

export const getNotesSchema = z.object({
  query: z.object({
    subject: z.string().optional(),
    isPublic: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    studyGroupId: z.string().optional(),
    tags: z.string().optional(), // comma-separated tags
    title: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getNoteSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Note ID is required",
    }),
  }),
});

export const deleteNoteSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Note ID is required",
    }),
  }),
});

export const createStudySessionSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Session title is required",
      })
      .min(1, "Session title cannot be empty"),

    description: z.string().optional(),

    scheduledTime: z
      .string({
        required_error: "Scheduled time is required",
      })
      .datetime(),

    duration: z
      .number({
        required_error: "Duration is required",
      })
      .int()
      .min(15, "Minimum duration is 15 minutes")
      .max(480, "Maximum duration is 8 hours"),

    meetingLink: z.string().url().optional(),
  }),
  params: z.object({
    groupId: z.string({
      required_error: "Group ID is required",
    }),
  }),
});
