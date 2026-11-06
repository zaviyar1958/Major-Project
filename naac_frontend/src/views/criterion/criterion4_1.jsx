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
  "2020-21",
];

// Helper: Dynamically generate the 5 preceding assessment years based on chosen academic year
// E.g. "2024-25" -> ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"]
// E.g. "2022-23" -> ["2022-23", "2021-22", "2020-21", "2019-20", "2018-19"]
const getFiveYearsForAcademicYear = (selectedYear) => {
  if (!selectedYear) return ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];
  const parts = String(selectedYear).split("-");
  const startYear = parseInt(parts[0], 10);
  if (isNaN(startYear)) return ["2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

  const years = [];
  for (let i = 0; i < 5; i++) {
    const y1 = startYear - i;
    const y2 = (y1 + 1).toString().slice(-2);
    years.push(`${y1}-${y2}`);
  }
  return years;
};

const generateInitialFinancialData = (selectedYear) => {
  const years = getFiveYearsForAcademicYear(selectedYear);
  return years.map((yr) => ({
    year: yr,
    infraExp: "",
    totalExp: "",
  }));
};

const mergeFinancialDataForYear = (existingData, selectedYear) => {
  const targetYears = getFiveYearsForAcademicYear(selectedYear);
  if (!Array.isArray(existingData) || existingData.length === 0) {
    return targetYears.map((yr) => ({ year: yr, infraExp: "", totalExp: "" }));
  }
  return targetYears.map((yr) => {
    const found = existingData.find((d) => d && d.year === yr);
    return {
      year: yr,
      infraExp: found ? found.infraExp || "" : "",
      totalExp: found ? found.totalExp || "" : "",
    };
  });
};

const INFRA_PILLARS = [
  {
    letter: "a",
    title: "Teaching - Learning Facilities",
    desc: "Adequate classrooms, specialized laboratories, computing centers, seminar halls as per statutory bodies (UGC/AICTE).",
  },
  {
    letter: "b",
    title: "ICT Enabled Facilities",
    desc: "Smart classrooms, digital podiums, projectors, campus-wide Wi-Fi, LMS platforms, and recording studios.",
  },
  {
    letter: "c",
    title: "Cultural, Sports & Wellness",
    desc: "Auditoriums, open-air theatres, indoor/outdoor sports grounds, gymnasium, yoga and wellness centre.",
  },
];

