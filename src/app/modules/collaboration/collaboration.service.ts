import prisma from '../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { 
  IStudyGroupCreate, 
  IStudyGroupUpdate, 
  IStudyGroupFilters,
  INoteCreate,
  INoteUpdate,
  INoteFilters,
  ICollaborationStats,
  IActivityItem,
  GroupRole,
  DEFAULT_GROUP_SETTINGS
} from './collaboration.types';

// Study Groups Services
const createStudyGroup = async (userId: string, payload: IStudyGroupCreate) => {
  const groupData = {
    name: payload.name,
    description: payload.description,
    subject: payload.subject,
    isPublic: payload.isPublic ?? DEFAULT_GROUP_SETTINGS.isPublic,
    maxMembers: payload.maxMembers ?? DEFAULT_GROUP_SETTINGS.maxMembers,
    creatorId: userId
  };

  const result = await prisma.$transaction(async (tx) => {
    // Create the study group
    const newGroup = await tx.studyGroup.create({
      data: groupData,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Add creator as admin member
    await tx.studyGroupMember.create({
      data: {
        userId,
        studyGroupId: newGroup.id,
        role: GroupRole.ADMIN
      }
    });

    return newGroup;
  });

  return result;
};

const getStudyGroups = async (userId: string, filters: IStudyGroupFilters, page = 1, limit = 10) => {
  const where: any = {};

  if (filters.subject) {
    where.subject = {
      contains: filters.subject,
      mode: 'insensitive'
    };
  }

  if (filters.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive'
    };
  }

  if (filters.isPublic !== undefined) {
    where.isPublic = filters.isPublic;
  }

  if (filters.creatorId) {
    where.creatorId = filters.creatorId;
  }

  // If not filtering by creator, show only public groups or groups the user is a member of
  if (!filters.creatorId) {
    where.OR = [
      { isPublic: true },
      { 
        members: {
          some: { userId }
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  const [studyGroups, total] = await Promise.all([
    prisma.studyGroup.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        _count: {
          select: { members: true, notes: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.studyGroup.count({ where })
  ]);

  return {
    data: studyGroups,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getStudyGroupById = async (userId: string, groupId: string) => {
  const studyGroup = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { joinedAt: 'asc' }
      },
      notes: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!studyGroup) {
    throw new ApiError(404, 'Study group not found');
  }

  // Check if user has access to this group
  const isMember = studyGroup.members.some(member => member.userId === userId);
  const isCreator = studyGroup.creatorId === userId;

  if (!studyGroup.isPublic && !isMember && !isCreator) {
    throw new ApiError(403, 'Access denied to this private group');
  }

  return studyGroup;
};

const updateStudyGroup = async (userId: string, groupId: string, payload: IStudyGroupUpdate) => {
  const group = await getStudyGroupById(userId, groupId);
  
  // Check if user is admin or creator
  const userMember = group.members.find(member => member.userId === userId);
  if (group.creatorId !== userId && userMember?.role !== GroupRole.ADMIN) {
    throw new ApiError(403, 'Only admins can update the group');
  }

  const updatedGroup = await prisma.studyGroup.update({
    where: { id: groupId },
    data: payload,
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  return updatedGroup;
};

const deleteStudyGroup = async (userId: string, groupId: string) => {
  const group = await getStudyGroupById(userId, groupId);
  
  // Only creator can delete the group
  if (group.creatorId !== userId) {
    throw new ApiError(403, 'Only the creator can delete the group');
  }

  await prisma.studyGroup.delete({
    where: { id: groupId }
  });

  return { message: 'Study group deleted successfully' };
};

const joinStudyGroup = async (userId: string, groupId: string) => {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } }
  });

  if (!group) {
    throw new ApiError(404, 'Study group not found');
  }

  if (!group.isPublic) {
    throw new ApiError(403, 'Cannot join private group without invitation');
  }

  if (group._count.members >= group.maxMembers) {
    throw new ApiError(400, 'Group is full');
  }

  // Check if already a member
  const existingMember = await prisma.studyGroupMember.findUnique({
    where: {
      userId_studyGroupId: {
        userId,
        studyGroupId: groupId
      }
    }
  });

  if (existingMember) {
    throw new ApiError(400, 'Already a member of this group');
  }

  const newMember = await prisma.studyGroupMember.create({
    data: {
      userId,
      studyGroupId: groupId,
      role: GroupRole.MEMBER
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      studyGroup: {
        select: { id: true, name: true, subject: true }
      }
    }
  });

  return newMember;
};

const leaveStudyGroup = async (userId: string, groupId: string) => {
  const group = await getStudyGroupById(userId, groupId);
  
  // Creator cannot leave their own group
  if (group.creatorId === userId) {
    throw new ApiError(400, 'Group creator cannot leave the group. Transfer ownership or delete the group instead.');
  }

  const member = await prisma.studyGroupMember.findUnique({
    where: {
      userId_studyGroupId: {
        userId,
        studyGroupId: groupId
      }
    }
  });

  if (!member) {
    throw new ApiError(400, 'Not a member of this group');
  }

  await prisma.studyGroupMember.delete({
    where: { id: member.id }
  });

  return { message: 'Left study group successfully' };
};

const updateMemberRole = async (userId: string, groupId: string, memberId: string, newRole: GroupRole) => {
  const group = await getStudyGroupById(userId, groupId);
  
  // Check if user is admin or creator
  const userMember = group.members.find(member => member.userId === userId);
  if (group.creatorId !== userId && userMember?.role !== GroupRole.ADMIN) {
    throw new ApiError(403, 'Only admins can update member roles');
  }

  const targetMember = await prisma.studyGroupMember.findFirst({
    where: {
      id: memberId,
      studyGroupId: groupId
    }
  });

  if (!targetMember) {
    throw new ApiError(404, 'Member not found in this group');
  }

  // Cannot change creator's role
  if (targetMember.userId === group.creatorId) {
    throw new ApiError(400, "Cannot change creator's role");
  }

  const updatedMember = await prisma.studyGroupMember.update({
    where: { id: memberId },
    data: { role: newRole },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      }
    }
  });

  return updatedMember;
};

// Notes Services
const createNote = async (userId: string, payload: INoteCreate) => {
  // If note is for a study group, verify user is a member
  if (payload.studyGroupId) {
    const member = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId,
          studyGroupId: payload.studyGroupId
        }
      }
    });

    if (!member) {
      throw new ApiError(403, 'You must be a member of the group to share notes');
    }
  }

  const noteData = {
    title: payload.title,
    content: payload.content,
    subject: payload.subject,
    tags: payload.tags || [],
    isPublic: payload.isPublic ?? false,
    userId,
    studyGroupId: payload.studyGroupId
  };

  const newNote = await prisma.note.create({
    data: noteData,
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      studyGroup: {
        select: { id: true, name: true, subject: true }
      }
    }
  });

  return newNote;
};

