import prisma from "../../../shared/prisma";

// Helper function to update subject total hours
const updateSubjectHours = async (subjectId: string, hoursToAdd: number) => {
  await prisma.subject.update({
    where: { id: subjectId },
    data: {
      totalHoursStudied: {
        increment: hoursToAdd,
      },
    },
  });
};

export { updateSubjectHours };