const Criterion4_1 = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Role detection
  const isAdmin = user?.role === "admin";
  const userDeptName = user?.department?.name || user?.username || "Department";

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [activeTab, setActiveTab] = useState("4.1.1"); // "4.1.1" or "4.1.2"
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [allSubmissionsList, setAllSubmissionsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Storage keys for draft persistence (only for department users)
  const deptIdKey = user?.departmentId || user?.username || "default";
  const storageKey411 = `naac_411_${deptIdKey}_${academicYear}`;
  const storageKey412 = `naac_412_${deptIdKey}_${academicYear}`;

  // =========================================================================
  // METRIC 4.1.1 (QlM) STATE - Weightage: 20
  // =========================================================================
  const [description411, setDescription411] = useState("");
  const [webLink411, setWebLink411] = useState("");
  const [supportingDoc411, setSupportingDoc411] = useState(null);
  const [additionalFiles411, setAdditionalFiles411] = useState([]);
  const [isSaved411, setIsSaved411] = useState(false);
  const [isSubmitted411, setIsSubmitted411] = useState(false);
  const [isEditing411, setIsEditing411] = useState(false);
  const [updatedAt411, setUpdatedAt411] = useState(null);

  const suppInputRef411 = useRef(null);
  const addInputRef411 = useRef(null);

  // Word count helper (Max 500 words)
  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const wordsCount411 = countWords(description411);
  const maxWords411 = 500;

  // =========================================================================
  // METRIC 4.1.2 (QnM) STATE - Weightage: 10
  // =========================================================================
  const [financialData412, setFinancialData412] = useState(() =>
    generateInitialFinancialData(academicYear)
  );
  const [auditedStatementDoc412, setAuditedStatementDoc412] = useState(null);
  const [dataTemplateDoc412, setDataTemplateDoc412] = useState(null);
  const [additionalFiles412, setAdditionalFiles412] = useState([]);
  const [webLink412, setWebLink412] = useState("");
  const [isSaved412, setIsSaved412] = useState(false);
  const [isSubmitted412, setIsSubmitted412] = useState(false);
  const [isEditing412, setIsEditing412] = useState(false);
  const [updatedAt412, setUpdatedAt412] = useState(null);

  const auditedInputRef412 = useRef(null);
  const templateInputRef412 = useRef(null);
  const addInputRef412 = useRef(null);

  // Financial calculations for 4.1.2
  const { totalInfraExp, totalInstitutionalExp, overallPercentage, yearlyStats } =
    useMemo(() => {
      let sumInfra = 0;
      let sumInst = 0;

      const stats = financialData412.map((row) => {
        const infra = parseFloat(row.infraExp) || 0;
        const inst = parseFloat(row.totalExp) || 0;
        sumInfra += infra;
        sumInst += inst;
        const pct = inst > 0 ? ((infra / inst) * 100).toFixed(2) : "0.00";
        return { ...row, infra, inst, pct };
      });

      const overallPct =
        sumInst > 0 ? ((sumInfra / sumInst) * 100).toFixed(2) : "0.00";

      return {
        totalInfraExp: sumInfra.toFixed(2),
        totalInstitutionalExp: sumInst.toFixed(2),
        overallPercentage: overallPct,
        yearlyStats: stats,
      };
    }, [financialData412]);

  // Read-Only flags
  const isReadOnly411 = isAdmin || (isSubmitted411 && !isEditing411);
  const isReadOnly412 = isAdmin || (isSubmitted412 && !isEditing412);

  // Reset 4.1.1
  const resetForm411 = () => {
    setDescription411("");
    setWebLink411("");
    setSupportingDoc411(null);
    setAdditionalFiles411([]);
    setIsSaved411(false);
    setIsSubmitted411(false);
    setIsEditing411(false);
    setUpdatedAt411(null);
  };

  // Reset 4.1.2
  const resetForm412 = (targetYear = academicYear) => {
    setFinancialData412(generateInitialFinancialData(targetYear));
    setAuditedStatementDoc412(null);
    setDataTemplateDoc412(null);
    setAdditionalFiles412([]);
    setWebLink412("");
    setIsSaved412(false);
    setIsSubmitted412(false);
    setIsEditing412(false);
    setUpdatedAt412(null);
  };

  // Load All Submissions from Backend
  const loadCriterionData = async () => {
    setIsLoadingData(true);
    try {
      const res = await CriterionService.getSubmissions({
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
          // --- Process 4.1.1 ---
          const sub411 = data.find(
            (s) =>
              s.departmentId === currentTargetDeptId &&
              s.criterionCode === "4.1.1" &&
              s.academicYear === academicYear
          );

          if (sub411 && sub411.isSubmitted) {
            setDescription411(sub411.description || "");
            setIsSaved411(true);
            setIsSubmitted411(true);
            setIsEditing411(false);
            setUpdatedAt411(sub411.updatedAt);
            if (sub411.supportingDoc) {
              setSupportingDoc411(sub411.supportingDoc.doc || sub411.supportingDoc);
              setWebLink411(sub411.supportingDoc.webLink || "");
            } else {
              setSupportingDoc411(null);
              setWebLink411("");
            }
            setAdditionalFiles411(sub411.additionalFiles || []);
          } else if (sub411 && !sub411.isSubmitted) {
            setIsSaved411(true);
            setIsSubmitted411(false);
            setIsEditing411(false);
            setUpdatedAt411(sub411.updatedAt);

            if (!isAdmin) {
              setDescription411(sub411.description || "");
              if (sub411.supportingDoc) {
                setSupportingDoc411(sub411.supportingDoc.doc || sub411.supportingDoc);
                setWebLink411(sub411.supportingDoc.webLink || "");
              }
              setAdditionalFiles411(sub411.additionalFiles || []);
            } else {
              resetForm411();
              setIsSaved411(true);
              setUpdatedAt411(sub411.updatedAt);
            }
          } else {
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey411);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setDescription411(parsed.description || "");
                setWebLink411(parsed.webLink || "");
                setSupportingDoc411(parsed.supportingDoc || null);
                setAdditionalFiles411(parsed.additionalFiles || []);
                setIsSaved411(true);
                setIsSubmitted411(false);
                setUpdatedAt411(parsed.updatedAt || null);
              } else {
                resetForm411();
              }
            } else {
              resetForm411();
            }
          }

          // --- Process 4.1.2 ---
          const sub412 = data.find(
            (s) =>
              s.departmentId === currentTargetDeptId &&
              s.criterionCode === "4.1.2" &&
              s.academicYear === academicYear
          );

          if (sub412 && sub412.isSubmitted) {
            setIsSaved412(true);
            setIsSubmitted412(true);
            setIsEditing412(false);
            setUpdatedAt412(sub412.updatedAt);

            if (sub412.supportingDoc) {
              const doc = sub412.supportingDoc;
              setFinancialData412(mergeFinancialDataForYear(doc.financialData, academicYear));
              setAuditedStatementDoc412(doc.auditedStatementDoc || null);
              setDataTemplateDoc412(doc.dataTemplateDoc || null);
              setWebLink412(doc.webLink || "");
            } else {
              setFinancialData412(generateInitialFinancialData(academicYear));
            }
            setAdditionalFiles412(sub412.additionalFiles || []);
          } else if (sub412 && !sub412.isSubmitted) {
            setIsSaved412(true);
            setIsSubmitted412(false);
            setIsEditing412(false);
            setUpdatedAt412(sub412.updatedAt);

            if (!isAdmin) {
              if (sub412.supportingDoc) {
                const doc = sub412.supportingDoc;
                setFinancialData412(mergeFinancialDataForYear(doc.financialData, academicYear));
                setAuditedStatementDoc412(doc.auditedStatementDoc || null);
                setDataTemplateDoc412(doc.dataTemplateDoc || null);
                setWebLink412(doc.webLink || "");
              } else {
                setFinancialData412(generateInitialFinancialData(academicYear));
              }
              setAdditionalFiles412(sub412.additionalFiles || []);
            } else {
              resetForm412(academicYear);
              setIsSaved412(true);
              setUpdatedAt412(sub412.updatedAt);
            }
          } else {
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey412);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setFinancialData412(mergeFinancialDataForYear(parsed.financialData, academicYear));
                setAuditedStatementDoc412(parsed.auditedStatementDoc || null);
                setDataTemplateDoc412(parsed.dataTemplateDoc || null);
                setAdditionalFiles412(parsed.additionalFiles || []);
                setWebLink412(parsed.webLink || "");
                setIsSaved412(true);
                setIsSubmitted412(false);
                setUpdatedAt412(parsed.updatedAt || null);
              } else {
                resetForm412(academicYear);
              }
            } else {
              resetForm412(academicYear);
            }
          }
        } else if (isAdmin && selectedDeptId === "all") {
          resetForm411();
          resetForm412(academicYear);
        }
      }
    } catch (err) {
      console.error("Failed to load criterion 4.1 data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadCriterionData();
  }, [isAdmin, selectedDeptId, academicYear, user?.departmentId]);

  // =========================================================================
  // HANDLERS FOR 4.1.1
  // =========================================================================
  const handleSave411 = async (isFinalSubmit = false) => {
    if (isAdmin) return;
    if (wordsCount411 > maxWords411) {
      toast.error(`Word limit exceeded! Max: ${maxWords411} words.`);
      return;
    }
    if (isFinalSubmit && !description411.trim()) {
      toast.error("Please enter qualitative narrative before submitting.");
      return;
    }

    const draftData = {
      description: description411,
      webLink: webLink411.trim(),
      supportingDoc: supportingDoc411,
      additionalFiles: additionalFiles411,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey411, JSON.stringify(draftData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved411(true);
        toast.success(isFinalSubmit ? "4.1.1 submitted (Offline)" : "4.1.1 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "4.1.1",
        academicYear,
        description: description411,
        supportingDoc: { doc: supportingDoc411, webLink: webLink411.trim() },
        additionalFiles: additionalFiles411,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved411(true);
      setIsSubmitted411(isFinalSubmit);
      if (isFinalSubmit) setIsEditing411(false);
      setUpdatedAt411(new Date().toISOString());
      toast.success(isFinalSubmit ? "4.1.1 submitted to IQAC!" : "4.1.1 draft saved!");
      loadCriterionData();
    } catch (error) {
      toast.error("Failed to sync 4.1.1. Local draft preserved.");
    }
  };

  // =========================================================================
  // HANDLERS FOR 4.1.2
  // =========================================================================
  const handleFinancialCellChange = (index, field, value) => {
    if (isReadOnly412) return;
    setFinancialData412((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setIsSaved412(false);
  };

  const handleSave412 = async (isFinalSubmit = false) => {
    if (isAdmin) return;

    const supportingDocPayload = {
      financialData: financialData412,
      totalInfraExp,
      totalInstitutionalExp,
      overallPercentage,
      auditedStatementDoc: auditedStatementDoc412,
      dataTemplateDoc: dataTemplateDoc412,
      webLink: webLink412.trim(),
    };

    const draftData = {
      ...supportingDocPayload,
      additionalFiles: additionalFiles412,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey412, JSON.stringify(draftData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved412(true);
        toast.success(isFinalSubmit ? "4.1.2 submitted (Offline)" : "4.1.2 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "4.1.2",
        academicYear,
        description: `Percentage of expenditure for infrastructure augmentation: ${overallPercentage}%`,
        supportingDoc: supportingDocPayload,
        additionalFiles: additionalFiles412,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved412(true);
      setIsSubmitted412(isFinalSubmit);
      if (isFinalSubmit) setIsEditing412(false);
      setUpdatedAt412(new Date().toISOString());
      toast.success(isFinalSubmit ? "4.1.2 submitted to IQAC!" : "4.1.2 draft saved!");
      loadCriterionData();
    } catch (error) {
      toast.error("Failed to sync 4.1.2. Local draft preserved.");
    }
  };

  const selectedDepartmentObj = useMemo(() => {
    return departmentStatuses.find((d) => d.departmentId === parseInt(selectedDeptId));
  }, [departmentStatuses, selectedDeptId]);

  const adminSummary = useMemo(() => {
    const totalDepts = departmentStatuses.length;
    let submitted411 = 0;
    let submitted412 = 0;

    departmentStatuses.forEach((d) => {
      if (d.sub411?.status === "SUBMITTED") submitted411++;
      if (d.sub412?.status === "SUBMITTED") submitted412++;
    });

    return { totalDepts, submitted411, submitted412 };
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
              Key Indicator 4.1
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200">
              Physical Facilities (Total Weightage: 30 Marks)
            </span>
            {isAdmin && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-800 rounded border border-gray-300">
                Admin Observer Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Physical Facilities & Infrastructure Expenditure
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-4xl leading-relaxed">
            {isAdmin
              ? "Review qualitative adequacy of teaching-learning & sports facilities (4.1.1) and audited financial expenditure for infrastructure augmentation (4.1.2)."
              : "Submit qualitative report on infrastructure adequacy (4.1.1) and audited year-wise financial expenditure for infrastructure augmentation (4.1.2)."}
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

      {/* 3. SECTION SWITCHER TABS (Pure Black & White) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("4.1.1")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "4.1.1"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          4.1.1 Physical Facilities (QlM • 20 Marks)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("4.1.2")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "4.1.2"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          4.1.2 Infra Augmentation Expenditure (QnM • 10 Marks)
        </button>
      </div>

      {/* 4. ADMIN CONSOLIDATED OVERVIEW SECTION */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Departments</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.totalDepts}</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Submitted (4.1.1 Facilities)</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.submitted411}</p>
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Submitted (4.1.2 Expenditure)</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{adminSummary.submitted412}</p>
            </div>
          </div>

          {/* Department Filter for Admin */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Department Submission Filter</h2>
              <p className="text-xs text-gray-500">
                Select a department to view its filled data for 4.1.1 and 4.1.2 in Read-Only mode.
              </p>
            </div>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white font-semibold text-gray-900 outline-none focus:border-black min-w-[260px]"
            >
              <option value="all">-- All Departments Overview --</option>
              {departmentStatuses.map((dept) => {
                const s411 = dept.sub411?.status === "SUBMITTED" ? "4.1.1 ✓" : "4.1.1 ✕";
                const s412 = dept.sub412?.status === "SUBMITTED" ? "4.1.2 ✓" : "4.1.2 ✕";
                return (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName} ({s411} | {s412})
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
                  Key Indicator 4.1 Institutional Submissions Matrix
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
                      <th className="py-2.5 px-3 text-center">4.1.1 Status (20M)</th>
                      <th className="py-2.5 px-3 text-center">4.1.2 Status (10M)</th>
                      <th className="py-2.5 px-3 text-center">4.1.2 Claimed %</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {departmentStatuses.map((dept, index) => {
                      const s411 = dept.sub411?.status;
                      const s412 = dept.sub412?.status;

                      const sub412Obj = allSubmissionsList.find(
                        (s) => s.departmentId === dept.departmentId && s.criterionCode === "4.1.2"
                      );
                      const claimedPct = sub412Obj?.supportingDoc?.overallPercentage;

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
                            {s411 === "SUBMITTED" ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s411 === "DRAFT" || dept.sub411?.hasContent ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px] font-medium">
                                In Draft
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Not Started</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {s412 === "SUBMITTED" ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                                Submitted
                              </span>
                            ) : s412 === "DRAFT" || dept.sub412?.hasContent ? (
                              <span className="inline-block px-2.5 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px] font-medium">
                                In Draft
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Not Started</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                            {s412 === "SUBMITTED" && claimedPct !== undefined ? `${claimedPct}%` : "-"}
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

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs text-gray-500">
                Click "View Submission →" in the table above to inspect individual department submissions in Read-Only mode.
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

      {/* =========================================================================
          TAB 4.1.1 : PHYSICAL FACILITIES (QlM - 20 MARKS)
      ========================================================================= */}
      {activeTab === "4.1.1" && (
        <>
          {/* CASE A: Admin selected unsubmitted department */}
          {isAdmin && selectedDeptId !== "all" && !isSubmitted411 && (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm space-y-4 max-w-3xl mx-auto my-6">
              <div className="space-y-1.5">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold rounded">
                  Not Submitted
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDepartmentObj?.departmentName || "Selected Department"} Has Not Submitted 4.1.1 Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  This department has not yet submitted Metric 4.1.1 (Physical Facilities) report to IQAC for the Academic Year {academicYear}.
                </p>
              </div>
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

          {/* CASE B: Department user OR Admin viewing submitted */}
          {(!isAdmin || (isAdmin && selectedDeptId !== "all" && isSubmitted411)) && (
            <div className="space-y-6">
              {isAdmin && isSubmitted411 && (
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Official 4.1.1 Department Submission Verified
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Submitted on {updatedAt411 ? new Date(updatedAt411).toLocaleString() : academicYear} • Word Count: {wordsCount411} / 500 words
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded shadow-sm text-center">
                    Weightage: 20 Marks
                  </span>
                </div>
              )}

              {/* Infrastructure Guidance Pills */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Statutory Facilities Evaluated Under Metric 4.1.1 (QlM)
                  </h3>
                  <span className="text-xs text-gray-500 font-semibold">Maximum 500 Words</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {INFRA_PILLARS.map((p) => (
                    <div
                      key={p.letter}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-1"
                    >
                      <span className="font-bold text-xs text-gray-900">
                        ({p.letter}) {p.title}
                      </span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Form 4.1.1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          Qualitative Narrative (Adequacy of Physical Facilities)
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Describe the adequacy of facilities for teaching-learning as per minimum
                          specified requirement within 500 words.
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                          wordsCount411 > maxWords411
                            ? "bg-gray-900 text-white border-black"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {wordsCount411} / {maxWords411} words
                      </span>
                    </div>

                    <textarea
                      rows={10}
                      disabled={isReadOnly411}
                      value={description411}
                      onChange={(e) => {
                        setDescription411(e.target.value);
                        setIsSaved411(false);
                      }}
                      placeholder="Describe physical infrastructure: classrooms, laboratories, ICT facilities, sports amenities, and statutory compliance..."
                      className={`w-full border border-gray-300 rounded-lg p-3.5 text-xs text-gray-900 outline-none focus:border-black leading-relaxed ${
                        isReadOnly411 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                      }`}
                    />
                  </div>

                  {/* Web Link */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold text-gray-900">Web Link for Additional Information</h2>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webLink411}
                        disabled={isReadOnly411}
                        onChange={(e) => {
                          setWebLink411(e.target.value);
                          setIsSaved411(false);
                        }}
                        placeholder="https://university.ac.in/infrastructure"
                        className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black ${
                          isReadOnly411 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                      {webLink411.trim() && (
                        <a
                          href={webLink411.startsWith("http") ? webLink411 : `https://${webLink411}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg border border-gray-300 whitespace-nowrap"
                        >
                          Open Live Link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Uploads & Actions */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-2">
                      Supporting Documentation
                    </h3>

                    {/* Primary Supporting Doc */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-800">Primary Supporting Document</span>
                      {!isAdmin && (!isSubmitted411 || isEditing411) && (
                        <input
                          ref={suppInputRef411}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSupportingDoc411({
                              name: file.name,
                              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                            });
                            setIsSaved411(false);
                            toast.success(`Attached: ${file.name}`);
                          }}
                          className="hidden"
                        />
                      )}

                      {supportingDoc411 ? (
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                          <span className="truncate max-w-[180px] font-semibold text-gray-900">
                            {supportingDoc411.name}
                          </span>
                          {!isReadOnly411 ? (
                            <button
                              type="button"
                              onClick={() => setSupportingDoc411(null)}
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
                      ) : !isAdmin ? (
                        <button
                          type="button"
                          disabled={isReadOnly411}
                          onClick={() => suppInputRef411.current?.click()}
                          className="w-full border border-gray-300 hover:border-black rounded-lg p-2.5 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 transition text-center"
                        >
                          Upload Supporting Document (PDF)
                        </button>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No document uploaded.</p>
                      )}
                    </div>
                  </div>

                  {/* 4.1.1 Action Box */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        4.1.1 Status
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-bold ${
                          isSubmitted411
                            ? "bg-gray-900 text-white"
                            : isSaved411
                            ? "bg-gray-200 text-gray-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isSubmitted411 ? "Submitted to IQAC" : isSaved411 ? "Saved Draft" : "Not Started"}
                      </span>
                    </div>

                    {!isAdmin && (
                      <div className="space-y-2 pt-2">
                        {isSubmitted411 && !isEditing411 ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing411(true)}
                            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-xs rounded-md border border-gray-400 shadow-sm"
                          >
                            ✎ Edit Submission
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSave411(false)}
                              disabled={wordsCount411 > maxWords411}
                              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-medium text-xs rounded-md border border-gray-300 shadow-sm transition disabled:opacity-50"
                            >
                              Save as Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave411(true)}
                              disabled={wordsCount411 > maxWords411 || !description411.trim()}
                              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium text-xs rounded-md shadow-sm transition disabled:opacity-50"
                            >
                              Submit to IQAC
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 4.1.2 : INFRASTRUCTURE EXPENDITURE (QnM - 10 MARKS)
      ========================================================================= */}
      {activeTab === "4.1.2" && (
        <>
          {/* CASE A: Admin selected unsubmitted department */}
          {isAdmin && selectedDeptId !== "all" && !isSubmitted412 && (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm space-y-4 max-w-3xl mx-auto my-6">
              <div className="space-y-1.5">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold rounded">
                  Not Submitted
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDepartmentObj?.departmentName || "Selected Department"} Has Not Submitted 4.1.2 Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  This department has not yet submitted Metric 4.1.2 (Expenditure for Infrastructure Augmentation) to IQAC for the Academic Year {academicYear}.
                </p>
              </div>
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

          {/* CASE B: Department user OR Admin viewing submitted */}
          {(!isAdmin || (isAdmin && selectedDeptId !== "all" && isSubmitted412)) && (
            <div className="space-y-6">
              {isAdmin && isSubmitted412 && (
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Official 4.1.2 Department Submission Verified
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Submitted on {updatedAt412 ? new Date(updatedAt412).toLocaleString() : academicYear} • Overall Claimed Percentage: {overallPercentage}%
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded shadow-sm text-center">
                    Claimed: {overallPercentage}% (Weightage: 10 Marks)
                  </span>
                </div>
              )}

              {/* Formula & Explanatory Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-2">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  NAAC Formula for Metric 4.1.2 (QnM)
                </h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 leading-relaxed">
                  Percentage = [ Total Expenditure for Infrastructure Augmentation excluding salary (5 Years) / Total Institutional Expenditure excluding salary (5 Years) ] × 100
                </div>
              </div>

              {/* 5-Year Financial Data Table */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      4.1.2.1: Expenditure for Infrastructure Development and Augmentation (INR in Lakhs)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Enter the year-wise audited expenditure figures excluding salary.
                    </p>
                  </div>

                  {/* Real-time Percentage Indicator */}
                  <div className="text-right bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg">
                    <span className="text-[11px] font-medium text-gray-600 block">5-Year Claimed Percentage:</span>
                    <span className="text-base font-bold text-gray-900">{overallPercentage}%</span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Academic Year</th>
                        <th className="py-2.5 px-3">
                          Infra Augmentation Expenditure <br />
                          <span className="text-[10px] font-normal text-gray-500">(INR in Lakhs)</span>
                        </th>
                        <th className="py-2.5 px-3">
                          Total Expenditure Excluding Salary <br />
                          <span className="text-[10px] font-normal text-gray-500">(Metric 3.1 - INR in Lakhs)</span>
                        </th>
                        <th className="py-2.5 px-3 text-center">Calculated %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {financialData412.map((row, idx) => (
                        <tr key={row.year} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{row.year}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="any"
                              disabled={isReadOnly412}
                              value={row.infraExp}
                              onChange={(e) => handleFinancialCellChange(idx, "infraExp", e.target.value)}
                              placeholder="0.00"
                              className={`w-36 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 outline-none focus:border-black ${
                                isReadOnly412 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                              }`}
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="any"
                              disabled={isReadOnly412}
                              value={row.totalExp}
                              onChange={(e) => handleFinancialCellChange(idx, "totalExp", e.target.value)}
                              placeholder="0.00"
                              className={`w-36 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 outline-none focus:border-black ${
                                isReadOnly412 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                              }`}
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                            {yearlyStats[idx]?.pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t border-gray-300 text-gray-900">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 text-right">
                          Total (5 Years):
                        </td>
                        <td className="py-2.5 px-3">{totalInfraExp} Lakhs</td>
                        <td className="py-2.5 px-3">{totalInstitutionalExp} Lakhs</td>
                        <td className="py-2.5 px-3 text-center text-sm font-black">
                          {overallPercentage}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Documents & Submissions for 4.1.2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Web Link 4.1.2 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold text-gray-900">
                      Provide Links for Supporting Documents / Audit Reports
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webLink412}
                        disabled={isReadOnly412}
                        onChange={(e) => {
                          setWebLink412(e.target.value);
                          setIsSaved412(false);
                        }}
                        placeholder="https://university.ac.in/finance/audited-statements-infra"
                        className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-black ${
                          isReadOnly412 ? "bg-gray-50 text-gray-700 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                      {webLink412.trim() && (
                        <a
                          href={webLink412.startsWith("http") ? webLink412 : `https://${webLink412}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg border border-gray-300 whitespace-nowrap"
                        >
                          Open Live Link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Uploads & 4.1.2 Submit */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-2">
                      Mandatory Audited Proofs
                    </h3>

                    {/* CA Audited Statement */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-800">
                        1. Audited Statement Signed by CA & Authority *
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Income & expenditure statement with infrastructure augmentation clearly highlighted.
                      </p>

                      {!isAdmin && (!isSubmitted412 || isEditing412) && (
                        <input
                          ref={auditedInputRef412}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setAuditedStatementDoc412({
                              name: file.name,
                              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                            });
                            setIsSaved412(false);
                            toast.success(`CA Statement attached: ${file.name}`);
                          }}
                          className="hidden"
                        />
                      )}

                      {auditedStatementDoc412 ? (
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                          <span className="truncate max-w-[180px] font-semibold text-gray-900">
                            {auditedStatementDoc412.name}
                          </span>
                          {!isReadOnly412 ? (
                            <button
                              type="button"
                              onClick={() => setAuditedStatementDoc412(null)}
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
                      ) : !isAdmin ? (
                        <button
                          type="button"
                          disabled={isReadOnly412}
                          onClick={() => auditedInputRef412.current?.click()}
                          className="w-full border border-gray-300 hover:border-black rounded-lg p-2.5 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 transition text-center"
                        >
                          Upload CA Signed Audited Statement (PDF)
                        </button>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No audited statement uploaded.</p>
                      )}
                    </div>

                    {/* Data Template */}
                    <div className="space-y-1.5 pt-2 border-t">
                      <span className="text-xs font-bold text-gray-800">
                        2. Institutional Data Template *
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Prescribed institutional format Excel or PDF.
                      </p>

                      {!isAdmin && (!isSubmitted412 || isEditing412) && (
                        <input
                          ref={templateInputRef412}
                          type="file"
                          accept=".pdf,.xlsx,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setDataTemplateDoc412({
                              name: file.name,
                              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                            });
                            setIsSaved412(false);
                            toast.success(`Data Template attached: ${file.name}`);
                          }}
                          className="hidden"
                        />
                      )}

                      {dataTemplateDoc412 ? (
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                          <span className="truncate max-w-[180px] font-semibold text-gray-900">
                            {dataTemplateDoc412.name}
                          </span>
                          {!isReadOnly412 ? (
                            <button
                              type="button"
                              onClick={() => setDataTemplateDoc412(null)}
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
                      ) : !isAdmin ? (
                        <button
                          type="button"
                          disabled={isReadOnly412}
                          onClick={() => templateInputRef412.current?.click()}
                          className="w-full border border-gray-300 hover:border-black rounded-lg p-2.5 text-xs text-gray-800 font-medium bg-white hover:bg-gray-50 transition text-center"
                        >
                          Upload Data Template (PDF/Excel)
                        </button>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No data template uploaded.</p>
                      )}
                    </div>
                  </div>

                  {/* 4.1.2 Action Box */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        4.1.2 Status
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-bold ${
                          isSubmitted412
                            ? "bg-gray-900 text-white"
                            : isSaved412
                            ? "bg-gray-200 text-gray-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isSubmitted412 ? "Submitted to IQAC" : isSaved412 ? "Saved Draft" : "Not Started"}
                      </span>
                    </div>

                    {!isAdmin && (
                      <div className="space-y-2 pt-2">
                        {isSubmitted412 && !isEditing412 ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing412(true)}
                            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-xs rounded-md border border-gray-400 shadow-sm"
                          >
                            ✎ Edit Submission
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSave412(false)}
                              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-medium text-xs rounded-md border border-gray-300 shadow-sm transition"
                            >
                              Save as Draft
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSave412(true)}
                              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium text-xs rounded-md shadow-sm transition"
                            >
                              Submit to IQAC
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Criterion4_1;
