const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// GET /api/programs
const getAllPrograms = async (req, res) => {
  try {
    const { departmentId, search, academicYear } = req.query;
    const currentYear = academicYear || "2024-25";
    const where = {};

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const programs = await prisma.program.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        enrollments: true,
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: programs.map((p) => {
        const currentEnrollment = p.enrollments?.find(
          (e) => e.academicYear === currentYear
        );
        return {
          ...p,
          departmentName: p.department?.name,
          coursesCount: p._count.courses,
          academicYear: currentYear,
          enrolledStudents: currentEnrollment ? currentEnrollment.enrolledStudents : 0,
          allEnrollments: p.enrollments || [],
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch programs",
      error: error.message,
    });
  }
};

// POST /api/programs
const createProgram = async (req, res) => {
  try {
    const {
      name,
      code,
      level,
      yearOfIntroduction,
      departmentId,
      academicYear,
      enrolledStudents,
      hasFieldProject,
      hasResearchProject,
      hasInternship,
    } = req.body;

    if (!name || !code || !departmentId) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Program name, code, and department are required",
      });
    }

    const existing = await prisma.program.findUnique({
      where: {
        departmentId_code: {
          departmentId: parseInt(departmentId),
          code: code.toUpperCase(),
        },
      },
    });

    if (existing) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "A programme with this code already exists in this department",
      });
    }

    const targetYear = academicYear || "2024-25";
    const studentCount = parseInt(enrolledStudents) || 0;

    const newProgram = await prisma.program.create({
      data: {
        name,
        code: code.toUpperCase(),
        level: level || "PG",
        yearOfIntroduction: yearOfIntroduction
          ? parseInt(yearOfIntroduction)
          : 2020,
        departmentId: parseInt(departmentId),
        hasFieldProject: Boolean(hasFieldProject),
        hasResearchProject: Boolean(hasResearchProject),
        hasInternship: Boolean(hasInternship),
        enrollments: {
          create: [
            {
              academicYear: targetYear,
              enrolledStudents: studentCount,
            },
          ],
        },
      },
      include: {
        enrollments: true,
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "Programme created successfully",
      data: newProgram,
    });
  } catch (error) {
    console.error("Error creating program:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create programme",
      error: error.message,
    });
  }
};

// PUT /api/programs/:id
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      level,
      yearOfIntroduction,
      status,
      academicYear,
      enrolledStudents,
      hasFieldProject,
      hasResearchProject,
      hasInternship,
    } = req.body;

    const progId = parseInt(id);

    // 1. Update basic program details
    const updated = await prisma.program.update({
      where: { id: progId },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        level,
        yearOfIntroduction: yearOfIntroduction
          ? parseInt(yearOfIntroduction)
          : undefined,
        status,
        hasFieldProject:
          hasFieldProject !== undefined ? Boolean(hasFieldProject) : undefined,
        hasResearchProject:
          hasResearchProject !== undefined
            ? Boolean(hasResearchProject)
            : undefined,
        hasInternship:
          hasInternship !== undefined ? Boolean(hasInternship) : undefined,
      },
    });

    // 2. If academicYear is provided, upsert enrollment for that year
    // This guarantees other academic years are preserved!
    if (academicYear !== undefined && enrolledStudents !== undefined) {
      const studentCount = parseInt(enrolledStudents) || 0;
      await prisma.programEnrollment.upsert({
        where: {
          programId_academicYear: {
            programId: progId,
            academicYear: academicYear.trim(),
          },
        },
        update: {
          enrolledStudents: studentCount,
        },
        create: {
          programId: progId,
          academicYear: academicYear.trim(),
          enrolledStudents: studentCount,
        },
      });
    }

    const freshProgram = await prisma.program.findUnique({
      where: { id: progId },
      include: {
        enrollments: true,
      },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Programme updated successfully",
      data: freshProgram,
    });
  } catch (error) {
    console.error("Error updating program:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update programme",
      error: error.message,
    });
  }
};

// DELETE /api/programs/:id
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.program.delete({
      where: { id: parseInt(id) },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Programme deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete programme",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
};
