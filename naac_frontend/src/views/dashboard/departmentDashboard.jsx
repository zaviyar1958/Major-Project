import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FacultyService from "@/service/facultyService";
import DashboardService from "@/service/dashboardService";
import ProgramService from "@/service/programService";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  Users,
  Plus,
  ArrowRight,
  FolderTree,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [facultyCount, setFacultyCount] = useState(0);
  const [totalResearch, setTotalResearch] = useState(0);
  const [enrolledStudents, setEnrolledStudents] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-25");
  const [criteria, setCriteria] = useState([]);

  const deptName =
    user?.department?.name || user?.username || "Academic Department";
  const schoolName =
    user?.department?.school?.name || "School of Study";
  const hodName =
    user?.department?.hodName || user?.username || "Head of Department";

  const fetchDepartmentData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Faculty list for this department
      const params = {};
      if (user?.departmentId) {
        params.departmentId = user.departmentId;
      } else if (user?.department?.name) {
        params.department = user.department.name;
      }

      const facultyRes = await FacultyService.getAllFaculty(params);
      if (facultyRes?.data?.success) {
        const list = facultyRes.data.data.faculties || [];
        setFacultyCount(list.length);
        const sumResearch = list.reduce(
          (acc, f) => acc + (f.researchCount || 0),
          0
        );
        setTotalResearch(sumResearch);
      }

      // 2. Fetch Programs & Enrollment for this department and selected year
      if (user?.departmentId) {
        const progRes = await ProgramService.getAllPrograms({
          departmentId: user.departmentId,
          academicYear: selectedPeriod,
        });
        if (progRes?.data?.success) {
          const progs = progRes.data.data || [];
          setProgramCount(progs.length);
          const totalEnrolled = progs.reduce(
            (sum, p) => sum + (p.enrolledStudents || 0),
            0
          );
          setEnrolledStudents(totalEnrolled);
        }
      }

      // 3. Fetch Criteria for this period
      const dashRes = await DashboardService.getMetrics(selectedPeriod);
      if (dashRes?.data?.success) {
        setCriteria(dashRes.data.data.criteria || []);
      }
    } catch (error) {
      console.error("Error fetching department dashboard data:", error);
      toast.error("Failed to load department metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [user, selectedPeriod]);

  // Key metrics for this specific Department
  const departmentMetrics = [
    {
      title: "Students Enrolled",
      value: enrolledStudents.toLocaleString(),
      subtitle: `Intake (${selectedPeriod})`,
      icon: Users,
      href: "/dashboard/programmes",
      actionText: "Manage Intake",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Degree Programmes",
      value: programCount.toString(),
      subtitle: "Offered by Dept",
      icon: BookOpen,
      href: "/dashboard/programmes",
      actionText: "View Programs",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Teaching Faculty",
      value: facultyCount.toString(),
      subtitle: "Registered in Dept",
      icon: GraduationCap,
      href: "/dashboard/faculty",
      actionText: "Manage Faculty",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Publications",
      value: totalResearch.toString(),
      subtitle: "Scopus / UGC CARE",
      icon: Award,
      href: "/dashboard/criterion/3/3",
      actionText: "View Research",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-600";
    if (score >= 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  HOD Department Portal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {schoolName}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1.5">
                {deptName}
              </h1>
              <p className="text-gray-500 text-xs mt-1">
                Head of Department:{" "}
                <span className="font-semibold text-gray-800">{hodName}</span> •
                Manage teaching faculty and submit departmental NAAC SSR documentation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-2xl bg-white text-gray-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="2024-25">Academic Year 2024-25</option>
                <option value="2023-24">Academic Year 2023-24</option>
                <option value="2022-23">Academic Year 2022-23</option>
              </select>

              <Button
                onClick={() => navigate("/dashboard/faculty")}
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-2xl h-9 px-4 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Faculty
              </Button>
            </div>
          </div>
        </div>

        {/* Section 1: Department Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => item.href && navigate(item.href)}
                className={`bg-white border border-gray-200 rounded-3xl p-5 shadow-sm transition-all duration-150 ${
                  item.href ? "cursor-pointer hover:border-gray-400" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500">
                    {item.title}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${item.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{item.subtitle}</p>
                  {item.actionText && (
                    <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
                      {item.actionText} <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 2: Quick Management Grid & NAAC Criteria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department NAAC Criteria Assessment */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 rounded-3xl shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    NAAC 7 Criteria Assessment
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Departmental data submission and metrics evaluation
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  1000 Total Weightage
                </span>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {criteria.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">
                    Loading criteria indicators...
                  </p>
                ) : (
                  criteria.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/dashboard/criterion/${item.number}/1`)}
                      className="p-3.5 bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer rounded-2xl border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {item.number}
                          </span>
                          <div>
                            <span className="font-semibold text-gray-900">
                              {item.criteria}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-2">
                              (Weightage: {item.weightage} pts)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {item.score}%
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getScoreColor(
                            item.score
                          )}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Department Quick Actions & Faculty Summary */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 rounded-3xl shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-gray-100">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Department Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                <button
                  onClick={() => navigate("/dashboard/faculty")}
                  className="w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span>Manage Faculty Directory</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-md border text-gray-600">
                    {facultyCount} Active
                  </span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/criterion/1/1")}
                  className="w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Criterion 1: Curricular Aspects</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate("/dashboard/criterion/2/1")}
                  className="w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span>Criterion 2: Teaching & Evaluation</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate("/dashboard/criterion/3/1")}
                  className="w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span>Criterion 3: Research & Extension</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 rounded-3xl shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-gray-100">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Department Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 text-xs space-y-2.5 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Department Code:</span>
                  <span className="font-semibold text-gray-800">
                    {user?.department?.code || "DEPT"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Head of Dept:</span>
                  <span className="font-semibold text-gray-800">{hodName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Parent School:</span>
                  <span className="font-semibold text-gray-800">{schoolName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Account Role:</span>
                  <span className="font-bold text-blue-700">Department HOD</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
