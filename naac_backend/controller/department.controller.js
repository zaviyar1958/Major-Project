const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");
const bcrypt = require("bcrypt");

// GET /api/departments
const getAllDepartments = async (req, res) => {
  try {
    const { schoolId } = req.query;
    const where = {};
    if (schoolId) where.schoolId = parseInt(schoolId);

    const departments = await prisma.department.findMany({
      where,
      include: {
        school: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { faculties: true, yearlyData: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        schoolId: d.schoolId,
        schoolName: d.school?.name,
        schoolCode: d.school?.code,
        hodName: d.hodName,
        email: d.email,
        facultiesCount: d._count.faculties,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

// POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { name, code, schoolId, hodName, email, password } = req.body;

    if (!name || !code || !schoolId || !email || !password) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Name, code, school, email, and password are required",
      });
    }

    // Check if name, code, or email already exists
    const existingName = await prisma.department.findUnique({ where: { name } });
    if (existingName) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    const existingCode = await prisma.department.findUnique({ where: { code } });
    if (existingCode) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "Department with this code already exists",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "User account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Department
    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        schoolId: parseInt(schoolId),
        hodName: hodName || null,
        email,
      },
    });

    // 2. Create User account with role 'department' for login
    await prisma.user.create({
      data: {
        username: hodName || `HOD ${name}`,
        email: email,
        password: hashedPassword,
        role: "department",
        departmentId: department.id,
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "Department and login account created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// PUT /api/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, schoolId, hodName, email, password } = req.body;

    const oldDept = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
    if (!oldDept) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "Department not found",
      });
    }

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        schoolId: schoolId ? parseInt(schoolId) : undefined,
        hodName,
        email,
      },
    });

    // Update corresponding user credentials
    const updateUserData = {
      username: hodName || `HOD ${name}`,
      email: email || oldDept.email,
    };
    if (password) {
      updateUserData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.updateMany({
      where: { email: oldDept.email },
      data: updateUserData,
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Department and credentials updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};

// DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const dept = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
    if (!dept) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "Department not found",
      });
    }

    // Delete Department
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });

    // Delete corresponding user account
    await prisma.user.deleteMany({
      where: { email: dept.email },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Department and its login account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
