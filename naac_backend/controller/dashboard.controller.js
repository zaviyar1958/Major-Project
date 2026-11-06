const prisma = require("../config/db.config");
const httpstatusConstant = require("../constant/httpstatus.constant");

// Helper to calculate NAAC Grade from CGPA
const calculateGrade = (cgpa) => {
  if (cgpa >= 3.51) return { grade: "A++", status: "Accredited", color: "green" };
  if (cgpa >= 3.26) return { grade: "A+", status: "Accredited", color: "green" };
  if (cgpa >= 3.01) return { grade: "A", status: "Accredited", color: "emerald" };
  if (cgpa >= 2.76) return { grade: "B++", status: "Accredited", color: "blue" };
  if (cgpa >= 2.51) return { grade: "B+", status: "Accredited", color: "blue" };
  if (cgpa >= 2.01) return { grade: "B", status: "Accredited", color: "yellow" };
  if (cgpa >= 1.51) return { grade: "C", status: "Accredited", color: "orange" };
  return { grade: "D", status: "Not Accredited", color: "red" };
};

// GET /api/dashboard/metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const academicYear = req.query.academicYear || "2024-25";

    // 1. Organizational Counts
    const [totalSchools, totalDepartments, totalSections, totalFaculty] = await Promise.all([
      prisma.school.count(),
      prisma.department.count(),
      prisma.section.count(),
      prisma.faculty.count(),
    ]);

    // 2. Total Research Papers (sum of researchCount across faculty)
    const researchAgg = await prisma.faculty.aggregate({
      _sum: { researchCount: true },
    });
    const totalResearchPapers = researchAgg._sum.researchCount || 0;

    // 3. Student count: Dynamically aggregate enrolled students across all departments & programmes for the academic year
    const enrollmentAgg = await prisma.programEnrollment.aggregate({
      where: { academicYear },
      _sum: { enrolledStudents: true },
    });
    
    // Check if any departments have entered enrollments
    const enrolledTotal = enrollmentAgg._sum.enrolledStudents;
    let totalStudents = 0;
    if (enrolledTotal !== null && enrolledTotal !== undefined) {
      totalStudents = enrolledTotal;
    } else {
      // Fallback to studentMetric if available, otherwise 0
      const studentMetric = await prisma.studentMetric.findFirst({
        where: { academicYear },
      });
      totalStudents = studentMetric ? studentMetric.totalStudents : 0;
    }

    // 4. Criteria & Weighted CGPA
    const criteria = await prisma.naacCriterion.findMany({
      where: { academicYear },
      orderBy: { criterionNumber: "asc" },
    });

    let totalWeightage = 0;
    let totalWeightedPoints = 0;

    criteria.forEach((c) => {
      totalWeightage += c.weightage;
      // Formula: (score / 100) * 4.0 = grade point out of 4.0
      const pointOutOfFour = (c.score / 100) * 4.0;
      totalWeightedPoints += c.weightage * pointOutOfFour;
    });

    const rawCgpa = totalWeightage > 0 ? totalWeightedPoints / totalWeightage : 0;
    const cgpa = parseFloat(rawCgpa.toFixed(2));
    const gradeInfo = calculateGrade(cgpa);

    return res.status(httpstatusConstant.OK).json({
      success: true,
      data: {
        academicYear,
        keyMetrics: {
          totalSchools,
          totalDepartments,
          totalSections,
          totalFaculty,
          totalStudents,
          totalResearchPapers,
          cgpa,
          cgpaScale: "4.0",
          grade: gradeInfo.grade,
          accreditationStatus: gradeInfo.status,
        },
        criteria: criteria.map((c) => ({
          id: c.id,
          number: c.criterionNumber,
          criteria: c.title,
          description: c.description,
          weightage: c.weightage,
          score: Math.round(c.score),
          maxScore: 100,
          status: c.score >= 85 ? "excellent" : c.score >= 70 ? "good" : "needs_improvement",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    });
  }
};

// PUT /api/dashboard/criteria/:id
const updateCriterionScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(httpstatusConstant.BAD_REQUEST).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    const updated = await prisma.naacCriterion.update({
      where: { id: parseInt(id) },
      data: { score: parseFloat(score) },
    });

    return res.status(httpstatusConstant.OK).json({
      success: true,
      message: "Criterion score updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating criterion:", error);
    return res.status(httpstatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update criterion",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardMetrics,
  updateCriterionScore,
};
