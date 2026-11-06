import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Building2,
  FolderTree,
  Layers,
  GraduationCap,
  BookOpen,
  Award,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  FileText,
  BarChart3,
  Users,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  // State to track which Criteria accordion is expanded
  const [openCriteria, setOpenCriteria] = useState({
    1: true, // Default Criterion 1 open
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  const toggleCriteria = (criterionNumber) => {
    setOpenCriteria((prev) => ({
      ...prev,
      [criterionNumber]: !prev[criterionNumber],
    }));
  };

  const isActive = (path) => location.pathname === path;

  const isDept = user?.role === "department";

  // 1. Academic Hierarchy Menu Items based on Role
  const academicItems = isDept
    ? [
        {
          title: "Department Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active:
            location.pathname === "/dashboard" ||
            location.pathname === "/dashboard/",
        },
        {
          title: "Programme Management",
          icon: BookOpen,
          href: "/dashboard/programmes",
          active: isActive("/dashboard/programmes"),
          badge: "Degree",
          badgeColor: "bg-gray-100 text-gray-700",
        },
        {
          title: "Course Management",
          icon: FileText,
          href: "/dashboard/courses",
          active: isActive("/dashboard/courses"),
          badge: "Courses",
          badgeColor: "bg-gray-100 text-gray-700",
        },
        {
          title: "Faculty Management",
          icon: GraduationCap,
          href: "/dashboard/faculty",
          active: isActive("/dashboard/faculty"),
          badge: "Faculty",
          badgeColor: "bg-gray-100 text-gray-700",
        },
      ]
    : [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active:
            location.pathname === "/dashboard" ||
            location.pathname === "/dashboard/",
        },
        {
          title: "Schools",
          icon: Building2,
          href: "/dashboard/schools",
          active: isActive("/dashboard/schools"),
          badge: "Schools",
        },
        {
          title: "Departments",
          icon: FolderTree,
          href: "/dashboard/departments",
          active: isActive("/dashboard/departments"),
          badge: "Depts",
        },
        {
          title: "Sections",
          icon: Layers,
          href: "/dashboard/sections",
          active: isActive("/dashboard/sections"),
          badge: "Admin",
        },
        {
          title: "Faculty",
          icon: GraduationCap,
          href: "/dashboard/faculty",
          active: isActive("/dashboard/faculty"),
          badge: "Active",
          badgeColor: "bg-gray-100 text-gray-800",
        },
      ];

  // 2. NAAC 7 Criteria Accordion Data with Sub-Slidebars
  const naacCriteriaList = [
    {
      number: 1,
      title: "1. Curricular Aspects",
      shortTitle: "Cr 1",
      weightage: 150,
      subItems: [
        { title: "1.1 Curriculum Design & Dev", href: "/dashboard/criterion/1/1" },
        { title: "1.2 Academic Flexibility (CBCS)", href: "/dashboard/criterion/1/2" },
        { title: "1.3 Curriculum Enrichment", href: "/dashboard/criterion/1/3" },
        { title: "1.4 Feedback System", href: "/dashboard/criterion/1/4" },
      ],
    },
    {
      number: 2,
      title: "2. Teaching & Evaluation",
      shortTitle: "Cr 2",
      weightage: 300,
      subItems: [
        { title: "2.1 Student Enrollment", href: "/dashboard/criterion/2/1" },
        { title: "2.2 Student Diversity", href: "/dashboard/criterion/2/2" },
        { title: "2.4 Faculty Quality & Profile", href: "/dashboard/criterion/2/4" },
        { title: "2.6 Student Outcomes", href: "/dashboard/criterion/2/6" },
      ],
    },
    {
      number: 3,
      title: "3. Research & Innovations",
      shortTitle: "Cr 3",
      weightage: 150,
      subItems: [
        { title: "3.1 Resource Mobilization", href: "/dashboard/criterion/3/1" },
        { title: "3.3 Publications & Awards", href: "/dashboard/criterion/3/3" },
        { title: "3.4 Extension Activities", href: "/dashboard/criterion/3/4" },
      ],
    },
    {
      number: 4,
      title: "4. Infrastructure & Labs",
      shortTitle: "Cr 4",
      weightage: 100,
      subItems: [
        { title: "4.1 Physical Classrooms & Labs", href: "/dashboard/criterion/4/1" },
        { title: "4.2 Library as Learning Resource", href: "/dashboard/criterion/4/2" },
        { title: "4.3 IT Infrastructure", href: "/dashboard/criterion/4/3" },
      ],
    },
    {
      number: 5,
      title: "5. Student Support",
      shortTitle: "Cr 5",
      weightage: 100,
      subItems: [
        { title: "5.1 Scholarships & Support", href: "/dashboard/criterion/5/1" },
        { title: "5.2 Placements & Progression", href: "/dashboard/criterion/5/2" },
        { title: "5.4 Alumni Association", href: "/dashboard/criterion/5/4" },
      ],
    },
    {
      number: 6,
      title: "6. Governance & IQAC",
      shortTitle: "Cr 6",
      weightage: 100,
      subItems: [
        { title: "6.1 Institutional Vision", href: "/dashboard/criterion/6/1" },
        { title: "6.3 Faculty Empowerment", href: "/dashboard/criterion/6/3" },
        { title: "6.5 IQAC Operations", href: "/dashboard/criterion/6/5" },
      ],
    },
    {
      number: 7,
      title: "7. Institutional Values",
      shortTitle: "Cr 7",
      weightage: 100,
      subItems: [
        { title: "7.1 Gender Equity & Green Campus", href: "/dashboard/criterion/7/1" },
        { title: "7.2 Best Practices", href: "/dashboard/criterion/7/2" },
        { title: "7.3 Distinctiveness", href: "/dashboard/criterion/7/3" },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out shadow-sm select-none",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm text-white">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                MANUU • NAAC
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                Accreditation Portal
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-2xl border border-gray-200 mx-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Status */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-xl text-white text-xs font-bold flex items-center justify-center flex-shrink-0",
                isDept ? "bg-blue-600" : "bg-gray-900"
              )}
            >
              {isDept
                ? (user?.department?.code || "DP").slice(0, 2).toUpperCase()
                : "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate" title={user?.department?.name || user?.username}>
                {isDept
                  ? user?.department?.name || user?.username
                  : user?.username || "University Admin"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {isDept
                  ? user?.department?.school?.name || user?.email
                  : user?.email || "admin@mmch.edu"}
              </p>
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                isDept
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              )}
            >
              {isDept ? "HOD" : "Admin"}
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Navigation */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Section 1: Academic & Organizational Units */}
        <div>
          {!collapsed && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              {isDept ? "Department Portal" : "University Hierarchy"}
            </p>
          )}
          <div className="space-y-1">
            {academicItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center h-10 px-3 rounded-2xl text-xs font-semibold transition-all duration-150",
                    collapsed ? "justify-center px-0" : "justify-start",
                    item.active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            item.badgeColor || "bg-gray-100 text-gray-600",
                            item.active && "bg-white/20 text-white"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: NAAC 7 Criteria Accordions (Sub-Slidebars) */}
        <div>
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                NAAC 7 Criteria (Sub-bars)
              </p>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                1000 Pts
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            {naacCriteriaList.map((crit) => {
              const isOpen = openCriteria[crit.number];
              return (
                <div key={crit.number} className="rounded-2xl border border-gray-100 bg-gray-50/40 overflow-hidden">
                  {/* Criterion Header Button */}
                  <button
                    onClick={() => {
                      if (collapsed) {
                        setCollapsed(false);
                      }
                      toggleCriteria(crit.number);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                    title={collapsed ? crit.title : undefined}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {crit.number}
                      </span>
                      {!collapsed && (
                        <span className="truncate text-left text-gray-800 font-semibold">
                          {crit.title}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
                          isOpen ? "transform rotate-180 text-gray-900" : ""
                        )}
                      />
                    )}
                  </button>

                  {/* Sub-Slidebars (Sub Items) */}
                  {!collapsed && isOpen && (
                    <div className="bg-white px-2 py-1.5 border-t border-gray-100 space-y-0.5">
                      {crit.subItems.map((sub, sIdx) => {
                        const isSubActive = location.pathname === sub.href;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => navigate(sub.href)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors flex items-center gap-2",
                              isSubActive
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isSubActive ? "bg-blue-600" : "bg-gray-300"
                              )}
                            />
                            <span className="truncate">{sub.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full h-10 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-semibold",
            collapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2.5")} />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
