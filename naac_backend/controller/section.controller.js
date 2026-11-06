const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");
const bcrypt = require("bcrypt");

// GET /api/sections
const getAllSections = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message,
    });
  }
};

// POST /api/sections
const createSection = async (req, res) => {
  try {
    const { name, code, schoolName, inchargeName, email, password } = req.body;

    if (!name || !code || !email || !password) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Section name, code, email, and password are required",
      });
    }

    const existingName = await prisma.section.findUnique({ where: { name } });
    if (existingName) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "Section with this name already exists",
      });
    }

    const existingCode = await prisma.section.findUnique({ where: { code } });
    if (existingCode) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "Section with this code already exists",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }],
      },
    });
    if (existingUser) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "User account with this username/email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const section = await prisma.section.create({
      data: {
        name,
        code: code.toUpperCase(),
        schoolName: schoolName || "School of Sciences",
        inchargeName: inchargeName || null,
        email,
      },
    });

    // Create User with role 'section'
    await prisma.user.create({
      data: {
        username: inchargeName || `Head ${name}`,
        email,
        password: hashedPassword,
        role: "section",
      },
    });

    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "Section and login account created successfully",
      data: section,
    });
  } catch (error) {
    console.error("Error creating section:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create section",
      error: error.message,
    });
  }
};

// PUT /api/sections/:id
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, inchargeName, email, password } = req.body;

    const oldSec = await prisma.section.findUnique({
      where: { id: parseInt(id) },
    });
    if (!oldSec) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "Section not found",
      });
    }

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        type,
        inchargeName,
        email,
      },
    });

    // Update user credentials
    const updateUserData = {
      username: inchargeName || `Head ${name}`,
      email: email || oldSec.email,
    };
    if (password) {
      updateUserData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.updateMany({
      where: { email: oldSec.email },
      data: updateUserData,
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Section and credentials updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update section",
      error: error.message,
    });
  }
};

// DELETE /api/sections/:id
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const sec = await prisma.section.findUnique({
      where: { id: parseInt(id) },
    });
    if (!sec) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "Section not found",
      });
    }

    await prisma.section.delete({
      where: { id: parseInt(id) },
    });

    await prisma.user.deleteMany({
      where: { email: sec.email },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Section and its login account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete section",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
};
