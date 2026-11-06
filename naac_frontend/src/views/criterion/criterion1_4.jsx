import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CriterionService from "@/service/criterionService";

const ACADEMIC_YEARS = [
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
];

const STAKEHOLDERS_OPTIONS = [
  { id: "students", label: "Students", desc: "Enrolled UG/PG students" },
  { id: "teachers", label: "Teachers", desc: "Department faculty members" },
  { id: "employers", label: "Employers", desc: "Recruiters & Industry leaders" },
  { id: "alumni", label: "Alumni", desc: "Graduated alumni community" },
  { id: "academic_peers", label: "Academic Peers", desc: "Professors & subject experts from other universities" },
];

const NAAC_OPTIONS = [
  {
    key: "A",
    score: 20,
    title: "Option A",
    badge: "20 / 20 Marks",
    description:
      "Feedback collected, analysed, action taken & communicated to relevant body and feedback hosted on the institutional website",
    requirements: [
      "Feedback collected from stakeholders",
      "Analysis report prepared with statistical data/charts",
      "Action Taken Report (ATR) prepared & approved by BOS / Academic Council",
      "Communicated to relevant academic bodies",
      "Report and ATR published publicly on institutional website",
    ],
  },
  {
    key: "B",
    score: 15,
    title: "Option B",
    badge: "15 / 20 Marks",
    description:
      "Feedback collected, analysed, action has been taken and communicated to the relevant body",
    requirements: [
      "Feedback collected from stakeholders",
      "Analysis conducted and documented",
      "Action Taken Report (ATR) drafted and sent to BOS / Academic Council",
      "(Not hosted publicly on institutional website)",
    ],
  },
  {
    key: "C",
    score: 10,
    title: "Option C",
    badge: "10 / 20 Marks",
    description: "Feedback collected and analysed",
    requirements: [
      "Feedback collected from stakeholders",
      "Analysis report prepared",
      "(No formal action taken or communicated to BOS)",
    ],
  },
  {
    key: "D",
    score: 5,
    title: "Option D",
    badge: "5 / 20 Marks",
    description: "Feedback collected",
    requirements: [
      "Feedback collected from stakeholders only",
      "(No structured analysis or action taken)",
    ],
  },
  {
    key: "E",
    score: 0,
    title: "Option E",
    badge: "0 / 20 Marks",
    description: "Feedback not collected",
    requirements: ["No feedback system in place for the academic year"],
  },
];

