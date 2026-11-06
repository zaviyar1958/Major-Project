const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// GET /api/schools
const getAllSchools = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { departments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: schools.map((s) => ({
        ...s,
        departmentsCount: s._count.departments,
      })),
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch schools",
      error: error.message,
    });
  }
};

// POST /api/schools
const createSchool = async (req, res) => {
  try {
    const { name, code, deanName, deanEmail } = req.body;

    if (!name || !code) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "School name and code are required",
      });
    }

    const existingName = await prisma.school.findUnique({ where: { name } });
    if (existingName) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "A school with this name already exists",
      });
    }

    const existingCode = await prisma.school.findUnique({ where: { code } });
    if (existingCode) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "A school with this code already exists",
      });
    }

    const school = await prisma.school.create({
      data: {
        name,
        code: code.toUpperCase(),
        deanName: deanName || null,
        deanEmail: deanEmail || null,
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "School created successfully",
      data: school,
    });
  } catch (error) {
    console.error("Error creating school:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create school",
      error: error.message,
    });
  }
};

// PUT /api/schools/:id
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, deanName, deanEmail } = req.body;

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        deanName,
        deanEmail,
      },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "School updated successfully",
      data: school,
    });
  } catch (error) {
    console.error("Error updating school:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update school",
      error: error.message,
    });
  }
};

// DELETE /api/schools/:id
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.school.delete({
      where: { id: parseInt(id) },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete school",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
};