const getNotes = async (userId: string, filters: INoteFilters, page = 1, limit = 10) => {
  const where: any = {};

  // User can see their own notes, public notes, and notes from groups they're in
  where.OR = [
    { userId }, // Own notes
    { isPublic: true }, // Public notes
    { 
      studyGroup: {
        members: {
          some: { userId }
        }
      }
    } // Group notes where user is member
  ];

  if (filters.subject) {
    where.subject = {
      contains: filters.subject,
      mode: 'insensitive'
    };
  }

  if (filters.title) {
    where.title = {
      contains: filters.title,
      mode: 'insensitive'
    };
  }

  if (filters.studyGroupId) {
    where.studyGroupId = filters.studyGroupId;
  }

  if (filters.isPublic !== undefined) {
    where.isPublic = filters.isPublic;
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags
    };
  }

  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        studyGroup: {
          select: { id: true, name: true, subject: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.note.count({ where })
  ]);

  return {
    data: notes,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getNoteById = async (userId: string, noteId: string) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      studyGroup: {
        select: { id: true, name: true, subject: true }
      }
    }
  });

  if (!note) {
    throw new ApiError(404, 'Note not found');
  }

  // Check access permissions
  const hasAccess = 
    note.userId === userId || // Own note
    note.isPublic || // Public note
    (note.studyGroupId && await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId,
          studyGroupId: note.studyGroupId
        }
      }
    })); // Group note where user is member

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied to this note');
  }

  return note;
};