const Criterion1_4 = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Role detection
  const isAdmin = user?.role === "admin";
  const userDeptName = user?.department?.name || user?.username || "Department";

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [allSubmissionsList, setAllSubmissionsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Storage keys for draft persistence (only for non-admin)
  const deptIdKey = user?.departmentId || user?.username || "default";
  const storageKey141 = `naac_141_${deptIdKey}_${academicYear}`;

  // Form State for 1.4.1
  const [selectedOption, setSelectedOption] = useState("A");
  const [selectedStakeholders, setSelectedStakeholders] = useState([
    "students",
    "teachers",
    "employers",
    "alumni",
  ]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [actionTakenDoc, setActionTakenDoc] = useState(null);
  const [analysisDoc, setAnalysisDoc] = useState(null);
  const [minutesDoc, setMinutesDoc] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  // Read-Only flag: Admin is ALWAYS read-only, Department is read-only when submitted unless editing
  const isReadOnly = isAdmin || (isSubmitted && !isEditing);

  // File input refs
  const atrInputRef = useRef(null);
  const analysisInputRef = useRef(null);
  const minutesInputRef = useRef(null);
  const addInputRef = useRef(null);

  // Word count helper
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const wordsCount = countWords(description);
  const maxWords = 500;

  // Stakeholder toggle helper
  const toggleStakeholder = (id) => {
    if (isReadOnly) return;
    setSelectedStakeholders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setIsSaved(false);
  };

  // Option select helper
  const handleSelectOption = (key) => {
    if (isReadOnly) return;
    setSelectedOption(key);
    setIsSaved(false);
  };

  // Reset helper
  const resetForm = () => {
    if (isAdmin) {
      setSelectedOption("");
      setSelectedStakeholders([]);
      setWebsiteUrl("");
      setDescription("");
      setActionTakenDoc(null);
      setAnalysisDoc(null);
      setMinutesDoc(null);
      setAdditionalFiles([]);
      setIsSaved(false);
      setIsSubmitted(false);
      setIsEditing(false);
      setUpdatedAt(null);
    } else {
      setSelectedOption("A");
      setSelectedStakeholders(["students", "teachers", "employers", "alumni"]);
      setWebsiteUrl("");
      setDescription("");
      setActionTakenDoc(null);
      setAnalysisDoc(null);
      setMinutesDoc(null);
      setAdditionalFiles([]);
      setIsSaved(false);
      setIsSubmitted(false);
      setIsEditing(false);
      setUpdatedAt(null);
    }
  };

  // Load Submissions
  const loadCriterionData = async () => {
    setIsLoadingData(true);
    try {
      const res = await CriterionService.getSubmissions({
        criterionCode: "1.4.1",
        academicYear,
        ...(isAdmin && selectedDeptId !== "all" ? { departmentId: selectedDeptId } : {}),
        ...(!isAdmin && user?.departmentId ? { departmentId: user.departmentId } : {}),
      });

      if (res?.data) {
        const { departments, data } = res.data;
        if (departments) setDepartmentStatuses(departments);
        if (data) setAllSubmissionsList(data);

        const currentTargetDeptId = isAdmin
          ? selectedDeptId !== "all"
            ? parseInt(selectedDeptId)
            : null
          : user?.departmentId;

        if (currentTargetDeptId) {
          const sub = data.find(
            (s) =>
              s.departmentId === currentTargetDeptId &&
              s.criterionCode === "1.4.1" &&
              s.academicYear === academicYear
          );

          if (sub && sub.isSubmitted) {
            // Officially submitted
            setDescription(sub.description || "");
            setIsSaved(true);
            setIsSubmitted(true);
            setIsEditing(false);
            setUpdatedAt(sub.updatedAt);

            // Parse supportingDoc json
            if (sub.supportingDoc) {
              const doc = sub.supportingDoc;
              setSelectedOption(doc.selectedOption || "A");
              setSelectedStakeholders(
                doc.stakeholders || ["students", "teachers", "employers", "alumni"]
              );
              setWebsiteUrl(doc.websiteUrl || "");
              setActionTakenDoc(doc.actionTakenDoc || null);
              setAnalysisDoc(doc.analysisDoc || null);
              setMinutesDoc(doc.minutesDoc || null);
            } else {
              setSelectedOption("A");
              setSelectedStakeholders(["students", "teachers", "employers", "alumni"]);
              setWebsiteUrl("");
              setActionTakenDoc(null);
              setAnalysisDoc(null);
              setMinutesDoc(null);
            }
            setAdditionalFiles(sub.additionalFiles || []);
          } else if (sub && !sub.isSubmitted) {
            // Draft in progress
            setIsSaved(true);
            setIsSubmitted(false);
            setIsEditing(false);
            setUpdatedAt(sub.updatedAt);

            if (!isAdmin) {
              setDescription(sub.description || "");
              if (sub.supportingDoc) {
                const doc = sub.supportingDoc;
                setSelectedOption(doc.selectedOption || "A");
                setSelectedStakeholders(
                  doc.stakeholders || ["students", "teachers", "employers", "alumni"]
                );
                setWebsiteUrl(doc.websiteUrl || "");
                setActionTakenDoc(doc.actionTakenDoc || null);
                setAnalysisDoc(doc.analysisDoc || null);
                setMinutesDoc(doc.minutesDoc || null);
              }
              setAdditionalFiles(sub.additionalFiles || []);
            } else {
              resetForm();
              setIsSaved(true);
              setUpdatedAt(sub.updatedAt);
            }
          } else {
            // No record
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey141);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setSelectedOption(parsed.selectedOption || "A");
                setSelectedStakeholders(
                  parsed.stakeholders || ["students", "teachers", "employers", "alumni"]
                );
                setWebsiteUrl(parsed.websiteUrl || "");
                setDescription(parsed.description || "");
                setActionTakenDoc(parsed.actionTakenDoc || null);
                setAnalysisDoc(parsed.analysisDoc || null);
                setMinutesDoc(parsed.minutesDoc || null);
                setAdditionalFiles(parsed.additionalFiles || []);
                setIsSaved(true);
                setIsSubmitted(false);
                setIsEditing(false);
                setUpdatedAt(parsed.updatedAt || null);
              } else {
                resetForm();
              }
            } else {
              resetForm();
            }
          }
        } else if (isAdmin && selectedDeptId === "all") {
          resetForm();
        }
      }
    } catch (err) {
      console.error("Failed to load criterion 1.4 submissions:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadCriterionData();
  }, [isAdmin, selectedDeptId, academicYear, user?.departmentId]);

  // File Handlers (Disabled for Admin)
  const handleFileUpload = (type, e) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMeta = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      uploadDate: new Date().toLocaleDateString(),
    };

    if (type === "atr") {
      setActionTakenDoc(fileMeta);
      toast.success(`Action Taken Report attached: ${file.name}`);
    } else if (type === "analysis") {
      setAnalysisDoc(fileMeta);
      toast.success(`Feedback Analysis attached: ${file.name}`);
    } else if (type === "minutes") {
      setMinutesDoc(fileMeta);
      toast.success(`BOS/Academic Minutes attached: ${file.name}`);
    }
    setIsSaved(false);
  };

  const handleAddAdditionalFiles = (e) => {
    if (isReadOnly) return;
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setAdditionalFiles((prev) => [...prev, ...newItems]);
      setIsSaved(false);
      toast.success(`${files.length} sample file(s) attached`);
    }
    if (addInputRef.current) addInputRef.current.value = "";
  };

  const handleRemoveAdditionalFile = (id) => {
    if (isReadOnly) return;
    setAdditionalFiles((prev) => prev.filter((item) => item.id !== id));
    setIsSaved(false);
  };

  // Save / Submit (Strictly rejected if Admin)
  const handleSave = async (isFinalSubmit = false) => {
    if (isAdmin) {
      toast.error("Admins have read-only access. Only departments can submit data.");
      return;
    }

    if (wordsCount > maxWords) {
      toast.error(`Word limit exceeded! Current words: ${wordsCount}, max allowed: ${maxWords}`);
      return;
    }

    if (isFinalSubmit && selectedOption === "A" && !websiteUrl.trim()) {
      toast.error("Option A requires an Institutional Website Link hosting the feedback reports.");
      return;
    }

    const currentOptionObj = NAAC_OPTIONS.find((o) => o.key === selectedOption);
    const scoreClaimed = currentOptionObj?.score || 0;

    const supportingDoc = {
      selectedOption,
      scoreClaimed,
      stakeholders: selectedStakeholders,
      websiteUrl: websiteUrl.trim(),
      actionTakenDoc,
      analysisDoc,
      minutesDoc,
    };

    const draftData = {
      selectedOption,
      scoreClaimed,
      stakeholders: selectedStakeholders,
      websiteUrl: websiteUrl.trim(),
      description,
      actionTakenDoc,
      analysisDoc,
      minutesDoc,
      additionalFiles,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey141, JSON.stringify(draftData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved(true);
        toast.success(isFinalSubmit ? "1.4.1 submitted (Offline mode)" : "1.4.1 draft saved locally");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.4.1",
        academicYear,
        description,
        supportingDoc,
        additionalFiles,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved(true);
      setIsSubmitted(isFinalSubmit);
      if (isFinalSubmit) setIsEditing(false);
      setUpdatedAt(new Date().toISOString());
      toast.success(
        isFinalSubmit
          ? "Criterion 1.4.1 successfully submitted to IQAC!"
          : "Criterion 1.4.1 draft saved successfully!"
      );
      loadCriterionData();
    } catch (error) {
      toast.error("Failed to sync with server. Local draft saved.");
    }
  };

  // Computed properties
  const currentOptionInfo = useMemo(() => {
    return (
      NAAC_OPTIONS.find((o) => o.key === selectedOption) || {
        score: 0,
        title: "Not Selected",
        badge: "0/20",
        description: "No option claimed yet",
        requirements: [],
      }
    );
  }, [selectedOption]);

  const selectedDepartmentObj = useMemo(() => {
    return departmentStatuses.find((d) => d.departmentId === parseInt(selectedDeptId));
  }, [departmentStatuses, selectedDeptId]);

  const adminSummary = useMemo(() => {
    const totalDepts = departmentStatuses.length;
    let submittedCount = 0;
    let draftCount = 0;
    let notStartedCount = 0;

    departmentStatuses.forEach((d) => {
      const status141 = d.sub141?.status;
      if (status141 === "SUBMITTED") submittedCount++;
      else if (status141 === "DRAFT" || d.sub141?.hasContent) draftCount++;
      else notStartedCount++;
    });

    return { totalDepts, submittedCount, draftCount, notStartedCount };
  }, [departmentStatuses]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 space-y-6">
      {/* 1. Navigation & Context Sub-Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:text-black font-semibold transition-colors"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {isAdmin ? "Admin View Mode (Read Only)" : userDeptName}
          </span>
          <span>•</span>
          <span>Academic Year {academicYear}</span>
        </div>
      </div>

      {/* 2. Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-gray-100 text-gray-900 rounded border border-gray-300">
              Key Indicator 1.4
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200">
              Metric 1.4.1 (QnM)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-gray-900 text-white rounded">
              Weightage: 20 Marks
            </span>
            {isAdmin && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-800 rounded border border-gray-300">
                Admin Observer Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Feedback System & Curriculum Review
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-4xl leading-relaxed">
            {isAdmin
              ? "Review and verify structured curriculum feedback collected by departments from stakeholders, action taken reports (ATR), and website hosting."
              : "Structured feedback on curriculum and its transactions is regularly obtained from stakeholders and processed for quality enhancement."}
          </p>
        </div>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Year:</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-black cursor-pointer"
          >
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. ADMIN EXCLUSIVE SECTION: Stats & Department Overview */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Departments</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.totalDepts}</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Submitted (1.4.1)</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.submittedCount}</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">In Draft / Progress</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.draftCount}</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Not Started</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.notStartedCount}</p>
            </div>
          </div>

          {/* Department Filter for Admin */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Department Submission Filter
              </h2>
              <p className="text-xs text-gray-500">
                Select a department to view its filled 1.4.1 data, claimed option, and attached documents in Read-Only mode.
              </p>
            </div>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-gray-900 outline-none focus:border-black min-w-[260px]"
            >
              <option value="all">-- All Departments Overview --</option>
              {departmentStatuses.map((dept) => {
                const s141 = dept.sub141?.status;
                const label =
                  s141 === "SUBMITTED"
                    ? "✓ Submitted"
                    : s141 === "DRAFT" || dept.sub141?.hasContent
                    ? "• Draft"
                    : "✕ Not Started";
                return (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName} ({label})
                  </option>
                );
              })}
            </select>
          </div>

          {/* If selectedDeptId === "all", show the consolidated table */}
          {selectedDeptId === "all" && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Institutional 1.4.1 Submissions Overview
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {departmentStatuses.length} Departments Registered
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">School</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Claimed Option</th>
                      <th className="py-2.5 px-3 text-center">Score Claimed</th>
                      <th className="py-2.5 px-3">Website Link</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departmentStatuses.map((dept, index) => {
                      const s141 = dept.sub141?.status;
                      const deptSub = allSubmissionsList.find(
                        (s) => s.departmentId === dept.departmentId && s.criterionCode === "1.4.1"
                      );
                      const isDeptSub = deptSub?.isSubmitted;
                      const optClaimed = isDeptSub ? deptSub?.supportingDoc?.selectedOption || "-" : "-";
                      const scoreClaimed = isDeptSub ? deptSub?.supportingDoc?.scoreClaimed ?? "-" : "-";
                      const webLink = isDeptSub ? deptSub?.supportingDoc?.websiteUrl || "" : "";

                      return (
                        <tr key={dept.departmentId} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-3 text-gray-500">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {dept.departmentName}
                            <span className="ml-1 text-[11px] text-gray-400 font-normal">
                              ({dept.departmentCode})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">{dept.schoolName || "-"}</td>
                          <td className="py-2.5 px-3 text-center">
                            {s141 === "SUBMITTED" ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s141 === "DRAFT" || dept.sub141?.hasContent ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px] font-medium">
                                In Draft
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Not Started</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                            {optClaimed !== "-" ? `Option ${optClaimed}` : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                            {scoreClaimed !== "-" ? `${scoreClaimed} / 20` : "-"}
                          </td>
                          <td className="py-2.5 px-3 max-w-[180px] truncate text-gray-500">
                            {webLink ? (
                              <a
                                href={webLink.startsWith("http") ? webLink : `https://${webLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-900 underline hover:text-black truncate"
                              >
                                {webLink} ↗
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedDeptId(dept.departmentId.toString())}
                              className="text-gray-900 hover:text-black font-bold underline underline-offset-2"
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

              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-500">
                Click on "View Submission →" in the table above or use the dropdown to inspect a specific department's Criterion 1.4.1 submission in Read-Only Mode.
              </div>
            </div>
          )}

          {/* Department Selection Banner for Admin */}
          {selectedDeptId !== "all" && (
            <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Viewing Submission: {selectedDepartmentObj?.departmentName || `Department #${selectedDeptId}`}
                </p>
                <p className="text-xs text-gray-600">
                  School: {selectedDepartmentObj?.schoolName || "University Academic Department"} • Mode:{" "}
                  <span className="font-bold text-gray-900">Read-Only Observer</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptId("all")}
                className="text-xs font-bold px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg border border-gray-400 shadow-sm transition"
              >
                ← View All Departments List
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MAIN SUBMISSION VIEW */}
      {/* CASE A: Admin selected a department that HAS NOT submitted yet */}
      {isAdmin && selectedDeptId !== "all" && !isSubmitted && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm space-y-4 max-w-3xl mx-auto my-6">
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold rounded">
              Not Submitted
            </span>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedDepartmentObj?.departmentName || "Selected Department"} Has Not Submitted Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              This department has not yet submitted their official Metric 1.4.1 Feedback System report to IQAC for the Academic Year {academicYear}.
            </p>
          </div>

          {isSaved ? (
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 max-w-md mx-auto">
              <strong>Draft in Progress:</strong> Department has saved a draft (last updated:{" "}
              {updatedAt ? new Date(updatedAt).toLocaleDateString() : "recently"}), but final submission is pending.
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 max-w-md mx-auto">
              No submission or draft initiated by this department for {academicYear}.
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSelectedDeptId("all")}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-md shadow-sm transition"
            >
              ← Back to All Departments Overview
            </button>
          </div>
        </div>
      )}

      {/* CASE B: Department user viewing their own form OR Admin viewing a SUBMITTED department */}
      {(!isAdmin || (isAdmin && selectedDeptId !== "all" && isSubmitted)) && (
        <div className="space-y-6">
          {/* Top banner if Admin is reviewing submitted data */}
          {isAdmin && isSubmitted && (
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Official Department Submission Verified
                </p>
                <p className="text-[11px] text-gray-600">
                  Submitted on {updatedAt ? new Date(updatedAt).toLocaleString() : academicYear} • Claimed: Option {selectedOption} ({currentOptionInfo.score} Marks)
                </p>
              </div>
              <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded shadow-sm text-center">
                Score: {currentOptionInfo.score} / 20 Marks
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form / Submitted Data (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card: 5 Options Selector */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      1. Institutional Classification (Opt Any One)
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAdmin
                        ? `Department's submitted classification for Academic Year ${academicYear}.`
                        : `Select the level of feedback processing accomplished by your department in ${academicYear}.`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-500">Claimed Score:</span>
                    <div className="text-base font-bold text-gray-900">
                      {currentOptionInfo.score} / 20
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {NAAC_OPTIONS.map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => !isReadOnly && handleSelectOption(opt.key)}
                        className={`border rounded-xl p-3.5 transition-all ${
                          isReadOnly ? "cursor-default" : "cursor-pointer"
                        } ${
                          isSelected
                            ? "border-black bg-gray-50 shadow-sm"
                            : isAdmin
                            ? "border-gray-200 bg-white opacity-55"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? "border-black bg-black text-white"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-bold text-xs text-gray-900">
                                {opt.title}: {opt.description}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold border border-gray-300 bg-gray-100 text-gray-800">
                                {opt.badge}
                              </span>
                            </div>
                            <ul className="mt-2 space-y-1">
                              {opt.requirements.map((req, rIdx) => (
                                <li
                                  key={rIdx}
                                  className="text-[11px] text-gray-600 flex items-center gap-1.5"
                                >
                                  <span>•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card: Stakeholders Covered */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    2. Stakeholders Included in Feedback ({selectedStakeholders.length} of 5 Active)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Curriculum feedback gathered from multiple stakeholder groups.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STAKEHOLDERS_OPTIONS.map((stk) => {
                    const active = selectedStakeholders.includes(stk.id);
                    return (
                      <div
                        key={stk.id}
                        onClick={() => !isReadOnly && toggleStakeholder(stk.id)}
                        className={`border rounded-lg p-3 transition-all ${
                          isReadOnly ? "cursor-default" : "cursor-pointer"
                        } ${
                          active
                            ? "border-black bg-gray-50"
                            : isAdmin
                            ? "border-gray-200 bg-gray-50 opacity-60"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">{stk.label}</span>
                          <input
                            type="checkbox"
                            checked={active}
                            disabled={isReadOnly}
                            onChange={() => {}}
                            className="rounded text-black focus:ring-black h-3.5 w-3.5"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{stk.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card: Institutional Website Link */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    3. Institutional Website URL (Public Hosting)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Direct live hyperlink where stakeholder feedback forms, analysis reports,
                    and Action Taken Reports (ATR) are publicly hosted.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={websiteUrl}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setIsSaved(false);
                    }}
                    placeholder={
                      isAdmin ? "No website link provided by department" : "https://university.ac.in/iqac/feedback-system"
                    }
                    className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black ${
                      isReadOnly ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {websiteUrl.trim() && (
                    <a
                      href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg border border-gray-300 whitespace-nowrap"
                    >
                      Open Live Link ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Card: Narrative / Remarks (Word Limit: 500 words) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      4. Qualitative Description / Feedback Mechanism Summary
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Summary of the process followed for curriculum feedback collection, analysis,
                      and discussions in Board of Studies (BOS).
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                      wordsCount > maxWords
                        ? "bg-gray-900 text-white border-black"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    {wordsCount} / {maxWords} words
                  </span>
                </div>

                <textarea
                  rows={6}
                  disabled={isReadOnly}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsSaved(false);
                  }}
                  placeholder={
                    isAdmin
                      ? "No narrative description submitted by the department."
                      : "Describe the feedback collection schedule, modalities (online/offline), analysis methodology, discussions in Board of Studies (BOS), and curricular reforms adopted..."
                  }
                  className={`w-full border border-gray-300 rounded-lg p-3 text-xs text-gray-900 outline-none focus:border-black leading-relaxed ${
                    isReadOnly ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Right Column: Documents & Actions (1 col) */}
            <div className="space-y-6">
              {/* Document Display / Upload Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                    NAAC Proofs & Documents
                  </h3>
                  <span className="text-[11px] text-gray-500">PDF Format</span>
                </div>

                {/* Doc 1: Action Taken Report (ATR) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      1. Action Taken Report (ATR) *
                    </span>
                    {actionTakenDoc && (
                      <span className="text-[11px] text-gray-700 font-semibold">[Attached]</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Action taken on curriculum feedback approved by BOS / Academic Council.
                  </p>

                  {!isAdmin && (!isSubmitted || isEditing) && (
                    <input
                      ref={atrInputRef}
                      type="file"
                      accept=".pdf,.xlsx,.csv"
                      onChange={(e) => handleFileUpload("atr", e)}
                      className="hidden"
                    />
                  )}

                  {actionTakenDoc ? (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                      <div className="truncate max-w-[180px]">
                        <p className="font-semibold text-gray-900 truncate">{actionTakenDoc.name}</p>
                        <p className="text-gray-500 text-[11px]">{actionTakenDoc.size}</p>
                      </div>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => setActionTakenDoc(null)}
                          className="text-gray-700 hover:text-black font-semibold text-xs px-1"
                        >
                          [Remove]
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded">
                          Uploaded Doc
                        </span>
                      )}
                    </div>
                  ) : (
                    isAdmin ? (
                      <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50 italic text-center">
                        No Action Taken Report uploaded.
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => atrInputRef.current?.click()}
                        className="w-full border border-gray-300 hover:border-black rounded-lg p-2 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 text-center"
                      >
                        Upload Action Taken Report (PDF)
                      </button>
                    )
                  )}
                </div>

                {/* Doc 2: Feedback Analysis Report */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      2. Stakeholder Analysis Report *
                    </span>
                    {analysisDoc && (
                      <span className="text-[11px] text-gray-700 font-semibold">[Attached]</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Statistical feedback analysis with graphs, ratings, and percentage distribution.
                  </p>

                  {!isAdmin && (!isSubmitted || isEditing) && (
                    <input
                      ref={analysisInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("analysis", e)}
                      className="hidden"
                    />
                  )}

                  {analysisDoc ? (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                      <div className="truncate max-w-[180px]">
                        <p className="font-semibold text-gray-900 truncate">{analysisDoc.name}</p>
                        <p className="text-gray-500 text-[11px]">{analysisDoc.size}</p>
                      </div>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => setAnalysisDoc(null)}
                          className="text-gray-700 hover:text-black font-semibold text-xs px-1"
                        >
                          [Remove]
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded">
                          Uploaded Doc
                        </span>
                      )}
                    </div>
                  ) : (
                    isAdmin ? (
                      <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50 italic text-center">
                        No Analysis Report uploaded.
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => analysisInputRef.current?.click()}
                        className="w-full border border-gray-300 hover:border-black rounded-lg p-2 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 text-center"
                      >
                        Upload Analysis Report (PDF)
                      </button>
                    )
                  )}
                </div>

                {/* Doc 3: Meeting Minutes */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      3. Minutes of BOS / Academic Council
                    </span>
                    {minutesDoc && (
                      <span className="text-[11px] text-gray-700 font-semibold">[Attached]</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Official minutes communicating stakeholder feedback to the curriculum revision committee.
                  </p>

                  {!isAdmin && (!isSubmitted || isEditing) && (
                    <input
                      ref={minutesInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("minutes", e)}
                      className="hidden"
                    />
                  )}

                  {minutesDoc ? (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                      <div className="truncate max-w-[180px]">
                        <p className="font-semibold text-gray-900 truncate">{minutesDoc.name}</p>
                        <p className="text-gray-500 text-[11px]">{minutesDoc.size}</p>
                      </div>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => setMinutesDoc(null)}
                          className="text-gray-700 hover:text-black font-semibold text-xs px-1"
                        >
                          [Remove]
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded">
                          Uploaded Doc
                        </span>
                      )}
                    </div>
                  ) : (
                    isAdmin ? (
                      <div className="p-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50 italic text-center">
                        No Meeting Minutes uploaded.
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => minutesInputRef.current?.click()}
                        className="w-full border border-gray-300 hover:border-black rounded-lg p-2 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 text-center"
                      >
                        Upload Meeting Minutes (PDF)
                      </button>
                    )
                  )}
                </div>

                {/* Additional Files / Sample Forms */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">
                      4. Sample Feedback Forms ({additionalFiles.length})
                    </span>
                  </div>

                  {!isAdmin && (!isSubmitted || isEditing) && (
                    <>
                      <input
                        ref={addInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleAddAdditionalFiles}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => addInputRef.current?.click()}
                        className="w-full border border-gray-300 hover:border-black rounded-lg p-2 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 text-center"
                      >
                        + Add Sample Forms / Files
                      </button>
                    </>
                  )}

                  {additionalFiles.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                      {additionalFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 rounded text-xs border border-gray-200"
                        >
                          <span className="truncate max-w-[170px] text-gray-800">{file.name}</span>
                          {!isReadOnly ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalFile(file.id)}
                              className="text-gray-700 hover:text-black font-semibold text-xs px-1"
                            >
                              [Remove]
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500">{file.size}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    isAdmin && (
                      <p className="text-xs text-gray-400 italic">No sample feedback forms attached.</p>
                    )
                  )}
                </div>
              </div>

              {/* Submission / Status Action Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Submission Status
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded font-bold ${
                      isSubmitted
                        ? "bg-gray-900 text-white"
                        : isSaved
                        ? "bg-gray-200 text-gray-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isSubmitted
                      ? "Submitted to IQAC"
                      : isSaved
                      ? "Saved Draft"
                      : "Not Started"}
                  </span>
                </div>

                {updatedAt && (
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(updatedAt).toLocaleString()}
                  </p>
                )}

                {/* ADMIN VIEW MODE NOTICE */}
                {isAdmin ? (
                  <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg space-y-1">
                    <p className="text-xs font-bold text-gray-900">
                      Admin Mode (Read Only)
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      You are observing the data submitted by this department. Data input and edits can only be made by the respective Department account.
                    </p>
                  </div>
                ) : (
                  /* DEPARTMENT ACTION BUTTONS */
                  <div className="space-y-2 pt-2">
                    {isSubmitted && !isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-xs rounded-md transition-colors border border-gray-400 shadow-sm"
                      >
                        ✎ Edit Submission
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSave(false)}
                          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-medium text-xs rounded-md border border-gray-300 shadow-sm transition"
                        >
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(true)}
                          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium text-xs rounded-md shadow-sm transition"
                        >
                          Submit to IQAC
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              loadCriterionData();
                            }}
                            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Criterion1_4;
