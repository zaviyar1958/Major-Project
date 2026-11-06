import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardService from "@/service/dashboardService";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("2024-25");
  const [isLoading, setIsLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalSchools: 9,
    totalDepartments: 4,
    totalSections: 3,
    totalFaculty: 0,
    totalStudents: 3456,
    totalResearchPapers: 0,
    cgpa: 3.22,
    cgpaScale: "4.0",
    grade: "A",
    accreditationStatus: "Accredited",
  });

  const [naacCriteria, setNaacCriteria] = useState([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await DashboardService.getMetrics(selectedPeriod);
      if (res?.data?.success) {
        setMetrics(res.data.data.keyMetrics);
        setNaacCriteria(res.data.data.criteria);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to fetch live metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // 1. University Hierarchy Overview (Schools, Departments, Sections, Faculty)
  const hierarchyMetrics = [
    {
      title: "Schools",
      value: (metrics.totalSchools || 9).toString(),
      subtitle: "Faculties of Study",
      href: "/dashboard/schools",
    },
    {
      title: "Departments",
      value: (metrics.totalDepartments || 4).toString(),
      subtitle: "Academic Departments",
      href: "/dashboard/departments",
    },
    {
      title: "Sections",
      value: (metrics.totalSections || 3).toString(),
      subtitle: "Admin & Academic Wings",
      href: "/dashboard/sections",
    },
    {
      title: "Faculty",
      value: (metrics.totalFaculty || 0).toString(),
      subtitle: "Teaching Staff Registered",
      href: "/dashboard/faculty",
    },
  ];

  // 2. NAAC Core Metrics (Students, Research, CGPA, Grade)
  const naacMetrics = [
    {
      title: "Total Students",
      value: metrics.totalStudents?.toLocaleString() || "3,456",
      subtitle: "Enrolled in Academic Year",
    },
    {
      title: "Research Papers",
      value: (metrics.totalResearchPapers || 0).toString(),
      subtitle: "Publications in UGC/Scopus",
    },
    {
      title: "Accreditation CGPA",
      value: `${metrics.cgpa} / 4.0`,
      subtitle: "Cumulative Grade Point",
    },
    {
      title: "NAAC Grade",
      value: `Grade ${metrics.grade}`,
      subtitle: metrics.accreditationStatus || "Accredited",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-emerald-600";
    if (score >= 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header Section (Simple Text, No Icons, Compact) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span className="text-emerald-700 font-semibold">PostgreSQL Connected</span>
                <span>•</span>
                <span>MANUU NAAC Portal</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">
                University Accreditation Dashboard
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Internal Quality Assurance Cell (IQAC) • Master Overview & 7 Criteria Assessment
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="2024-25">Academic Year 2024-25</option>
                <option value="2023-24">Academic Year 2023-24</option>
                <option value="2022-23">Academic Year 2022-23</option>
              </select>

              <button
                onClick={fetchDashboardData}
                className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
              >
                {isLoading ? "Syncing..." : "Sync Data"}
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: University Hierarchy Units (Schools, Departments, Sections, Faculty) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              University Hierarchy Overview
            </h2>
            <span className="text-[11px] text-gray-400">Click card to navigate</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hierarchyMetrics.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.href)}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-gray-400 cursor-pointer transition-all duration-150"
              >
                <p className="text-xs font-semibold text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: NAAC Core Metrics */}
        <div>
          <div className="mb-2.5 px-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              NAAC Accreditation Metrics
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {naacMetrics.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                <p className="text-xs font-semibold text-gray-500">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Criteria Assessment & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Criteria Evaluation List */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900">
                    NAAC 7 Criteria Assessment
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Evaluation status across 1000 total weightage points
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">
                    Grade {metrics.grade} ({metrics.cgpa}/4.0)
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {naacCriteria.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">Loading criteria...</p>
                ) : (
                  naacCriteria.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50/70 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {item.number}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {item.criteria}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            (Weightage: {item.weightage})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{item.score}%</span>
                          <span className="text-[10px] font-medium text-gray-500 uppercase">
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getScoreColor(item.score)}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Navigation */}
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-2 border-b border-gray-100">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Master Data Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() => navigate("/dashboard/schools")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span>Manage Schools of Study</span>
                  <span className="text-gray-400 text-[11px]">9 Active</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/departments")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span>Manage Departments & HODs</span>
                  <span className="text-gray-400 text-[11px]">4 Active</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/sections")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span>Manage University Sections</span>
                  <span className="text-gray-400 text-[11px]">3 Active</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/faculty")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span>View Faculty Directory</span>
                  <span className="text-gray-400 text-[11px]">HOD Managed</span>
                </button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="p-4 pb-2 border-b border-gray-100">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Accreditation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2 text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Current Cycle:</span>
                  <span className="font-semibold text-gray-800">5-Year SSR Cycle</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Active Academic Year:</span>
                  <span className="font-semibold text-gray-800">{selectedPeriod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Projected Grade:</span>
                  <span className="font-bold text-emerald-700">Grade {metrics.grade} ({metrics.cgpa})</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;