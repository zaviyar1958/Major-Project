import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CriterionService from "@/service/criterionService";
import CourseService from "@/service/courseService";

const Criterion1_2 = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Role detection
  const isAdmin = user?.role === "admin";
  const userDeptName = user?.department?.name || user?.username || "Department";

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  // Storage keys for draft persistence (Scoped by department and academicYear)
  const deptIdKey = user?.departmentId || user?.username || "default";
  const storageKey121 = `naac_121_${deptIdKey}_${academicYear}`;

  // Metric 1.2.1 Quantitative Numerical State
  const [newCoursesCount, setNewCoursesCount] = useState(""); // 1.2.1.1
  const [totalCoursesCount, setTotalCoursesCount] = useState(""); // 1.2.1.2
  const [autoCalculatedInfo, setAutoCalculatedInfo] = useState(null);

  // Specific Document Uploads (4 required + public link as per NAAC template)
  const [docTemplate, setDocTemplate] = useState(null); // Institutional data in prescribed format
  const [webLink, setWebLink] = useState(""); // Relevant information in institutional website
  const [docWebProof, setDocWebProof] = useState(null); // Proof / screenshot / doc for public disclosure
  const [docBosMinutes, setDocBosMinutes] = useState(null); // Minutes of Board of Studies meeting
  const [docAcademicCouncil, setDocAcademicCouncil] = useState(null); // Subsequent Academic Council extracts
  const [additionalFiles, setAdditionalFiles] = useState([]); // Any supplementary files

  // Status flags
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  // File Input Refs
  const docTemplateRef = useRef(null);
  const docWebProofRef = useRef(null);
  const docBosMinutesRef = useRef(null);
  const docAcademicCouncilRef = useRef(null);
  const addFilesRef = useRef(null);

  // Live Formula Calculation: (1.2.1.1 / 1.2.1.2) * 100
  const calculatedPercentage = React.useMemo(() => {
    const num = parseFloat(newCoursesCount);
    const denom = parseFloat(totalCoursesCount);
    if (!isNaN(num) && !isNaN(denom) && denom > 0) {
      const pct = (num / denom) * 100;
      return pct.toFixed(2);
    }
    return "0.00";
  }, [newCoursesCount, totalCoursesCount]);

  // Load Submissions from Backend
  const loadSubmissionData = async () => {
    setIsLoadingData(true);
    try {
      const targetDeptId = isAdmin
        ? selectedDeptId !== "all"
          ? selectedDeptId
          : undefined
        : user?.departmentId;

      const params = { academicYear, criterionCode: "1.2.1" };
      if (targetDeptId) params.departmentId = targetDeptId;

      const res = await CriterionService.getSubmissions(params);
      if (res?.data?.success) {
        const { data: submissions, departments } = res.data;

        if (departments) {
          setDepartmentStatuses(departments);
        }

        if (targetDeptId && submissions) {
          const sub = submissions.find(
            (s) => s.criterionCode === "1.2.1" && s.departmentId === parseInt(targetDeptId)
          );

          if (sub) {
            const data = sub.supportingDoc || {};
            setNewCoursesCount(data.newCoursesCount !== undefined ? String(data.newCoursesCount) : "");
            setTotalCoursesCount(data.totalCoursesCount !== undefined ? String(data.totalCoursesCount) : "");
            setDocTemplate(data.docTemplate || null);
            setWebLink(data.webLink || "");
            setDocWebProof(data.docWebProof || null);
            setDocBosMinutes(data.docBosMinutes || null);
            setDocAcademicCouncil(data.docAcademicCouncil || null);
            setAdditionalFiles(sub.additionalFiles || []);
            setIsSaved(true);
            setIsSubmitted(sub.isSubmitted);
            setIsEditing(false);
            setUpdatedAt(sub.updatedAt);
            if (data.autoCalculatedInfo) setAutoCalculatedInfo(data.autoCalculatedInfo);
          } else {
            setIsEditing(false);
            // Check year-scoped localStorage for department
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey121);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setNewCoursesCount(parsed.newCoursesCount !== undefined ? String(parsed.newCoursesCount) : "");
                setTotalCoursesCount(parsed.totalCoursesCount !== undefined ? String(parsed.totalCoursesCount) : "");
                setDocTemplate(parsed.docTemplate || null);
                setWebLink(parsed.webLink || "");
                setDocWebProof(parsed.docWebProof || null);
                setDocBosMinutes(parsed.docBosMinutes || null);
                setDocAcademicCouncil(parsed.docAcademicCouncil || null);
                setAdditionalFiles(parsed.additionalFiles || []);
                setIsSaved(true);
                setIsSubmitted(false);
                setUpdatedAt(parsed.updatedAt || null);
                if (parsed.autoCalculatedInfo) setAutoCalculatedInfo(parsed.autoCalculatedInfo);
              } else {
                resetForm();
              }
            } else {
              resetForm();
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load criterion 1.2 submissions:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const resetForm = () => {
    setNewCoursesCount("");
    setTotalCoursesCount("");
    setDocTemplate(null);
    setWebLink("");
    setDocWebProof(null);
    setDocBosMinutes(null);
    setDocAcademicCouncil(null);
    setAdditionalFiles([]);
    setIsSaved(false);
    setIsSubmitted(false);
    setIsEditing(false);
    setUpdatedAt(null);
    setAutoCalculatedInfo(null);
  };

  useEffect(() => {
    loadSubmissionData();
  }, [isAdmin, selectedDeptId, academicYear, user?.departmentId]);

  // AUTO-CALCULATION from Course Management Database
  const handleAutoCalculateFromDB = async () => {
    setIsAutoCalculating(true);
    try {
      const deptId = user?.departmentId;
      const res = await CourseService.getAllCourses({ departmentId: deptId });
      if (res?.data?.success) {
        const courses = res.data.data || [];
        const currentYearNum = parseInt(academicYear.split("-")[0]) || new Date().getFullYear();
        const fiveYearsAgo = currentYearNum - 4; // e.g. 2020 to 2024 (5 years span)

        // 1.2.1.1: Courses introduced during the last five years
        const newCourses = courses.filter(
          (c) => c.yearOfOffering && c.yearOfOffering >= fiveYearsAgo && c.yearOfOffering <= currentYearNum
        );

        // 1.2.1.2: Consolidated number of courses offered across all Programmes (without repeat count)
        const totalUniqueCourses = courses.length;

        setNewCoursesCount(String(newCourses.length));
        setTotalCoursesCount(String(totalUniqueCourses));
        setAutoCalculatedInfo({
          calculatedAt: new Date().toISOString(),
          span: `${fiveYearsAgo} - ${currentYearNum}`,
          newCoursesList: newCourses.map((c) => `${c.code} - ${c.name} (${c.yearOfOffering})`),
        });
        setIsSaved(false);
        toast.success(
          `Auto-calculated: ${newCourses.length} new courses in last 5 yrs out of ${totalUniqueCourses} total courses!`
        );
      } else {
        toast.error("Could not fetch course database records");
      }
    } catch (error) {
      toast.error("Failed to auto-calculate from courses database");
    } finally {
      setIsAutoCalculating(false);
    }
  };

  // Generic File Upload Handler helper
  const handleFileUpload = (e, setter, label) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      setIsSaved(false);
      toast.success(`${label} selected: ${file.name}`);
    }
  };

  // Additional Files handler
  const handleAddAdditionalFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setAdditionalFiles((prev) => [...prev, ...newItems]);
      setIsSaved(false);
      toast.success(`${files.length} supplementary file(s) added`);
    }
    if (addFilesRef.current) addFilesRef.current.value = "";
  };

  // Save / Submit Handler
  const handleSave = async (isFinalSubmit = false) => {
    const payloadData = {
      newCoursesCount: parseInt(newCoursesCount) || 0,
      totalCoursesCount: parseInt(totalCoursesCount) || 0,
      percentage: parseFloat(calculatedPercentage) || 0,
      docTemplate,
      webLink,
      docWebProof,
      docBosMinutes,
      docAcademicCouncil,
      autoCalculatedInfo,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage draft
    localStorage.setItem(storageKey121, JSON.stringify(payloadData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved(true);
        toast.success(isFinalSubmit ? "1.2 submitted" : "1.2 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.2.1",
        academicYear,
        description: `Metric 1.2.1: ${newCoursesCount} new courses out of ${totalCoursesCount} total courses (${calculatedPercentage}%)`,
        supportingDoc: payloadData,
        additionalFiles,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved(true);
      setIsSubmitted(isFinalSubmit);
      if (isFinalSubmit) setIsEditing(false);
      setUpdatedAt(new Date().toISOString());
      toast.success(isFinalSubmit ? "Criterion 1.2 response submitted successfully" : "Criterion 1.2 draft saved");
      loadSubmissionData();
    } catch (error) {
      toast.error("Failed to sync with server. Local draft saved.");
    }
  };

  // Admin summary metrics
  const adminSummary = React.useMemo(() => {
    const totalDepts = departmentStatuses.length;
    let submittedCount = 0;
    let draftCount = 0;
    let notStartedCount = 0;

    departmentStatuses.forEach((d) => {
      const isSub = d.sub121?.status === "SUBMITTED";
      const isDraft = !isSub && (d.sub121?.status === "DRAFT" || d.sub121?.hasContent);

      if (isSub) submittedCount++;
      else if (isDraft) draftCount++;
      else notStartedCount++;
    });

    return { totalDepts, submittedCount, draftCount, notStartedCount };
  }, [departmentStatuses]);

  const selectedDepartmentObj = departmentStatuses.find(
    (d) => d.departmentId === parseInt(selectedDeptId)
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Navigation & Context Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              {isAdmin ? "Admin View Mode (Read Only)" : userDeptName}
            </span>
            <span>•</span>
            <span>Academic Year {academicYear}</span>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200">
                Criterion 1.2
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                Weightage: 30
              </span>
              {isAdmin && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-white rounded">
                  Admin Observer Mode
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Key Indicator – 1.2 Academic Flexibility
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAdmin
                ? "Monitor and verify curriculum academic flexibility & new course introduction submissions."
                : "Percentage of new courses introduced across all programmes during the last five years."}
            </p>
          </div>

          {/* Academic Year Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Year:</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-900"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
        </div>

        {/* ADMIN EXCLUSIVE: Department Filter & Submission Status Matrix */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Department Submission Filter</h2>
                <p className="text-xs text-gray-500">
                  Select a department to view its quantitative course numbers, formula output, and attached files.
                </p>
              </div>

              {/* Department Dropdown Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="deptFilter12" className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Filter Department:
                </label>
                <select
                  id="deptFilter12"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-2 min-w-[240px] focus:outline-none focus:border-gray-900"
                >
                  <option value="all">-- All Departments Overview --</option>
                  {departmentStatuses.map((dept) => {
                    const isSub = dept.sub121?.status === "SUBMITTED";
                    const isPartial = isSub || dept.sub121?.status === "DRAFT" || dept.sub121?.hasContent;
                    const label = isSub ? "✓ Submitted" : isPartial ? "• Draft / In Progress" : "✕ Not Started";
                    return (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName} ({label})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Admin Stats Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[11px] text-gray-500 font-medium">Total Departments</p>
                <p className="text-lg font-bold text-gray-900">{adminSummary.totalDepts}</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[11px] text-gray-500 font-medium">Submitted (1.2)</p>
                <p className="text-lg font-bold text-gray-900">{adminSummary.submittedCount}</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[11px] text-gray-500 font-medium">In Progress / Draft</p>
                <p className="text-lg font-bold text-gray-900">{adminSummary.draftCount}</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[11px] text-gray-500 font-medium">Not Started</p>
                <p className="text-lg font-bold text-gray-900">{adminSummary.notStartedCount}</p>
              </div>
            </div>

            {/* Table Overview when all is selected */}
            {selectedDeptId === "all" && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">School</th>
                      <th className="py-2.5 px-3 text-center">1.2.1 Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departmentStatuses.map((dept, index) => {
                      const s121 = dept.sub121?.status;

                      return (
                        <tr key={dept.departmentId} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-500">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{dept.departmentName}</td>
                          <td className="py-2.5 px-3 text-gray-500">{dept.schoolName || "-"}</td>
                          <td className="py-2.5 px-3 text-center">
                            {s121 === "SUBMITTED" ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s121 === "DRAFT" || dept.sub121?.hasContent ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px] font-medium">
                                In Draft
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Not Started</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedDeptId(dept.departmentId.toString())}
                              className="text-gray-900 hover:text-black font-semibold underline underline-offset-2"
                            >
                              View Submission →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Selected Department Banner for Admin */}
        {isAdmin && selectedDeptId !== "all" && (
          <div className="flex items-center justify-between p-3.5 bg-gray-100 border border-gray-300 rounded-xl">
            <div>
              <p className="text-xs font-bold text-gray-900">
                Viewing Submission: {selectedDepartmentObj?.departmentName || `Department #${selectedDeptId}`}
              </p>
              <p className="text-[11px] text-gray-500">
                School: {selectedDepartmentObj?.schoolName || "University Academic Unit"}
              </p>
            </div>
            <button
              onClick={() => setSelectedDeptId("all")}
              className="text-xs font-semibold px-3 py-1.5 border border-gray-400 bg-white hover:bg-gray-50 rounded-lg"
            >
              ← View All Departments List
            </button>
          </div>
        )}

        {/* MAIN METRIC CARD: 1.2.1 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">Metric 1.2.1</span>
                <span>•</span>
                <span className="font-bold text-gray-700">QnM</span>
                <span>•</span>
                <span>Quantitative Metric</span>
                <span>•</span>
                <span>Weightage: 30</span>
                {isSubmitted ? (
                  <>
                    <span>•</span>
                    <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      Submitted
                    </span>
                  </>
                ) : isSaved || newCoursesCount ? (
                  <>
                    <span>•</span>
                    <span className="bg-gray-200 text-gray-800 text-[10px] px-2 py-0.5 rounded font-medium">
                      Draft Saved
                    </span>
                  </>
                ) : (
                  <>
                    <span>•</span>
                    <span className="text-gray-400 text-[11px]">Not Submitted</span>
                  </>
                )}
                {updatedAt && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-gray-900 leading-relaxed">
                Percentage of new courses introduced out of the total number of courses across all programmes offered
                during the last five years
              </h2>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-6">
            {isAdmin && selectedDeptId === "all" ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  Select a Department to View Criterion 1.2.1 Submission
                </p>
                <p className="text-xs text-gray-500">
                  Use the filter dropdown above or click "View Submission →" in the summary table.
                </p>
              </div>
            ) : (
              <>
                {/* Submitted Status & Edit Option Banner */}
                {!isAdmin && isSubmitted && !isEditing && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-900 text-white rounded text-[11px] font-bold">
                          ✓ Data Submitted
                        </span>
                        {updatedAt && (
                          <span className="text-[11px] text-gray-500">
                            Submitted: {new Date(updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Criterion 1.2 is submitted and locked. Click "Edit Submission" to make corrections to numbers or replace uploaded documents.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors whitespace-nowrap shadow-sm"
                    >
                      ✎ Edit Submission
                    </button>
                  </div>
                )}

                {/* Currently In Edit Mode Notification */}
                {!isAdmin && isSubmitted && isEditing && (
                  <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs">
                    <span className="font-semibold text-gray-800">
                      Editing Mode: You can modify course counts, links, and replace/remove attached PDF files.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        loadSubmissionData();
                      }}
                      className="text-gray-600 hover:text-black underline font-medium"
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                {/* 1. Quantitative Inputs & Auto-Calculation */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Quantitative Assessment Data
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Enter numbers manually or auto-calculate directly from your department course database.
                      </p>
                    </div>

                    {!isAdmin && (!isSubmitted || isEditing) && (
                      <button
                        type="button"
                        onClick={handleAutoCalculateFromDB}
                        disabled={isAutoCalculating}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isAutoCalculating ? "Calculating..." : "⚡ Auto-Calculate from Course Database"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Field 1.2.1.1 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 block">
                        1.2.1.1 : Number of new courses introduced during the last five years
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Total new courses newly introduced/offered in syllabus in last 5 yrs.
                      </p>
                      {isAdmin ? (
                        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-base font-bold text-gray-900">
                          {newCoursesCount || "0"}
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={newCoursesCount}
                          disabled={isSubmitted && !isEditing}
                          onChange={(e) => {
                            setNewCoursesCount(e.target.value);
                            setIsSaved(false);
                          }}
                          placeholder="e.g. 18"
                          className={`w-full p-2.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 font-semibold ${
                            isSubmitted && !isEditing ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                          }`}
                        />
                      )}
                    </div>

                    {/* Field 1.2.1.2 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 block">
                        1.2.1.2 : Consolidated number of courses offered across all Programmes (without repeat count)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Total unique courses offered by the department during the last 5 years.
                      </p>
                      {isAdmin ? (
                        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md font-mono text-base font-bold text-gray-900">
                          {totalCoursesCount || "0"}
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={totalCoursesCount}
                          disabled={isSubmitted && !isEditing}
                          onChange={(e) => {
                            setTotalCoursesCount(e.target.value);
                            setIsSaved(false);
                          }}
                          placeholder="e.g. 75"
                          className={`w-full p-2.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-gray-900 font-semibold ${
                            isSubmitted && !isEditing ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Auto-calculation breakdown info if available */}
                  {autoCalculatedInfo && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">
                          ⚡ Database Auto-Calculation (Span: {autoCalculatedInfo.span})
                        </span>
                        <span>{new Date(autoCalculatedInfo.calculatedAt).toLocaleTimeString()}</span>
                      </div>
                      {autoCalculatedInfo.newCoursesList?.length > 0 && (
                        <p className="text-[11px] text-gray-600 truncate">
                          Detected new courses: {autoCalculatedInfo.newCoursesList.slice(0, 5).join(", ")}
                          {autoCalculatedInfo.newCoursesList.length > 5 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {/* FORMULA DISPLAY & LIVE RESULT */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        NAAC Calculation Formula:
                      </span>
                      <div className="text-xs font-mono text-gray-800 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 inline-block">
                        Percentage = (1.2.1.1 ÷ 1.2.1.2) × 100
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
                      <span className="text-[11px] font-medium text-gray-500 block">Calculated Result:</span>
                      <span className="text-2xl font-black text-gray-900 tracking-tight">
                        {calculatedPercentage}%
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        ({newCoursesCount || 0} / {totalCoursesCount || 0} × 100)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SPECIFIC DOCUMENT UPLOADS (As per Screenshot Red Text) */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Specific Document Uploads (as per NAAC guidelines)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Upload the specific verification documents required for Criterion 1.2.1.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Doc 1: Institutional data in prescribed format */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          1. Institutional Data in Prescribed Format (Data Template)
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Completed Excel / PDF template of new courses introduced.
                        </p>
                      </div>

                      {isAdmin ? (
                        docTemplate ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docTemplate.name}</p>
                              <p className="text-[11px] text-gray-500">{docTemplate.size}</p>
                            </div>
                            <span className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              Data Template
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No data template uploaded.</p>
                        )
                      ) : !isAdmin && isSubmitted && !isEditing ? (
                        docTemplate ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docTemplate.name}</p>
                              <p className="text-[11px] text-gray-500">{docTemplate.size}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              Attached File
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No data template uploaded.</p>
                        )
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={docTemplateRef}
                            onChange={(e) => handleFileUpload(e, setDocTemplate, "Data template")}
                            accept=".xlsx,.xls,.csv,.pdf"
                            className="hidden"
                          />
                          {docTemplate ? (
                            <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{docTemplate.name}</p>
                                <p className="text-[11px] text-gray-500">{docTemplate.size}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => docTemplateRef.current?.click()}
                                  className="text-gray-700 hover:underline font-medium"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocTemplate(null);
                                    setIsSaved(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => docTemplateRef.current?.click()}
                              className="w-full py-3.5 border border-dashed border-gray-300 hover:border-gray-900 rounded-lg text-xs text-gray-600 hover:bg-gray-50 text-center transition-colors"
                            >
                              Upload Data Template (Excel / PDF)
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Doc 2: Institutional Website Link as part of public disclosure */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          2. Relevant Information in Institutional Website (Public Disclosure)
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Provide public website URL and optional screenshot/proof.
                        </p>
                      </div>

                      {isAdmin ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs">
                            <span className="text-gray-500 block text-[10px]">Website URL:</span>
                            {webLink ? (
                              <a
                                href={webLink.startsWith("http") ? webLink : `https://${webLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-gray-900 hover:underline break-all"
                              >
                                {webLink} ↗
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">No web link provided</span>
                            )}
                          </div>
                          {docWebProof && (
                            <div className="p-2 border border-gray-200 rounded-md text-[11px] bg-gray-50 flex items-center justify-between">
                              <span className="font-medium text-gray-800">{docWebProof.name}</span>
                              <span className="text-gray-500">{docWebProof.size}</span>
                            </div>
                          )}
                        </div>
                      ) : !isAdmin && isSubmitted && !isEditing ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs">
                            <span className="text-gray-500 block text-[10px]">Website URL:</span>
                            {webLink ? (
                              <a
                                href={webLink.startsWith("http") ? webLink : `https://${webLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-gray-900 hover:underline break-all"
                              >
                                {webLink} ↗
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">No web link provided</span>
                            )}
                          </div>
                          {docWebProof ? (
                            <div className="p-2 border border-gray-200 rounded-md text-[11px] bg-gray-50 flex items-center justify-between">
                              <span className="font-medium text-gray-800">{docWebProof.name}</span>
                              <span className="text-[10px] font-semibold text-gray-700 bg-white border border-gray-300 px-2 py-0.5 rounded">
                                Attached Proof
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic py-1">No disclosure proof attached.</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="url"
                            value={webLink}
                            onChange={(e) => {
                              setWebLink(e.target.value);
                              setIsSaved(false);
                            }}
                            placeholder="https://manuu.edu.in/department/syllabus"
                            className="w-full p-2.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-gray-900"
                          />

                          <input
                            type="file"
                            ref={docWebProofRef}
                            onChange={(e) => handleFileUpload(e, setDocWebProof, "Web disclosure proof")}
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                          />
                          {docWebProof ? (
                            <div className="p-2 border border-gray-200 rounded-md text-xs bg-gray-50 flex items-center justify-between">
                              <span className="font-medium text-gray-800 truncate pr-2">{docWebProof.name}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => docWebProofRef.current?.click()}
                                  className="text-gray-700 hover:underline font-medium text-[11px]"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocWebProof(null);
                                    setIsSaved(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600 text-[11px]"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => docWebProofRef.current?.click()}
                              className="w-full py-1.5 border border-dashed border-gray-300 rounded-md text-[11px] text-gray-600 hover:bg-gray-50 text-center"
                            >
                              + Attach Disclosure Proof (PDF / Screenshot)
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Doc 3: Minutes of Board of Studies (BOS) meeting */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          3. Minutes of Board of Studies (BOS) Meeting
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Minutes clearly specifying syllabus approval of new courses.
                        </p>
                      </div>

                      {isAdmin ? (
                        docBosMinutes ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docBosMinutes.name}</p>
                              <p className="text-[11px] text-gray-500">{docBosMinutes.size}</p>
                            </div>
                            <span className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              BOS Minutes
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No BOS minutes uploaded.</p>
                        )
                      ) : !isAdmin && isSubmitted && !isEditing ? (
                        docBosMinutes ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docBosMinutes.name}</p>
                              <p className="text-[11px] text-gray-500">{docBosMinutes.size}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              Attached File
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No BOS minutes uploaded.</p>
                        )
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={docBosMinutesRef}
                            onChange={(e) => handleFileUpload(e, setDocBosMinutes, "BOS Minutes")}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />
                          {docBosMinutes ? (
                            <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{docBosMinutes.name}</p>
                                <p className="text-[11px] text-gray-500">{docBosMinutes.size}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => docBosMinutesRef.current?.click()}
                                  className="text-gray-700 hover:underline font-medium"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocBosMinutes(null);
                                    setIsSaved(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => docBosMinutesRef.current?.click()}
                              className="w-full py-3.5 border border-dashed border-gray-300 hover:border-gray-900 rounded-lg text-xs text-gray-600 hover:bg-gray-50 text-center transition-colors"
                            >
                              Upload BOS Minutes (PDF / Word)
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Doc 4: Subsequent Academic Council meeting extracts */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          4. Subsequent Academic Council Meeting Extracts
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Extracts endorsing and confirming the decision of BOS.
                        </p>
                      </div>

                      {isAdmin ? (
                        docAcademicCouncil ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docAcademicCouncil.name}</p>
                              <p className="text-[11px] text-gray-500">{docAcademicCouncil.size}</p>
                            </div>
                            <span className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              Academic Council
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No Academic Council extracts uploaded.</p>
                        )
                      ) : !isAdmin && isSubmitted && !isEditing ? (
                        docAcademicCouncil ? (
                          <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{docAcademicCouncil.name}</p>
                              <p className="text-[11px] text-gray-500">{docAcademicCouncil.size}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[10px] font-semibold text-gray-700">
                              Attached File
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No Academic Council extracts uploaded.</p>
                        )
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={docAcademicCouncilRef}
                            onChange={(e) => handleFileUpload(e, setDocAcademicCouncil, "Academic Council Extracts")}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />
                          {docAcademicCouncil ? (
                            <div className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{docAcademicCouncil.name}</p>
                                <p className="text-[11px] text-gray-500">{docAcademicCouncil.size}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => docAcademicCouncilRef.current?.click()}
                                  className="text-gray-700 hover:underline font-medium"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocAcademicCouncil(null);
                                    setIsSaved(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => docAcademicCouncilRef.current?.click()}
                              className="w-full py-3.5 border border-dashed border-gray-300 hover:border-gray-900 rounded-lg text-xs text-gray-600 hover:bg-gray-50 text-center transition-colors"
                            >
                              Upload Academic Council Extracts (PDF)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. ADDITIONAL INFORMATION (Supplementary Files) */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Additional Information
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Any other relevant documents supporting syllabus revision or flexibility.
                      </p>
                    </div>
                    {!isAdmin && (!isSubmitted || isEditing) && (
                      <>
                        <input
                          type="file"
                          multiple
                          ref={addFilesRef}
                          onChange={handleAddAdditionalFiles}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => addFilesRef.current?.click()}
                          className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800 font-medium"
                        >
                          + Add File
                        </button>
                      </>
                    )}
                  </div>

                  {additionalFiles.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">
                      {isAdmin || (isSubmitted && !isEditing)
                        ? "No additional files attached by this department."
                        : "No additional files attached yet."}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {additionalFiles.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between p-2.5 border border-gray-200 rounded-md text-xs bg-gray-50"
                        >
                          <span className="font-medium text-gray-800 truncate pr-2">
                            {idx + 1}. {item.name} ({item.size})
                          </span>
                          {!isAdmin && (!isSubmitted || isEditing) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdditionalFiles((prev) => prev.filter((f) => f.id !== item.id));
                                setIsSaved(false);
                              }}
                              className="text-gray-400 hover:text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Department Action Buttons */}
                {!isAdmin && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    {isSubmitted && !isEditing ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                          <span className="text-xs font-semibold text-gray-700">
                            Status: Data Submitted
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors shadow-sm"
                        >
                          ✎ Edit Submission
                        </button>
                      </>
                    ) : isSubmitted && isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            loadSubmissionData();
                          }}
                          className="px-3.5 py-2 text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md font-medium"
                        >
                          Cancel Edit
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSave(false)}
                            className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
                          >
                            Save Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSave(true)}
                            className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium"
                          >
                            Update & Re-Submit Criterion 1.2
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div></div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSave(false)}
                            className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
                          >
                            Save as Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSave(true)}
                            className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium"
                          >
                            Submit Criterion 1.2
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criterion1_2;