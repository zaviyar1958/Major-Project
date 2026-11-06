const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// GET /api/criterion/submissions
// Query params: criterionCode, academicYear, departmentId
const getSubmissions = async (req, res) => {
  try {
    const { criterionCode, academicYear = "2024-25", departmentId } = req.query;

    const where = {};
    if (criterionCode) where.criterionCode = criterionCode;
    if (academicYear) where.academicYear = academicYear;
    if (departmentId) where.departmentId = parseInt(departmentId);

    // 1. Fetch submissions
    const submissions = await prisma.criterionSubmission.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            school: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Fetch all departments for summary status overview
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        school: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // 3. Check submission status for 1.1.1 and 1.1.2 per department
    const allCritSubmissions = await prisma.criterionSubmission.findMany({
      where: { academicYear },
      select: {
        departmentId: true,
        criterionCode: true,
        isSubmitted: true,
        updatedAt: true,
        description: true,
      },
    });

    const departmentStatusList = departments.map((dept) => {
      const sub111 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.1.1"
      );
      const sub112 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.1.2"
      );
      const sub121 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.2.1"
      );
      const sub131 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.3.1"
      );
      const sub132 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.3.2"
      );
      const sub133 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.3.3"
      );
      const sub141 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "1.4.1"
      );
      const sub411 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "4.1.1"
      );
      const sub412 = allCritSubmissions.find(
        (s) => s.departmentId === dept.id && s.criterionCode === "4.1.2"
      );

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        departmentCode: dept.code,
        schoolName: dept.school?.name,
        sub111: sub111
          ? {
              status: sub111.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub111.updatedAt,
              hasContent: Boolean(sub111.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub112: sub112
          ? {
              status: sub112.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub112.updatedAt,
              hasContent: Boolean(sub112.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub121: sub121
          ? {
              status: sub121.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub121.updatedAt,
              hasContent: Boolean(sub121.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub131: sub131
          ? {
              status: sub131.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub131.updatedAt,
              hasContent: Boolean(sub131.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub132: sub132
          ? {
              status: sub132.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub132.updatedAt,
              hasContent: Boolean(sub132.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub133: sub133
          ? {
              status: sub133.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub133.updatedAt,
              hasContent: Boolean(sub133.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub141: sub141
          ? {
              status: sub141.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub141.updatedAt,
              hasContent: Boolean(sub141.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub411: sub411
          ? {
              status: sub411.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub411.updatedAt,
              hasContent: Boolean(sub411.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
        sub412: sub412
          ? {
              status: sub412.isSubmitted ? "SUBMITTED" : "DRAFT",
              updatedAt: sub412.updatedAt,
              hasContent: Boolean(sub412.description?.trim()),
            }
          : { status: "NOT_STARTED", updatedAt: null, hasContent: false },
      };
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: submissions,
      departments: departmentStatusList,
    });
  } catch (error) {
    console.error("Error getting criterion submissions:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch criterion submissions",
      error: error.message,
    });
  }
};

// POST /api/criterion/save
// Body: { departmentId, criterionCode, academicYear, description, supportingDoc, additionalFiles, isSubmitted }
const saveSubmission = async (req, res) => {
  try {
    const {
      departmentId,
      criterionCode,
      academicYear = "2024-25",
      description,
      supportingDoc,
      additionalFiles,
      isSubmitted = false,
    } = req.body;

    if (!departmentId || !criterionCode) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "departmentId and criterionCode are required",
      });
    }

    const submission = await prisma.criterionSubmission.upsert({
      where: {
        departmentId_criterionCode_academicYear: {
          departmentId: parseInt(departmentId),
          criterionCode,
          academicYear,
        },
      },
      update: {
        description,
        supportingDoc: supportingDoc || null,
        additionalFiles: additionalFiles || [],
        isSubmitted: Boolean(isSubmitted),
        updatedAt: new Date(),
      },
      create: {
        departmentId: parseInt(departmentId),
        criterionCode,
        academicYear,
        description,
        supportingDoc: supportingDoc || null,
        additionalFiles: additionalFiles || [],
        isSubmitted: Boolean(isSubmitted),
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: isSubmitted ? "Submitted successfully" : "Draft saved successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error saving criterion submission:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to save criterion submission",
      error: error.message,
    });
  }
};

module.exports = {
  getSubmissions,
  saveSubmission,
};
