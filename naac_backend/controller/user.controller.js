const httpstatusConstant = require("../constant/httpstatus.constant");
const { getToken } = require("../middleware/auth.middleware");
const prisma = require("../config/db.config");
const bcrypt = require("bcrypt");

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login req body:", req.body);
    if (!email) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Password is required",
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: email }],
      },
    });
    if (!user) {
      return res.status(httpstatusConstant.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) {
      return res.status(httpstatusConstant.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = await getToken(user);

    let department = null;
    if (user.departmentId) {
      department = await prisma.department.findUnique({
        where: { id: user.departmentId },
        include: {
          school: {
            select: { id: true, name: true, code: true, deanName: true },
          },
        },
      });
    }

    const { password: _, ...safeUser } = user;

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "User login successful",
      data: {
        user: {
          ...safeUser,
          department,
        },
        token: token,
      },
    });
  } catch (error) {
    console.log("error while login:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const Register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!email) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Password is required",
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(httpstatusConstant.CONFLICT).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username: username || null,
        email: email,
        password: hashedPassword,
        role: role || "user",
      },
    });
    return res.status(httpstatusConstant.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.log("error while register:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = {
  Login,
  Register,
};