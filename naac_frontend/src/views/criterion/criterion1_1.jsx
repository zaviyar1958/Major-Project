import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CriterionService from "@/service/criterionService";

const Criterion1_1 = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Check if admin
  const isAdmin = user?.role === "admin";
  const userDeptName = user?.department?.name || user?.username || "Department";

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Active expanded section: "1.1.1", "1.1.2", or null
  const [expandedSection, setExpandedSection] = useState("1.1.1");

  // Storage keys for draft persistence (Scoped by department and academicYear)
  const deptIdKey = user?.departmentId || user?.username || "default";
  const storageKey111 = `naac_111_${deptIdKey}_${academicYear}`;
  const storageKey112 = `naac_112_${deptIdKey}_${academicYear}`;

  // Form State for 1.1.1
  const [desc111, setDesc111] = useState("");
  const [supportingDoc111, setSupportingDoc111] = useState(null);
  const [additionalFiles111, setAdditionalFiles111] = useState([]);
  const [isSaved111, setIsSaved111] = useState(false);
  const [isSubmitted111, setIsSubmitted111] = useState(false);
  const [isEditing111, setIsEditing111] = useState(false);
  const [updatedAt111, setUpdatedAt111] = useState(null);

  // Form State for 1.1.2
  const [desc112, setDesc112] = useState("");
  const [supportingDoc112, setSupportingDoc112] = useState(null);
  const [additionalFiles112, setAdditionalFiles112] = useState([]);
  const [isSaved112, setIsSaved112] = useState(false);
  const [isSubmitted112, setIsSubmitted112] = useState(false);
  const [isEditing112, setIsEditing112] = useState(false);
  const [updatedAt112, setUpdatedAt112] = useState(null);

  // Refs for hidden file inputs
  const suppInputRef111 = useRef(null);
  const addInputRef111 = useRef(null);
  const suppInputRef112 = useRef(null);
  const addInputRef112 = useRef(null);

  // Word Counter helper
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const words111 = countWords(desc111);
  const words112 = countWords(desc112);
  const maxWords = 500;

  // 1. Fetch departments and submissions from backend
  const loadCriterionData = async () => {
    setIsLoadingData(true);
    try {
      const targetDeptId = isAdmin
        ? selectedDeptId !== "all"
          ? selectedDeptId
          : undefined
        : user?.departmentId;

      const params = { academicYear };
      if (targetDeptId) params.departmentId = targetDeptId;

      const res = await CriterionService.getSubmissions(params);
      if (res?.data?.success) {
        const { data: submissions, departments } = res.data;

        if (departments) {
          setDepartmentStatuses(departments);
        }

        if (targetDeptId && submissions) {
          const sub1 = submissions.find(
            (s) => s.criterionCode === "1.1.1" && s.departmentId === parseInt(targetDeptId)
          );
          const sub2 = submissions.find(
            (s) => s.criterionCode === "1.1.2" && s.departmentId === parseInt(targetDeptId)
          );

          if (sub1) {
            setDesc111(sub1.description || "");
            setSupportingDoc111(sub1.supportingDoc || null);
            setAdditionalFiles111(sub1.additionalFiles || []);
            setIsSaved111(true);
            setIsSubmitted111(sub1.isSubmitted);
            setIsEditing111(false);
            setUpdatedAt111(sub1.updatedAt);
          } else {
            // No submission found in database for this department and academicYear
            setIsEditing111(false);
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey111);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setDesc111(parsed.desc || "");
                setSupportingDoc111(parsed.suppDoc || null);
                setAdditionalFiles111(parsed.addFiles || []);
                setIsSaved111(true);
                setIsSubmitted111(false);
                setUpdatedAt111(parsed.updatedAt || null);
              } else {
                setDesc111("");
                setSupportingDoc111(null);
                setAdditionalFiles111([]);
                setIsSaved111(false);
                setIsSubmitted111(false);
                setUpdatedAt111(null);
              }
            } else {
              setDesc111("");
              setSupportingDoc111(null);
              setAdditionalFiles111([]);
              setIsSaved111(false);
              setIsSubmitted111(false);
              setUpdatedAt111(null);
            }
          }

          if (sub2) {
            setDesc112(sub2.description || "");
            setSupportingDoc112(sub2.supportingDoc || null);
            setAdditionalFiles112(sub2.additionalFiles || []);
            setIsSaved112(true);
            setIsSubmitted112(sub2.isSubmitted);
            setIsEditing112(false);
            setUpdatedAt112(sub2.updatedAt);
          } else {
            // No submission found in database for this department and academicYear
            setIsEditing112(false);
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey112);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setDesc112(parsed.desc || "");
                setSupportingDoc112(parsed.suppDoc || null);
                setAdditionalFiles112(parsed.addFiles || []);
                setIsSaved112(true);
                setIsSubmitted112(false);
                setUpdatedAt112(parsed.updatedAt || null);
              } else {
                setDesc112("");
                setSupportingDoc112(null);
                setAdditionalFiles112([]);
                setIsSaved112(false);
                setIsSubmitted112(false);
                setUpdatedAt112(null);
              }
            } else {
              setDesc112("");
              setSupportingDoc112(null);
              setAdditionalFiles112([]);
              setIsSaved112(false);
              setIsSubmitted112(false);
              setUpdatedAt112(null);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to load criterion submissions:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadCriterionData();
  }, [isAdmin, selectedDeptId, academicYear, user?.departmentId]);

  // 1.1.1 File Handlers
  const handleSuppDoc111 = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSupportingDoc111({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      setIsSaved111(false);
      toast.success(`Supporting document selected: ${file.name}`);
    }
  };

  const handleAddFiles111 = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setAdditionalFiles111((prev) => [...prev, ...newItems]);
      setIsSaved111(false);
      toast.success(`${files.length} file(s) added`);
    }
    if (addInputRef111.current) addInputRef111.current.value = "";
  };

  const handleRemoveAddFile111 = (id) => {
    setAdditionalFiles111((prev) => prev.filter((item) => item.id !== id));
    setIsSaved111(false);
  };

  const handleSave111 = async (isFinalSubmit = false) => {
    if (words111 > maxWords) {
      toast.error("Word limit exceeded. Maximum 500 words allowed.");
      return;
    }
    const data = {
      desc: desc111,
      suppDoc: supportingDoc111,
      addFiles: additionalFiles111,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey111, JSON.stringify(data));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved111(true);
        toast.success(isFinalSubmit ? "1.1.1 submitted" : "1.1.1 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.1.1",
        academicYear,
        description: desc111,
        supportingDoc: supportingDoc111,
        additionalFiles: additionalFiles111,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved111(true);
      setIsSubmitted111(isFinalSubmit);
      if (isFinalSubmit) setIsEditing111(false);
      setUpdatedAt111(new Date().toISOString());
      toast.success(isFinalSubmit ? "1.1.1 response submitted successfully" : "1.1.1 draft saved");
      loadCriterionData();
    } catch (error) {
      toast.error("Failed to sync with server. Local draft saved.");
    }
  };

  // 1.1.2 File Handlers
  const handleSuppDoc112 = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSupportingDoc112({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      setIsSaved112(false);
      toast.success(`Supporting document selected: ${file.name}`);
    }
  };

  const handleAddFiles112 = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setAdditionalFiles112((prev) => [...prev, ...newItems]);
      setIsSaved112(false);
      toast.success(`${files.length} file(s) added`);
    }
    if (addInputRef112.current) addInputRef112.current.value = "";
  };

  const handleRemoveAddFile112 = (id) => {
    setAdditionalFiles112((prev) => prev.filter((item) => item.id !== id));
    setIsSaved112(false);
  };

  const handleSave112 = async (isFinalSubmit = false) => {
    if (words112 > maxWords) {
      toast.error("Word limit exceeded. Maximum 500 words allowed.");
      return;
    }
    const data = {
      desc: desc112,
      suppDoc: supportingDoc112,
      addFiles: additionalFiles112,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey112, JSON.stringify(data));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved112(true);
        toast.success(isFinalSubmit ? "1.1.2 submitted" : "1.1.2 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.1.2",
        academicYear,
        description: desc112,
        supportingDoc: supportingDoc112,
        additionalFiles: additionalFiles112,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved112(true);
      setIsSubmitted112(isFinalSubmit);
      if (isFinalSubmit) setIsEditing112(false);
      setUpdatedAt112(new Date().toISOString());
      toast.success(isFinalSubmit ? "1.1.2 response submitted successfully" : "1.1.2 draft saved");
      loadCriterionData();
    } catch (error) {
      toast.error("Failed to sync with server. Local draft saved.");
    }
  };

  // Admin stats computation
  const adminSummary = React.useMemo(() => {
    const totalDepts = departmentStatuses.length;
    let submittedCount = 0;
    let draftCount = 0;
    let notStartedCount = 0;

    departmentStatuses.forEach((d) => {
      const isSub = d.sub111?.status === "SUBMITTED" || d.sub112?.status === "SUBMITTED";
      const isDraft =
        !isSub &&
        (d.sub111?.status === "DRAFT" ||
          d.sub112?.status === "DRAFT" ||
          d.sub111?.hasContent ||
          d.sub112?.hasContent);

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
        {/* Navigation & Context */}
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
                Criterion 1.1
              </span>
              {isAdmin && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-white rounded">
                  Admin Observer Mode
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Curriculum Design and Development
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAdmin
                ? "Monitor and verify curriculum development submissions across university departments."
                : "Enter qualitative & quantitative metrics and upload supporting documentation."}
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
                <h2 className="text-sm font-bold text-gray-900">
                  Department Submission Filter
                </h2>
                <p className="text-xs text-gray-500">
                  Select a department to view its filled data, word counts, and attached files.
                </p>
              </div>

              {/* Department Dropdown Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="deptFilter" className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Filter Department:
                </label>
                <select
                  id="deptFilter"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-2 min-w-[240px] focus:outline-none focus:border-gray-900"
                >
                  <option value="all">-- All Departments Overview --</option>
                  {departmentStatuses.map((dept) => {
                    const isSub =
                      dept.sub111?.status === "SUBMITTED" && dept.sub112?.status === "SUBMITTED";
                    const isPartial =
                      dept.sub111?.status === "SUBMITTED" ||
                      dept.sub112?.status === "SUBMITTED" ||
                      dept.sub111?.hasContent ||
                      dept.sub112?.hasContent;
                    const label = isSub
                      ? "✓ Submitted"
                      : isPartial
                      ? "• Draft / Partial"
                      : "✕ Not Started";
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
                <p className="text-[11px] text-gray-500 font-medium">Submitted (1.1)</p>
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

            {/* If all is selected, show table summary of all departments */}
            {selectedDeptId === "all" && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">School</th>
                      <th className="py-2.5 px-3 text-center">1.1.1 Status</th>
                      <th className="py-2.5 px-3 text-center">1.1.2 Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departmentStatuses.map((dept, index) => {
                      const s111 = dept.sub111?.status;
                      const s112 = dept.sub112?.status;

                      return (
                        <tr key={dept.departmentId} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-500">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {dept.departmentName}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">{dept.schoolName || "-"}</td>
                          <td className="py-2.5 px-3 text-center">
                            {s111 === "SUBMITTED" ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s111 === "DRAFT" || dept.sub111?.hasContent ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px] font-medium">
                                In Draft
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Not Started</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {s112 === "SUBMITTED" ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s112 === "DRAFT" || dept.sub112?.hasContent ? (
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

        {/* Section 1.1.1 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div
            onClick={() =>
              setExpandedSection(expandedSection === "1.1.1" ? null : "1.1.1")
            }
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">1.1.1</span>
                <span>•</span>
                <span>Qualitative Metric</span>
                <span>•</span>
                <span>Weightage: 20</span>
                {isSubmitted111 ? (
                  <>
                    <span>•</span>
                    <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      Submitted
                    </span>
                  </>
                ) : isSaved111 || desc111 ? (
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
                {updatedAt111 && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt111).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                1.1.1 : Curricula developed and implemented have relevance to the
                local, regional, national, and global developmental needs, which is
                reflected in the Programme outcomes (POs), and Course
                Outcomes(COs) of the Programmes offered by the University
              </p>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1">
              {expandedSection === "1.1.1" ? "Hide" : "Open"}
            </button>
          </div>

          {/* Form / View Content 1.1.1 */}
          {expandedSection === "1.1.1" && (
            <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-5">
              {/* If Admin is viewing and all departments selected */}
              {isAdmin && selectedDeptId === "all" ? (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Select a Department to View Criterion 1.1.1 Submission
                  </p>
                  <p className="text-xs text-gray-500">
                    Use the filter dropdown above or click "View Submission →" in the table to inspect an individual department's qualitative text and attachments.
                  </p>
                </div>
              ) : (
                <>
                  {/* Submitted Status & Edit Banner */}
                  {!isAdmin && isSubmitted111 && !isEditing111 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gray-100 border border-gray-300 rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-900 text-white rounded text-[11px] font-bold">
                            ✓ Data Submitted
                          </span>
                          {updatedAt111 && (
                            <span className="text-[11px] text-gray-500">
                              Submitted: {new Date(updatedAt111).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Data is submitted and locked. Click "Edit Submission" if you need to update text or replace uploaded documents.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditing111(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors whitespace-nowrap shadow-sm"
                      >
                        ✎ Edit Submission
                      </button>
                    </div>
                  )}

                  {/* Editing Active Notification */}
                  {!isAdmin && isSubmitted111 && isEditing111 && (
                    <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs">
                      <span className="font-semibold text-gray-800">
                        Editing Mode: You can modify description and replace or add attachments.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing111(false);
                          loadCriterionData();
                        }}
                        className="text-gray-600 hover:text-black underline font-medium"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}

                  {/* Qualitative Description */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        {isAdmin ? "Department's Qualitative Narrative" : "Description (Maximum 500 words)"}
                      </label>
                      <span
                        className={`text-xs font-medium ${
                          words111 > maxWords ? "text-red-600 font-bold" : "text-gray-500"
                        }`}
                      >
                        Words: {words111} / {maxWords}
                      </span>
                    </div>

                    {/* ADMIN READ-ONLY VIEW */}
                    {isAdmin ? (
                      <div className="min-h-[140px] p-3 text-xs bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-800 leading-relaxed font-normal">
                        {desc111.trim() ? (
                          desc111
                        ) : (
                          <span className="text-gray-400 italic">
                            No narrative description submitted by this department yet.
                          </span>
                        )}
                      </div>
                    ) : (
                      /* DEPARTMENT EDIT VIEW */
                      <>
                        <textarea
                          rows={7}
                          value={desc111}
                          disabled={isSubmitted111 && !isEditing111}
                          onChange={(e) => {
                            setDesc111(e.target.value);
                            setIsSaved111(false);
                          }}
                          placeholder="Type your response explaining curriculum relevance to developmental needs, POs and COs..."
                          className={`w-full p-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 ${
                            isSubmitted111 && !isEditing111 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                          }`}
                        />
                        {words111 > maxWords && (
                          <p className="text-xs text-red-600">
                            Word limit exceeded by {words111 - maxWords} words. Please shorten your response.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Supporting Document */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                    <label className="text-xs font-bold text-gray-800 block">
                      Supporting Document
                    </label>

                    {isAdmin ? (
                      supportingDoc111 ? (
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md text-xs bg-gray-50">
                          <div>
                            <p className="font-semibold text-gray-900">{supportingDoc111.name}</p>
                            <p className="text-gray-500 text-[11px]">{supportingDoc111.size}</p>
                          </div>
                          <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2.5 py-1 rounded bg-white">
                            Attached File
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-md bg-gray-50 italic">
                          No supporting document uploaded.
                        </div>
                      )
                    ) : (
                      <>
                        <input
                          type="file"
                          ref={suppInputRef111}
                          onChange={handleSuppDoc111}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                        {supportingDoc111 ? (
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md text-xs bg-gray-50">
                            <div>
                              <p className="font-semibold text-gray-900">{supportingDoc111.name}</p>
                              <p className="text-gray-500 text-[11px]">{supportingDoc111.size}</p>
                            </div>
                            {isSubmitted111 && !isEditing111 ? (
                              <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2.5 py-1 rounded bg-white">
                                Attached File
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => suppInputRef111.current?.click()}
                                  className="text-gray-700 hover:underline font-medium"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSupportingDoc111(null);
                                    setIsSaved111(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isSubmitted111 && !isEditing111 ? (
                          <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-md bg-gray-50 italic">
                            No supporting document uploaded.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => suppInputRef111.current?.click()}
                            className="w-full py-4 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors text-center"
                          >
                            Click to upload Supporting Document (PDF / Word)
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Additional Information (Multiple files) */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        Additional Information
                      </label>
                      {!isAdmin && (!isSubmitted111 || isEditing111) && (
                        <>
                          <input
                            type="file"
                            multiple
                            ref={addInputRef111}
                            onChange={handleAddFiles111}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => addInputRef111.current?.click()}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800 font-medium"
                          >
                            + Add File
                          </button>
                        </>
                      )}
                    </div>

                    {additionalFiles111.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">
                        {isAdmin || (isSubmitted111 && !isEditing111)
                          ? "No additional files provided."
                          : "No additional files attached yet. You can add as many files as needed."}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {additionalFiles111.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between p-2.5 border border-gray-200 rounded-md text-xs bg-gray-50"
                          >
                            <span className="font-medium text-gray-800 truncate pr-2">
                              {idx + 1}. {item.name} ({item.size})
                            </span>
                            {!isAdmin && (!isSubmitted111 || isEditing111) && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAddFile111(item.id)}
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

                  {/* Form Buttons: Only for Department */}
                  {!isAdmin && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      {isSubmitted111 && !isEditing111 ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                            <span className="text-xs font-semibold text-gray-700">
                              Status: Data Submitted
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditing111(true)}
                            className="px-4 py-2 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors shadow-sm"
                          >
                            ✎ Edit Submission
                          </button>
                        </>
                      ) : isSubmitted111 && isEditing111 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing111(false);
                              loadCriterionData();
                            }}
                            className="px-3.5 py-2 text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md font-medium"
                          >
                            Cancel Edit
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSave111(false)}
                              disabled={words111 > maxWords}
                              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium disabled:opacity-50"
                            >
                              Save Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave111(true)}
                              disabled={words111 > maxWords || !desc111.trim()}
                              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium disabled:opacity-50"
                            >
                              Update & Re-Submit 1.1.1
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div></div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSave111(false)}
                              disabled={words111 > maxWords}
                              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium disabled:opacity-50"
                            >
                              Save as Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave111(true)}
                              disabled={words111 > maxWords || !desc111.trim()}
                              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium disabled:opacity-50"
                            >
                              Submit 1.1.1
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Section 1.1.2 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div
            onClick={() =>
              setExpandedSection(expandedSection === "1.1.2" ? null : "1.1.2")
            }
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">1.1.2</span>
                <span>•</span>
                <span>Quantitative Metric</span>
                <span>•</span>
                <span>Weightage: 30</span>
                {isSubmitted112 ? (
                  <>
                    <span>•</span>
                    <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      Submitted
                    </span>
                  </>
                ) : isSaved112 || desc112 ? (
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
                {updatedAt112 && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt112).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                1.1.2 : The Programmes offered by the institution focus on
                employability/ entrepreneurship/ skill development and their course
                syllabi are adequately revised to incorporate contemporary
                requirements
              </p>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1">
              {expandedSection === "1.1.2" ? "Hide" : "Open"}
            </button>
          </div>

          {/* Form / View Content 1.1.2 */}
          {expandedSection === "1.1.2" && (
            <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-5">
              {/* If Admin is viewing and all departments selected */}
              {isAdmin && selectedDeptId === "all" ? (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Select a Department to View Criterion 1.1.2 Submission
                  </p>
                  <p className="text-xs text-gray-500">
                    Use the filter dropdown above or click "View Submission →" in the table to inspect an individual department's revision narrative and attachments.
                  </p>
                </div>
              ) : (
                <>
                  {/* Submitted Status & Edit Banner */}
                  {!isAdmin && isSubmitted112 && !isEditing112 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gray-100 border border-gray-300 rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-900 text-white rounded text-[11px] font-bold">
                            ✓ Data Submitted
                          </span>
                          {updatedAt112 && (
                            <span className="text-[11px] text-gray-500">
                              Submitted: {new Date(updatedAt112).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Data is submitted and locked. Click "Edit Submission" if you need to update text or replace uploaded documents.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditing112(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors whitespace-nowrap shadow-sm"
                      >
                        ✎ Edit Submission
                      </button>
                    </div>
                  )}

                  {/* Editing Active Notification */}
                  {!isAdmin && isSubmitted112 && isEditing112 && (
                    <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs">
                      <span className="font-semibold text-gray-800">
                        Editing Mode: You can modify description and replace or add attachments.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing112(false);
                          loadCriterionData();
                        }}
                        className="text-gray-600 hover:text-black underline font-medium"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}

                  {/* Qualitative Description */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        {isAdmin ? "Department's Qualitative Narrative" : "Description (Maximum 500 words)"}
                      </label>
                      <span
                        className={`text-xs font-medium ${
                          words112 > maxWords ? "text-red-600 font-bold" : "text-gray-500"
                        }`}
                      >
                        Words: {words112} / {maxWords}
                      </span>
                    </div>

                    {/* ADMIN READ-ONLY VIEW */}
                    {isAdmin ? (
                      <div className="min-h-[140px] p-3 text-xs bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-800 leading-relaxed font-normal">
                        {desc112.trim() ? (
                          desc112
                        ) : (
                          <span className="text-gray-400 italic">
                            No narrative description submitted by this department yet.
                          </span>
                        )}
                      </div>
                    ) : (
                      /* DEPARTMENT EDIT VIEW */
                      <>
                        <textarea
                          rows={7}
                          value={desc112}
                          disabled={isSubmitted112 && !isEditing112}
                          onChange={(e) => {
                            setDesc112(e.target.value);
                            setIsSaved112(false);
                          }}
                          placeholder="Type your response regarding syllabus revision and employability/skill development focus..."
                          className={`w-full p-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 ${
                            isSubmitted112 && !isEditing112 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                          }`}
                        />
                        {words112 > maxWords && (
                          <p className="text-xs text-red-600">
                            Word limit exceeded by {words112 - maxWords} words. Please shorten your response.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Supporting Document */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                    <label className="text-xs font-bold text-gray-800 block">
                      Supporting Document
                    </label>

                    {isAdmin ? (
                      supportingDoc112 ? (
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md text-xs bg-gray-50">
                          <div>
                            <p className="font-semibold text-gray-900">{supportingDoc112.name}</p>
                            <p className="text-gray-500 text-[11px]">{supportingDoc112.size}</p>
                          </div>
                          <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2.5 py-1 rounded bg-white">
                            Attached File
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-md bg-gray-50 italic">
                          No supporting document uploaded.
                        </div>
                      )
                    ) : (
                      <>
                        <input
                          type="file"
                          ref={suppInputRef112}
                          onChange={handleSuppDoc112}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                        {supportingDoc112 ? (
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md text-xs bg-gray-50">
                            <div>
                              <p className="font-semibold text-gray-900">{supportingDoc112.name}</p>
                              <p className="text-gray-500 text-[11px]">{supportingDoc112.size}</p>
                            </div>
                            {isSubmitted112 && !isEditing112 ? (
                              <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2.5 py-1 rounded bg-white">
                                Attached File
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => suppInputRef112.current?.click()}
                                  className="text-gray-700 hover:underline font-medium"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSupportingDoc112(null);
                                    setIsSaved112(false);
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        ) : isSubmitted112 && !isEditing112 ? (
                          <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-md bg-gray-50 italic">
                            No supporting document uploaded.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => suppInputRef112.current?.click()}
                            className="w-full py-4 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors text-center"
                          >
                            Click to upload Supporting Document (PDF / Word)
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Additional Information (Multiple files) */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        Additional Information
                      </label>
                      {!isAdmin && (!isSubmitted112 || isEditing112) && (
                        <>
                          <input
                            type="file"
                            multiple
                            ref={addInputRef112}
                            onChange={handleAddFiles112}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => addInputRef112.current?.click()}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800 font-medium"
                          >
                            + Add File
                          </button>
                        </>
                      )}
                    </div>

                    {additionalFiles112.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">
                        {isAdmin || (isSubmitted112 && !isEditing112)
                          ? "No additional files provided."
                          : "No additional files attached yet. You can add as many files as needed."}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {additionalFiles112.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between p-2.5 border border-gray-200 rounded-md text-xs bg-gray-50"
                          >
                            <span className="font-medium text-gray-800 truncate pr-2">
                              {idx + 1}. {item.name} ({item.size})
                            </span>
                            {!isAdmin && (!isSubmitted112 || isEditing112) && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAddFile112(item.id)}
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

                  {/* Form Buttons: Only for Department */}
                  {!isAdmin && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      {isSubmitted112 && !isEditing112 ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-900"></span>
                            <span className="text-xs font-semibold text-gray-700">
                              Status: Data Submitted
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditing112(true)}
                            className="px-4 py-2 text-xs font-semibold border border-gray-400 bg-white hover:bg-gray-50 text-gray-900 rounded-md transition-colors shadow-sm"
                          >
                            ✎ Edit Submission
                          </button>
                        </>
                      ) : isSubmitted112 && isEditing112 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing112(false);
                              loadCriterionData();
                            }}
                            className="px-3.5 py-2 text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md font-medium"
                          >
                            Cancel Edit
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSave112(false)}
                              disabled={words112 > maxWords}
                              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium disabled:opacity-50"
                            >
                              Save Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave112(true)}
                              disabled={words112 > maxWords || !desc112.trim()}
                              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium disabled:opacity-50"
                            >
                              Update & Re-Submit 1.1.2
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div></div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSave112(false)}
                              disabled={words112 > maxWords}
                              className="px-4 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium disabled:opacity-50"
                            >
                              Save as Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave112(true)}
                              disabled={words112 > maxWords || !desc112.trim()}
                              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium disabled:opacity-50"
                            >
                              Submit 1.1.2
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Criterion1_1;