const updateNote = async (userId: string, noteId: string, payload: INoteUpdate) => {
  const note = await getNoteById(userId, noteId);
  
  // Only the note owner can update it
  if (note.userId !== userId) {
    throw new ApiError(403, 'Only the note owner can update it');
  }

  // If changing study group, verify user is a member of the new group
  if (payload.studyGroupId && payload.studyGroupId !== note.studyGroupId) {
    const member = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId,
          studyGroupId: payload.studyGroupId
        }
      }
    });

    if (!member) {
      throw new ApiError(403, 'You must be a member of the group to share notes there');
    }
  }

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: payload,
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      studyGroup: {
        select: { id: true, name: true, subject: true }
      }
    }
  });

  return updatedNote;
};

const deleteNote = async (userId: string, noteId: string) => {
  const note = await getNoteById(userId, noteId);
  
  // Only the note owner can delete it
  if (note.userId !== userId) {
    throw new ApiError(403, 'Only the note owner can delete it');
  }

  await prisma.note.delete({
    where: { id: noteId }
  });

  return { message: 'Note deleted successfully' };
};

const getCollaborationStats = async (userId: string) => {
  const [
    totalGroups,
    myGroups,
    joinedGroups,
    totalNotes,
    publicNotes,
    groupNotes,
    popularSubjects
  ] = await Promise.all([
    // Total accessible groups
    prisma.studyGroup.count({
      where: {
        OR: [
          { isPublic: true },
          { members: { some: { userId } } }
        ]
      }
    }),
    // Groups created by user
    prisma.studyGroup.count({
      where: { creatorId: userId }
    }),
    // Groups user has joined
    prisma.studyGroupMember.count({
      where: { 
        userId,
        studyGroup: { creatorId: { not: userId } }
      }
    }),
    // Total notes accessible to user
    prisma.note.count({
      where: {
        OR: [
          { userId },
          { isPublic: true },
          { studyGroup: { members: { some: { userId } } } }
        ]
      }
    }),
    // Public notes count
    prisma.note.count({
      where: { isPublic: true }
    }),
    // Group notes count
    prisma.note.count({
      where: { 
        studyGroupId: { not: null },
        studyGroup: { members: { some: { userId } } }
      }
    }),
    // Popular subjects
    prisma.studyGroup.groupBy({
      by: ['subject'],
      where: {
        OR: [
          { isPublic: true },
          { members: { some: { userId } } }
        ]
      },
      _count: { subject: true },
      orderBy: { _count: { subject: 'desc' } },
      take: 5
    })
  ]);

  const stats: ICollaborationStats = {
    totalGroups,
    myGroups,
    joinedGroups,
    totalNotes,
    publicNotes,
    groupNotes,
    popularSubjects: popularSubjects.map(item => ({
      subject: item.subject,
      count: item._count.subject
    })),
    recentActivity: [] // Can be implemented with activity tracking
  };

  return stats;
};

const searchGroups = async (userId: string, query: string, limit = 10) => {
  const groups = await prisma.studyGroup.findMany({
    where: {
      AND: [
        {
          OR: [
            { isPublic: true },
            { members: { some: { userId } } }
          ]
        },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      _count: {
        select: { members: true, notes: true }
      }
    },
    take: limit
  });

  return groups;
};

const getPopularTags = async (userId: string) => {
  const notes = await prisma.note.findMany({
    where: {
      OR: [
        { userId },
        { isPublic: true },
        { studyGroup: { members: { some: { userId } } } }
      ]
    },
    select: { tags: true }
  });

  const tagCount = new Map<string, number>();
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};

export const CollaborationServices = {
  createStudyGroup,
  getStudyGroups,
  getStudyGroupById,
  updateStudyGroup,
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  updateMemberRole,
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getCollaborationStats,
  searchGroups,
  getPopularTags
};