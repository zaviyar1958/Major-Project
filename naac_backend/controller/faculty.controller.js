const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// GET /api/faculty
const getAllFaculty = async (req, res) => {
  try {
    const { department, departmentId, search } = req.query;
    const where = {};

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    } else if (department && department !== "All") {
      where.OR = [
        { departmentName: department },
        { department: { name: department } },
      ];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { designation: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const faculties = await prisma.faculty.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allDepts = await prisma.department.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: {
        faculties: faculties.map((f) => ({
          ...f,
          department: f.department?.name || f.departmentName || "Unassigned",
        })),
        total: faculties.length,
        departments: allDepts.map((d) => d.name),
      },
    });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch faculty list",
      error: error.message,
    });
  }
};

// POST /api/faculty (to be used by Department HOD Portal)
const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      departmentId,
      departmentName,
      designation,
      qualification,
      experienceYears,
      researchCount,
    } = req.body;

    if (!name || !email || !designation) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Name, email, and designation are required",
      });
    }

    const existing = await prisma.faculty.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "Faculty with this email already exists",
      });
    }

    const newFaculty = await prisma.faculty.create({
      data: {
        name,
        email,
        departmentId: departmentId ? parseInt(departmentId) : null,
        departmentName: departmentName || null,
        designation,
        qualification: qualification || "Ph.D.",
        experienceYears: parseInt(experienceYears) || 0,
        researchCount: parseInt(researchCount) || 0,
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "Faculty member added successfully",
      data: newFaculty,
    });
  } catch (error) {
    console.error("Error creating faculty:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to add faculty member",
      error: error.message,
    });
  }
};

// DELETE /api/faculty/:id
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.faculty.delete({
      where: { id: parseInt(id) },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Faculty member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete faculty member",
      error: error.message,
    });
  }
};

// PUT /api/faculty/:id
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      designation,
      qualification,
      experienceYears,
      researchCount,
      status,
    } = req.body;

    const updated = await prisma.faculty.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        designation,
        qualification,
        experienceYears:
          experienceYears !== undefined ? parseInt(experienceYears) : undefined,
        researchCount:
          researchCount !== undefined ? parseInt(researchCount) : undefined,
        status,
      },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Faculty member updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update faculty member",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
