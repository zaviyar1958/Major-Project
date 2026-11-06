const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const { departmentId, programId, search } = req.query;
    const where = {};

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (programId && programId !== "All") {
      where.programId = parseInt(programId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        program: {
          select: { id: true, name: true, code: true, level: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        revisionHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { code: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: courses.map((c) => ({
        ...c,
        programName: c.program?.name || "Unassigned",
        programCode: c.program?.code || "-",
        departmentName: c.department?.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// POST /api/courses
const createCourse = async (req, res) => {
  try {
    const {
      name,
      code,
      departmentId,
      programId,
      credits,
      yearOfOffering,
      yearOfRevision,
      academicYear,
      isEmployability,
      isSkillDev,
      isEntrepreneurship,
      isValueAdded,
      isOnlineMOOC,
    } = req.body;

    if (!name || !code || !departmentId) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Course name, code, and department are required",
      });
    }

    const existing = await prisma.course.findUnique({
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
        message: "A course with this code already exists in this department",
      });
    }

    const offeringYr = yearOfOffering ? parseInt(yearOfOffering) : new Date().getFullYear();
    // For a new course, offering year is also the initial revision year unless specified
    const revisionYr = yearOfRevision ? parseInt(yearOfRevision) : offeringYr;

    // Create course and log INTRODUCED in revisionHistory
    const newCourse = await prisma.course.create({
      data: {
        name,
        code: code.toUpperCase(),
        departmentId: parseInt(departmentId),
        programId: programId ? parseInt(programId) : null,
        credits: credits ? parseInt(credits) : 4,
        yearOfOffering: offeringYr,
        yearOfRevision: revisionYr,
        isEmployability: Boolean(isEmployability),
        isSkillDev: Boolean(isSkillDev),
        isEntrepreneurship: Boolean(isEntrepreneurship),
        isValueAdded: Boolean(isValueAdded),
        isOnlineMOOC: Boolean(isOnlineMOOC),
        revisionHistory: {
          create: [
            {
              eventType: "INTRODUCED",
              academicYear: academicYear || `${offeringYr}-${(offeringYr + 1).toString().slice(-2)}`,
              revisionYear: revisionYr,
              remarks: `Course introduced in academic year ${offeringYr}`,
            },
          ],
        },
      },
      include: {
        revisionHistory: true,
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      programId,
      credits,
      yearOfOffering,
      yearOfRevision,
      academicYear,
      remarks,
      isEmployability,
      isSkillDev,
      isEntrepreneurship,
      isValueAdded,
      isOnlineMOOC,
    } = req.body;

    const courseId = parseInt(id);
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "Course not found",
      });
    }

    const newRevYear =
      yearOfRevision !== undefined ? parseInt(yearOfRevision) : undefined;
    const isRevisionChanged =
      newRevYear !== undefined && newRevYear !== existingCourse.yearOfRevision;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        programId:
          programId !== undefined
            ? programId
              ? parseInt(programId)
              : null
            : undefined,
        credits: credits !== undefined ? parseInt(credits) : undefined,
        yearOfOffering:
          yearOfOffering !== undefined ? parseInt(yearOfOffering) : undefined,
        yearOfRevision: newRevYear,
        isEmployability:
          isEmployability !== undefined ? Boolean(isEmployability) : undefined,
        isSkillDev: isSkillDev !== undefined ? Boolean(isSkillDev) : undefined,
        isEntrepreneurship:
          isEntrepreneurship !== undefined
            ? Boolean(isEntrepreneurship)
            : undefined,
        isValueAdded:
          isValueAdded !== undefined ? Boolean(isValueAdded) : undefined,
        isOnlineMOOC:
          isOnlineMOOC !== undefined ? Boolean(isOnlineMOOC) : undefined,
      },
    });

    // If revision year is updated or explicitly logged, record in history
    if (isRevisionChanged || remarks) {
      await prisma.courseRevisionHistory.create({
        data: {
          courseId,
          eventType: "REVISED",
          academicYear:
            academicYear ||
            (newRevYear
              ? `${newRevYear}-${(newRevYear + 1).toString().slice(-2)}`
              : null),
          revisionYear: newRevYear || existingCourse.yearOfRevision || 2024,
          remarks:
            remarks ||
            `Course syllabus revised to Year ${newRevYear || existingCourse.yearOfRevision}`,
        },
      });
    }

    const freshCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        revisionHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Course updated successfully",
      data: freshCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: parseInt(id) },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
