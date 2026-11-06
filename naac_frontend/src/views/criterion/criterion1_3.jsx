import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CriterionService from "@/service/criterionService";
import ProgramService from "@/service/programService";
import CourseService from "@/service/courseService";
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  Save,
  Send,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Compass,
  Award,
  BookOpen,
} from "lucide-react";

const ACADEMIC_YEARS = [
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
];

const Criterion1_3 = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Role detection
  const isAdmin = user?.role === "admin";
  const userDeptName = user?.department?.name || user?.username || "Department";

  const [academicYear, setAcademicYear] = useState("2024-25");
  const [selectedDeptId, setSelectedDeptId] = useState("all");
  const [departmentStatuses, setDepartmentStatuses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Active expanded accordion: "1.3.1", "1.3.2", "1.3.3", or null
  const [expandedSection, setExpandedSection] = useState("1.3.1");

  // Storage keys for draft persistence
  const deptIdKey = user?.departmentId || user?.username || "default";
  const storageKey131 = `naac_131_${deptIdKey}_${academicYear}`;
  const storageKey132 = `naac_132_${deptIdKey}_${academicYear}`;
  const storageKey133 = `naac_133_${deptIdKey}_${academicYear}`;

  // =========================================================================
  // METRIC 1.3.1 (QlM) STATE - Weightage: 15
  // =========================================================================
  const [desc131, setDesc131] = useState("");
  const [supportingDoc131, setSupportingDoc131] = useState(null);
  const [webLink131, setWebLink131] = useState("");
  const [additionalFiles131, setAdditionalFiles131] = useState([]);
  const [isSaved131, setIsSaved131] = useState(false);
  const [isSubmitted131, setIsSubmitted131] = useState(false);
  const [isEditing131, setIsEditing131] = useState(false);
  const [updatedAt131, setUpdatedAt131] = useState(null);

  const suppInputRef131 = useRef(null);
  const addInputRef131 = useRef(null);

  const countWords = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const words131 = countWords(desc131);
  const maxWords131 = 500;

  // =========================================================================
  // METRIC 1.3.2 (QnM) STATE - Weightage: 30
  // =========================================================================
  const [count132, setCount132] = useState(""); // 1.3.2.1 count
  const [autoCalculatedInfo132, setAutoCalculatedInfo132] = useState(null);
  const [qualifyingItems132, setQualifyingItems132] = useState([]);
  const [isAutoCalculating132, setIsAutoCalculating132] = useState(false);

  // 5 Documents for 1.3.2
  const [docTemplate132, setDocTemplate132] = useState(null); // Institutional data template
  const [docBrochure132, setDocBrochure132] = useState(null); // Programme brochure/notice with modules & outcomes
  const [docAttendance132, setDocAttendance132] = useState(null); // List of students & attendance sheet
  const [docCertificates132, setDocCertificates132] = useState(null); // Evidence of course completion certificates
  const [webLink132, setWebLink132] = useState(""); // Institutional website link / public disclosure
  const [additionalFiles132, setAdditionalFiles132] = useState([]);

  const [isSaved132, setIsSaved132] = useState(false);
  const [isSubmitted132, setIsSubmitted132] = useState(false);
  const [isEditing132, setIsEditing132] = useState(false);
  const [updatedAt132, setUpdatedAt132] = useState(null);

  const docTemplateRef132 = useRef(null);
  const docBrochureRef132 = useRef(null);
  const docAttendanceRef132 = useRef(null);
  const docCertificatesRef132 = useRef(null);
  const addFilesRef132 = useRef(null);

  // =========================================================================
  // METRIC 1.3.3 (QnM) STATE - Weightage: 5
  // =========================================================================
  const [programsWithProjectsCount, setProgramsWithProjectsCount] = useState("");
  const [totalProgramsCount, setTotalProgramsCount] = useState("");
  const [autoCalculatedInfo, setAutoCalculatedInfo] = useState(null);
  const [eligibleProgramsList, setEligibleProgramsList] = useState([]);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  const [docTemplate133, setDocTemplate133] = useState(null);
  const [webLink133, setWebLink133] = useState("");
  const [docBosSyllabus133, setDocBosSyllabus133] = useState(null);
  const [docInternshipLetters133, setDocInternshipLetters133] = useState(null);
  const [docEvaluatedReports133, setDocEvaluatedReports133] = useState(null);
  const [additionalFiles133, setAdditionalFiles133] = useState([]);

  const [isSaved133, setIsSaved133] = useState(false);
  const [isSubmitted133, setIsSubmitted133] = useState(false);
  const [isEditing133, setIsEditing133] = useState(false);
  const [updatedAt133, setUpdatedAt133] = useState(null);

  const docTemplateRef133 = useRef(null);
  const docBosSyllabusRef133 = useRef(null);
  const docInternshipLettersRef133 = useRef(null);
  const docEvaluatedReportsRef133 = useRef(null);
  const addFilesRef133 = useRef(null);

  const calculatedPercentage133 = useMemo(() => {
    const num = parseFloat(programsWithProjectsCount);
    const denom = parseFloat(totalProgramsCount);
    if (!isNaN(num) && !isNaN(denom) && denom > 0) {
      const pct = (num / denom) * 100;
      return pct.toFixed(2);
    }
    return "0.00";
  }, [programsWithProjectsCount, totalProgramsCount]);

  // =========================================================================
  // LOAD SUBMISSION DATA FROM BACKEND
  // =========================================================================
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
          // 1.3.1
          const sub131 = submissions.find(
            (s) =>
              s.criterionCode === "1.3.1" &&
              s.departmentId === parseInt(targetDeptId)
          );
          if (sub131) {
            setDesc131(sub131.description || "");
            setSupportingDoc131(sub131.supportingDoc || null);
            setWebLink131(sub131.supportingDoc?.webLink || "");
            setAdditionalFiles131(sub131.additionalFiles || []);
            setIsSaved131(true);
            setIsSubmitted131(sub131.isSubmitted);
            setIsEditing131(false);
            setUpdatedAt131(sub131.updatedAt);
          } else {
            setIsEditing131(false);
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey131);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setDesc131(parsed.description || "");
                setSupportingDoc131(parsed.supportingDoc || null);
                setWebLink131(parsed.webLink || "");
                setAdditionalFiles131(parsed.additionalFiles || []);
                setIsSaved131(true);
                setIsSubmitted131(false);
                setUpdatedAt131(parsed.updatedAt || null);
              } else {
                resetForm131();
              }
            } else {
              resetForm131();
            }
          }

          // 1.3.2
          const sub132 = submissions.find(
            (s) =>
              s.criterionCode === "1.3.2" &&
              s.departmentId === parseInt(targetDeptId)
          );
          if (sub132) {
            const data = sub132.supportingDoc || {};
            setCount132(data.count132 !== undefined ? String(data.count132) : "");
            setDocTemplate132(data.docTemplate || null);
            setDocBrochure132(data.docBrochure || null);
            setDocAttendance132(data.docAttendance || null);
            setDocCertificates132(data.docCertificates || null);
            setWebLink132(data.webLink || "");
            setAdditionalFiles132(sub132.additionalFiles || []);
            setIsSaved132(true);
            setIsSubmitted132(sub132.isSubmitted);
            setIsEditing132(false);
            setUpdatedAt132(sub132.updatedAt);
            if (data.autoCalculatedInfo132) {
              setAutoCalculatedInfo132(data.autoCalculatedInfo132);
              if (data.autoCalculatedInfo132.items) {
                setQualifyingItems132(data.autoCalculatedInfo132.items);
              }
            }
          } else {
            setIsEditing132(false);
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey132);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setCount132(
                  parsed.count132 !== undefined ? String(parsed.count132) : ""
                );
                setDocTemplate132(parsed.docTemplate || null);
                setDocBrochure132(parsed.docBrochure || null);
                setDocAttendance132(parsed.docAttendance || null);
                setDocCertificates132(parsed.docCertificates || null);
                setWebLink132(parsed.webLink || "");
                setAdditionalFiles132(parsed.additionalFiles || []);
                setIsSaved132(true);
                setIsSubmitted132(false);
                setUpdatedAt132(parsed.updatedAt || null);
                if (parsed.autoCalculatedInfo132) {
                  setAutoCalculatedInfo132(parsed.autoCalculatedInfo132);
                  if (parsed.autoCalculatedInfo132.items) {
                    setQualifyingItems132(parsed.autoCalculatedInfo132.items);
                  }
                }
              } else {
                resetForm132();
              }
            } else {
              resetForm132();
            }
          }

          // 1.3.3
          const sub133 = submissions.find(
            (s) =>
              s.criterionCode === "1.3.3" &&
              s.departmentId === parseInt(targetDeptId)
          );
          if (sub133) {
            const data = sub133.supportingDoc || {};
            setProgramsWithProjectsCount(
              data.programsWithProjectsCount !== undefined
                ? String(data.programsWithProjectsCount)
                : ""
            );
            setTotalProgramsCount(
              data.totalProgramsCount !== undefined
                ? String(data.totalProgramsCount)
                : ""
            );
            setDocTemplate133(data.docTemplate || null);
            setWebLink133(data.webLink || "");
            setDocBosSyllabus133(data.docBosSyllabus || null);
            setDocInternshipLetters133(data.docInternshipLetters || null);
            setDocEvaluatedReports133(data.docEvaluatedReports || null);
            setAdditionalFiles133(sub133.additionalFiles || []);
            setIsSaved133(true);
            setIsSubmitted133(sub133.isSubmitted);
            setIsEditing133(false);
            setUpdatedAt133(sub133.updatedAt);
            if (data.autoCalculatedInfo) {
              setAutoCalculatedInfo(data.autoCalculatedInfo);
              if (data.autoCalculatedInfo.eligiblePrograms) {
                setEligibleProgramsList(data.autoCalculatedInfo.eligiblePrograms);
              }
            }
          } else {
            setIsEditing133(false);
            if (!isAdmin) {
              const localSaved = localStorage.getItem(storageKey133);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                setProgramsWithProjectsCount(
                  parsed.programsWithProjectsCount !== undefined
                    ? String(parsed.programsWithProjectsCount)
                    : ""
                );
                setTotalProgramsCount(
                  parsed.totalProgramsCount !== undefined
                    ? String(parsed.totalProgramsCount)
                    : ""
                );
                setDocTemplate133(parsed.docTemplate || null);
                setWebLink133(parsed.webLink || "");
                setDocBosSyllabus133(parsed.docBosSyllabus || null);
                setDocInternshipLetters133(parsed.docInternshipLetters || null);
                setDocEvaluatedReports133(parsed.docEvaluatedReports || null);
                setAdditionalFiles133(parsed.additionalFiles || []);
                setIsSaved133(true);
                setIsSubmitted133(false);
                setUpdatedAt133(parsed.updatedAt || null);
                if (parsed.autoCalculatedInfo) {
                  setAutoCalculatedInfo(parsed.autoCalculatedInfo);
                  if (parsed.autoCalculatedInfo.eligiblePrograms) {
                    setEligibleProgramsList(
                      parsed.autoCalculatedInfo.eligiblePrograms
                    );
                  }
                }
              } else {
                resetForm133();
              }
            } else {
              resetForm133();
            }
          }
        } else if (isAdmin && selectedDeptId === "all") {
          handleConsolidatedAdminCalculation();
        }
      }
    } catch (err) {
      console.error("Failed to load criterion 1.3 submissions:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const resetForm131 = () => {
    setDesc131("");
    setSupportingDoc131(null);
    setWebLink131("");
    setAdditionalFiles131([]);
    setIsSaved131(false);
    setIsSubmitted131(false);
    setIsEditing131(false);
    setUpdatedAt131(null);
  };

  const resetForm132 = () => {
    setCount132("");
    setDocTemplate132(null);
    setDocBrochure132(null);
    setDocAttendance132(null);
    setDocCertificates132(null);
    setWebLink132("");
    setAdditionalFiles132([]);
    setIsSaved132(false);
    setIsSubmitted132(false);
    setIsEditing132(false);
    setUpdatedAt132(null);
    setAutoCalculatedInfo132(null);
    setQualifyingItems132([]);
  };

  const resetForm133 = () => {
    setProgramsWithProjectsCount("");
    setTotalProgramsCount("");
    setDocTemplate133(null);
    setWebLink133("");
    setDocBosSyllabus133(null);
    setDocInternshipLetters133(null);
    setDocEvaluatedReports133(null);
    setAdditionalFiles133([]);
    setIsSaved133(false);
    setIsSubmitted133(false);
    setIsEditing133(false);
    setUpdatedAt133(null);
    setAutoCalculatedInfo(null);
    setEligibleProgramsList([]);
  };

  useEffect(() => {
    loadCriterionData();
  }, [isAdmin, selectedDeptId, academicYear, user?.departmentId]);

  // Admin Consolidated Calculation for 1.3.2 & 1.3.3
  const handleConsolidatedAdminCalculation = async () => {
    try {
      const [progRes, courseRes] = await Promise.all([
        ProgramService.getAllPrograms({ academicYear }),
        CourseService.getAllCourses({ academicYear }),
      ]);

      if (progRes?.data?.success) {
        const programs = progRes.data.data || [];
        const eligible133 = programs.filter(
          (p) => p.hasFieldProject || p.hasResearchProject || p.hasInternship
        );
        setTotalProgramsCount(String(programs.length));
        setProgramsWithProjectsCount(String(eligible133.length));
        setEligibleProgramsList(eligible133);

        // 1.3.2 Consolidated
        const diplomaCert = programs.filter(
          (p) => p.level === "Diploma" || p.level === "Certificate"
        );
        const courses = courseRes?.data?.success ? courseRes.data.data : [];
        const vacMooc = courses.filter((c) => c.isValueAdded || c.isOnlineMOOC);

        const combined132 = [
          ...diplomaCert.map((p) => ({
            id: `prog-${p.id}`,
            code: p.code,
            name: p.name,
            type: p.level === "Diploma" ? "Diploma Programme" : "Certificate Programme",
            source: "Programme Management",
            badgeColor: "bg-blue-100 text-blue-800",
          })),
          ...vacMooc.map((c) => ({
            id: `course-${c.id}`,
            code: c.code,
            name: c.name,
            type: c.isValueAdded ? "Value-Added Course (VAC)" : "Online MOOC / SWAYAM / NPTEL",
            source: "Course Management",
            badgeColor: c.isValueAdded ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800",
          })),
        ];

        setCount132(String(combined132.length));
        setQualifyingItems132(combined132);
      }
    } catch (error) {
      console.error("Failed to aggregate institutional data:", error);
    }
  };

  // =========================================================================
  // AUTO-CALCULATION FOR 1.3.2 (Diploma/Certificate Progs + VAC/MOOC Courses)
  // =========================================================================
  const handleAutoCalculate132 = async () => {
    setIsAutoCalculating132(true);
    try {
      const deptId = user?.departmentId;
      const params = { academicYear };
      if (deptId) params.departmentId = deptId;

      // 1. Fetch Diploma & Certificate Programmes
      const progRes = await ProgramService.getAllPrograms(params);
      const programs = progRes?.data?.success ? progRes.data.data : [];
      const diplomaCertProgs = programs.filter(
        (p) => p.level === "Diploma" || p.level === "Certificate"
      );

      // 2. Fetch Value Added & Online MOOC Courses
      const courseRes = await CourseService.getAllCourses(params);
      const courses = courseRes?.data?.success ? courseRes.data.data : [];
      const vacMoocCourses = courses.filter(
        (c) => c.isValueAdded || c.isOnlineMOOC
      );

      // Unified qualifying list
      const combined = [
        ...diplomaCertProgs.map((p) => ({
          id: `prog-${p.id}`,
          code: p.code,
          name: p.name,
          type: p.level === "Diploma" ? "Diploma Programme" : "Certificate Programme",
          source: "Programme Management",
          badgeColor: "bg-blue-100 text-blue-800",
        })),
        ...vacMoocCourses.map((c) => ({
          id: `course-${c.id}`,
          code: c.code,
          name: c.name,
          type: c.isValueAdded ? "Value-Added Course (VAC)" : "Online MOOC / SWAYAM / NPTEL",
          source: "Course Management",
          badgeColor: c.isValueAdded ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800",
        })),
      ];

      setCount132(String(combined.length));
      setQualifyingItems132(combined);
      setAutoCalculatedInfo132({
        calculatedAt: new Date().toISOString(),
        diplomaCertCount: diplomaCertProgs.length,
        vacMoocCount: vacMoocCourses.length,
        totalCount: combined.length,
        items: combined,
      });

      setIsSaved132(false);
      toast.success(
        `Auto-calculated: ${combined.length} courses (${diplomaCertProgs.length} Diploma/Certificate, ${vacMoocCourses.length} VAC/MOOC)`
      );
    } catch (err) {
      toast.error("Failed to auto-calculate Metric 1.3.2 from database");
    } finally {
      setIsAutoCalculating132(false);
    }
  };

  // =========================================================================
  // AUTO-CALCULATION FOR 1.3.3
  // =========================================================================
  const handleAutoCalculateFromDB = async () => {
    setIsAutoCalculating(true);
    try {
      const deptId = user?.departmentId;
      const params = { academicYear };
      if (deptId) params.departmentId = deptId;

      const res = await ProgramService.getAllPrograms(params);
      if (res?.data?.success) {
        const programs = res.data.data || [];
        const eligible = programs.filter(
          (p) => p.hasFieldProject || p.hasResearchProject || p.hasInternship
        );
        const totalUnique = programs.length;

        setProgramsWithProjectsCount(String(eligible.length));
        setTotalProgramsCount(String(totalUnique));
        setEligibleProgramsList(eligible);

        setAutoCalculatedInfo({
          calculatedAt: new Date().toISOString(),
          scope: deptId ? userDeptName : "All Departments",
          eligibleCount: eligible.length,
          totalCount: totalUnique,
          eligiblePrograms: eligible.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            level: p.level,
            hasFieldProject: p.hasFieldProject,
            hasResearchProject: p.hasResearchProject,
            hasInternship: p.hasInternship,
          })),
        });

        setIsSaved133(false);
        toast.success(
          `Auto-calculated: ${eligible.length} eligible programmes out of ${totalUnique} total programmes!`
        );
      }
    } catch (error) {
      toast.error("Failed to auto-calculate from programmes database");
    } finally {
      setIsAutoCalculating(false);
    }
  };

  // File Upload Helper
  const handleFileUpload = (e, setter, label) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      toast.success(`${label} selected: ${file.name}`);
    }
  };

  const handleAddFiles = (e, setter, label, ref) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((f, idx) => ({
        id: Date.now() + idx,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setter((prev) => [...prev, ...newItems]);
      toast.success(`${files.length} supplementary file(s) added`);
    }
    if (ref.current) ref.current.value = "";
  };

  // =========================================================================
  // SAVE HANDLERS
  // =========================================================================
  // Save 1.3.1
  const handleSave131 = async (isFinalSubmit = false) => {
    const payloadData = {
      description: desc131,
      supportingDoc: supportingDoc131
        ? { ...supportingDoc131, webLink: webLink131 }
        : webLink131
        ? { webLink: webLink131 }
        : null,
      webLink: webLink131,
      additionalFiles: additionalFiles131,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey131, JSON.stringify(payloadData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved131(true);
        toast.success(isFinalSubmit ? "1.3.1 submitted" : "1.3.1 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.3.1",
        academicYear,
        description: desc131,
        supportingDoc: payloadData.supportingDoc,
        additionalFiles: additionalFiles131,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved131(true);
      setIsSubmitted131(isFinalSubmit);
      setIsEditing131(false);
      setUpdatedAt131(new Date().toISOString());
      toast.success(
        isFinalSubmit
          ? "Criterion 1.3.1 response submitted successfully!"
          : "1.3.1 draft saved successfully!"
      );
      loadCriterionData();
    } catch (err) {
      toast.error("Failed to save 1.3.1 submission");
    }
  };

  // Save 1.3.2
  const handleSave132 = async (isFinalSubmit = false) => {
    const payloadData = {
      count132: parseInt(count132) || 0,
      docTemplate: docTemplate132,
      docBrochure: docBrochure132,
      docAttendance: docAttendance132,
      docCertificates: docCertificates132,
      webLink: webLink132,
      autoCalculatedInfo132,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey132, JSON.stringify(payloadData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved132(true);
        toast.success(isFinalSubmit ? "1.3.2 submitted" : "1.3.2 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.3.2",
        academicYear,
        description: `Metric 1.3.2: ${count132} certificate, value-added, diploma, and MOOCs courses completed during last 5 years`,
        supportingDoc: payloadData,
        additionalFiles: additionalFiles132,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved132(true);
      setIsSubmitted132(isFinalSubmit);
      setIsEditing132(false);
      setUpdatedAt132(new Date().toISOString());
      toast.success(
        isFinalSubmit
          ? "Criterion 1.3.2 response submitted successfully!"
          : "1.3.2 draft saved successfully!"
      );
      loadCriterionData();
    } catch (err) {
      toast.error("Failed to save 1.3.2 submission");
    }
  };

  // Save 1.3.3
  const handleSave133 = async (isFinalSubmit = false) => {
    const payloadData = {
      programsWithProjectsCount: parseInt(programsWithProjectsCount) || 0,
      totalProgramsCount: parseInt(totalProgramsCount) || 0,
      percentage: parseFloat(calculatedPercentage133) || 0,
      docTemplate: docTemplate133,
      webLink: webLink133,
      docBosSyllabus: docBosSyllabus133,
      docInternshipLetters: docInternshipLetters133,
      docEvaluatedReports: docEvaluatedReports133,
      autoCalculatedInfo,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey133, JSON.stringify(payloadData));

    try {
      const deptId = user?.departmentId;
      if (!deptId) {
        setIsSaved133(true);
        toast.success(isFinalSubmit ? "1.3.3 submitted" : "1.3.3 draft saved");
        return;
      }

      await CriterionService.saveSubmission({
        departmentId: deptId,
        criterionCode: "1.3.3",
        academicYear,
        description: `Metric 1.3.3: ${programsWithProjectsCount} programmes with project/internship out of ${totalProgramsCount} total programmes (${calculatedPercentage133}%)`,
        supportingDoc: payloadData,
        additionalFiles: additionalFiles133,
        isSubmitted: isFinalSubmit,
      });

      setIsSaved133(true);
      setIsSubmitted133(isFinalSubmit);
      setIsEditing133(false);
      setUpdatedAt133(new Date().toISOString());
      toast.success(
        isFinalSubmit
          ? "Criterion 1.3.3 submitted successfully!"
          : "1.3.3 draft saved successfully!"
      );
      loadCriterionData();
    } catch (err) {
      toast.error("Failed to save 1.3.3 submission");
    }
  };

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
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded border border-indigo-200">
                Criterion 1.3
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                Total Weightage: 50
              </span>
              {isAdmin && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-white rounded">
                  Admin Observer Mode
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Curriculum Enrichment
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Cross-cutting issues (1.3.1 • 15), Value-added/MOOCs courses (1.3.2 • 30), and Projects/Internships (1.3.3 • 5).
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
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ADMIN EXCLUSIVE: Department Filter & Submission Status Matrix */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Department Submission Matrix • Criterion 1.3
                </h2>
                <p className="text-xs text-gray-500">
                  Monitor departmental submissions for 1.3.1 (QlM • 15), 1.3.2 (QnM • 30), and 1.3.3 (QnM • 5).
                </p>
              </div>

              {/* Department Dropdown Filter */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="deptFilter"
                  className="text-xs font-medium text-gray-700 whitespace-nowrap"
                >
                  Filter Department:
                </label>
                <select
                  id="deptFilter"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-2 min-w-[240px] focus:outline-none focus:border-gray-900"
                >
                  <option value="all">-- All Departments Overview --</option>
                  {departmentStatuses.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName} ({dept.departmentCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix Table for All Departments */}
            {selectedDeptId === "all" && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">School</th>
                      <th className="py-2.5 px-3 text-center">1.3.1 (QlM • 15)</th>
                      <th className="py-2.5 px-3 text-center">1.3.2 (QnM • 30)</th>
                      <th className="py-2.5 px-3 text-center">1.3.3 (QnM • 5)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {departmentStatuses.map((dept) => {
                      const s131 = dept.sub131?.status;
                      const s132 = dept.sub132?.status;
                      const s133 = dept.sub133?.status;
                      const renderBadge = (status, hasContent) => {
                        if (status === "SUBMITTED") {
                          return (
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              Submitted
                            </span>
                          );
                        }
                        if (status === "DRAFT" || hasContent) {
                          return (
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">
                              In Draft
                            </span>
                          );
                        }
                        return (
                          <span className="text-gray-400 text-[11px]">
                            Not Started
                          </span>
                        );
                      };

                      return (
                        <tr key={dept.departmentId} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {dept.departmentName}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {dept.schoolName || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {renderBadge(s131, dept.sub131?.hasContent)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {renderBadge(s132, dept.sub132?.hasContent)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {renderBadge(s133, dept.sub133?.hasContent)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() =>
                                setSelectedDeptId(dept.departmentId.toString())
                              }
                              className="text-indigo-600 hover:text-indigo-900 font-semibold underline underline-offset-2"
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
          <div className="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div>
              <p className="text-xs font-bold text-indigo-950">
                Viewing Submission:{" "}
                {selectedDepartmentObj?.departmentName ||
                  `Department #${selectedDeptId}`}
              </p>
              <p className="text-[11px] text-indigo-700">
                School: {selectedDepartmentObj?.schoolName || "University Unit"}
              </p>
            </div>
            <button
              onClick={() => setSelectedDeptId("all")}
              className="text-xs font-semibold px-3 py-1.5 border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-900 rounded-lg shadow-sm"
            >
              ← View All Departments List
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1.3.1 (QlM) - Cross-Cutting Issues (Weightage: 15)                */}
        {/* ========================================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div
            onClick={() =>
              setExpandedSection(expandedSection === "1.3.1" ? null : "1.3.1")
            }
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">1.3.1</span>
                <span>•</span>
                <span className="text-indigo-700 font-bold">Qualitative Metric (Q₁M)</span>
                <span>•</span>
                <span>Weightage: 15</span>
                {isSubmitted131 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Submitted
                  </span>
                ) : isSaved131 || desc131 ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                    Draft Saved
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px]">Not Submitted</span>
                )}
                {updatedAt131 && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt131).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                1.3.1 : Institution integrates cross-cutting issues relevant to
                Professional Ethics, Gender, Human Values, Environment &
                Sustainability and other value framework enshrined in Sustainable
                Development goals and National Education Policy – 2020 into the
                Curriculum
              </p>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1">
              {expandedSection === "1.3.1" ? "Hide" : "Open"}
            </button>
          </div>

          {expandedSection === "1.3.1" && (
            <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-5">
              {/* Description box */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Write description in a maximum of 500 words *
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      words131 > maxWords131
                        ? "text-red-600 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    Words: {words131} / {maxWords131}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={desc131}
                  disabled={isSubmitted131 && !isEditing131}
                  onChange={(e) => {
                    setDesc131(e.target.value);
                    setIsSaved131(false);
                  }}
                  placeholder="Explain how the curriculum integrates Professional Ethics, Gender equity, Human Values, Environment & Sustainability, SDGs, and NEP 2020 initiatives into course contents..."
                  className={`w-full p-3 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 ${
                    isSubmitted131 && !isEditing131
                      ? "bg-gray-50 text-gray-700 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
              </div>

              {/* Uploads for 1.3.1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Upload Additional Information (PDF/DOC)
                  </label>
                  <input
                    type="file"
                    ref={suppInputRef131}
                    onChange={(e) =>
                      handleFileUpload(e, setSupportingDoc131, "Additional Info")
                    }
                    className="hidden"
                  />
                  <div className="flex items-center justify-between pt-1">
                    {supportingDoc131 ? (
                      <span className="text-xs font-medium text-emerald-700 truncate max-w-[200px]">
                        📄 {supportingDoc131.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No file chosen</span>
                    )}
                    {(!isSubmitted131 || isEditing131) && !isAdmin && (
                      <button
                        type="button"
                        onClick={() => suppInputRef131.current?.click()}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-medium"
                      >
                        Browse
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Provide Link for Additional Information
                  </label>
                  <input
                    type="url"
                    value={webLink131}
                    disabled={isSubmitted131 && !isEditing131}
                    onChange={(e) => {
                      setWebLink131(e.target.value);
                      setIsSaved131(false);
                    }}
                    placeholder="https://manuu.edu.in/curriculum/cross-cutting-issues"
                    className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Actions 1.3.1 */}
              {!isAdmin && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {isSubmitted131 && !isEditing131 ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing131(true)}
                      className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      ✎ Edit 1.3.1 Submission
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave131(false)}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save 1.3.1 Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave131(true)}
                        className="px-4 py-2 bg-indigo-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit 1.3.1 Response
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1.3.2 (QnM) - Certificate / Value-added / Diploma / MOOCs (W: 30) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div
            onClick={() =>
              setExpandedSection(expandedSection === "1.3.2" ? null : "1.3.2")
            }
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">1.3.2</span>
                <span>•</span>
                <span className="text-amber-700 font-bold">Quantitative Metric (QₙM)</span>
                <span>•</span>
                <span className="font-bold text-gray-900">Weightage: 30</span>
                {isSubmitted132 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Submitted
                  </span>
                ) : isSaved132 || count132 ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                    Draft Saved
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px]">Not Submitted</span>
                )}
                {updatedAt132 && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt132).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                1.3.2 : Number of certificate / value-added courses / Diploma Programmes
                offered by the institutions and online courses of MOOCs, SWAYAM /
                e_Pathshala/ NPTEL and other recognized platforms where the students of
                the institution have enrolled and successfully completed during the last
                five years
              </p>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1">
              {expandedSection === "1.3.2" ? "Hide" : "Open"}
            </button>
          </div>

          {expandedSection === "1.3.2" && (
            <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-5">
              {/* Top Banner with Auto-Calculate */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                      Metric 1.3.2.1 Count (Without Repeat Count)
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 mt-0.5">
                      Total Certificate, Value-Added, Diploma & MOOCs Courses
                    </h3>
                  </div>

                  {(!isSubmitted132 || isEditing132 || isAdmin) && (
                    <button
                      type="button"
                      onClick={handleAutoCalculate132}
                      disabled={isAutoCalculating132}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                      {isAutoCalculating132
                        ? "Fetching..."
                        : "⚡ Auto-Calculate from Programmes & Courses DB"}
                    </button>
                  )}
                </div>

                <div className="max-w-xs space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 block">
                    1.3.2.1 : Number of eligible courses / programmes:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={count132}
                    disabled={isSubmitted132 && !isEditing132}
                    onChange={(e) => {
                      setCount132(e.target.value);
                      setIsSaved132(false);
                    }}
                    placeholder="e.g. 14"
                    className={`w-full p-2.5 text-base font-extrabold border border-gray-300 rounded-md focus:outline-none focus:border-amber-600 ${
                      isSubmitted132 && !isEditing132
                        ? "bg-gray-100 text-gray-700 cursor-not-allowed"
                        : "bg-white text-gray-900"
                    }`}
                  />
                  <p className="text-[10px] text-gray-500 italic">
                    Note: No repeat count of courses will be considered.
                  </p>
                </div>

                {/* Qualifying Items Table */}
                {qualifyingItems132.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <span className="text-xs font-bold text-gray-800">
                      Eligible Items Identified ({qualifyingItems132.length})
                    </span>
                    <div className="overflow-x-auto border border-gray-200 rounded-md">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                          <tr>
                            <th className="py-2 px-3">Code</th>
                            <th className="py-2 px-3">Course / Programme Title</th>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Source Module</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {qualifyingItems132.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-bold text-gray-900">
                                {item.code}
                              </td>
                              <td className="py-2 px-3 text-gray-800 font-medium">
                                {item.name}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${item.badgeColor}`}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-500">
                                {item.source}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 5 Required Documents for 1.3.2 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                  Upload Required Evidences (NAAC Mandated 5 Items)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doc 1: Institutional Data Template */}
                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      1. Institutional Data (Data Template) *
                    </span>
                    <input
                      type="file"
                      ref={docTemplateRef132}
                      onChange={(e) =>
                        handleFileUpload(e, setDocTemplate132, "Data Template")
                      }
                      accept=".xlsx,.xls,.csv,.pdf"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docTemplate132 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docTemplate132.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted132 || isEditing132) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docTemplateRef132.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doc 2: Brochure/Notice with modules & outcomes */}
                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      2. Programme Brochure / Notice with Modules & Outcomes *
                    </span>
                    <input
                      type="file"
                      ref={docBrochureRef132}
                      onChange={(e) =>
                        handleFileUpload(e, setDocBrochure132, "Brochure/Notice")
                      }
                      accept=".pdf"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docBrochure132 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docBrochure132.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted132 || isEditing132) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docBrochureRef132.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doc 3: Student list & attendance sheet */}
                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      3. List of Students and Attendance Sheet *
                    </span>
                    <input
                      type="file"
                      ref={docAttendanceRef132}
                      onChange={(e) =>
                        handleFileUpload(e, setDocAttendance132, "Attendance Sheet")
                      }
                      accept=".pdf,.zip,.xlsx"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docAttendance132 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docAttendance132.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted132 || isEditing132) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docAttendanceRef132.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doc 4: Course completion certificates */}
                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      4. Evidence of Course Completion (Certificates) *
                    </span>
                    <input
                      type="file"
                      ref={docCertificatesRef132}
                      onChange={(e) =>
                        handleFileUpload(e, setDocCertificates132, "Certificates")
                      }
                      accept=".pdf,.zip"
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docCertificates132 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docCertificates132.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted132 || isEditing132) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docCertificatesRef132.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doc 5: Website Link */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    5. Institutional Website Link / Public Disclosure URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={webLink132}
                      disabled={isSubmitted132 && !isEditing132}
                      onChange={(e) => {
                        setWebLink132(e.target.value);
                        setIsSaved132(false);
                      }}
                      placeholder="https://manuu.edu.in/naac/metric-1-3-2"
                      className="flex-1 p-2 text-xs border border-gray-300 rounded-md"
                    />
                    {webLink132 && (
                      <a
                        href={
                          webLink132.startsWith("http")
                            ? webLink132
                            : `https://${webLink132}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions 1.3.2 */}
              {!isAdmin && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {isSubmitted132 && !isEditing132 ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing132(true)}
                      className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      ✎ Edit 1.3.2 Submission
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave132(false)}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save 1.3.2 Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave132(true)}
                        className="px-4 py-2 bg-indigo-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit 1.3.2 Response
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1.3.3 (QnM) - Field Projects & Internships (Weightage: 5)         */}
        {/* ========================================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div
            onClick={() =>
              setExpandedSection(expandedSection === "1.3.3" ? null : "1.3.3")
            }
            className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="font-bold text-gray-900">1.3.3</span>
                <span>•</span>
                <span className="text-indigo-700 font-bold">Quantitative Metric (QₙM)</span>
                <span>•</span>
                <span>Weightage: 5</span>
                {isSubmitted133 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Submitted
                  </span>
                ) : isSaved133 || programsWithProjectsCount ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                    Draft Saved
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px]">Not Submitted</span>
                )}
                {updatedAt133 && (
                  <span className="text-gray-400 text-[11px]">
                    (Updated: {new Date(updatedAt133).toLocaleDateString()})
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                1.3.3 : Percentage of Programmes that have components of field
                projects / research projects / internships during last five years
              </p>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1">
              {expandedSection === "1.3.3" ? "Hide" : "Open"}
            </button>
          </div>

          {expandedSection === "1.3.3" && (
            <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-5">
              {/* Formula & Live Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 rounded-xl p-4 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs text-indigo-300">
                    <span className="font-semibold uppercase tracking-wider">
                      Formula & Calculation
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">
                      Weightage: 5
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-indigo-200">
                      <span>1.3.3.1 : Eligible Programmes with Projects/Internships</span>
                      <span className="font-bold text-white">
                        {programsWithProjectsCount || "0"}
                      </span>
                    </div>
                    <div className="border-t border-white/20 pt-1 flex justify-between text-gray-300">
                      <span>1.3.3.2 : Total Programmes Offered (Without repeat)</span>
                      <span className="font-bold text-white">
                        {totalProgramsCount || "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    Calculated Percentage
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-950 font-mono">
                    {calculatedPercentage133}%
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {programsWithProjectsCount || 0} / {totalProgramsCount || 0} programmes eligible
                  </p>
                </div>
              </div>

              {/* Numerical Counts & Auto-Calculate */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Numerical Counts
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Auto-calculate directly from registered degree programmes.
                    </p>
                  </div>

                  {(!isSubmitted133 || isEditing133 || isAdmin) && (
                    <button
                      type="button"
                      onClick={handleAutoCalculateFromDB}
                      disabled={isAutoCalculating}
                      className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {isAutoCalculating
                        ? "Calculating..."
                        : "⚡ Auto-Calculate from Programmes DB"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-800 block">
                      1.3.3.1 : Number of programmes with projects/internships
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={programsWithProjectsCount}
                      disabled={isSubmitted133 && !isEditing133}
                      onChange={(e) => {
                        setProgramsWithProjectsCount(e.target.value);
                        setIsSaved133(false);
                      }}
                      placeholder="e.g. 6"
                      className="w-full p-2.5 text-xs border border-gray-300 rounded-md font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-800 block">
                      1.3.3.2 : Total programmes offered (without repeat count)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalProgramsCount}
                      disabled={isSubmitted133 && !isEditing133}
                      onChange={(e) => {
                        setTotalProgramsCount(e.target.value);
                        setIsSaved133(false);
                      }}
                      placeholder="e.g. 8"
                      className="w-full p-2.5 text-xs border border-gray-300 rounded-md font-bold"
                    />
                  </div>
                </div>

                {eligibleProgramsList.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <span className="text-xs font-bold text-gray-800">
                      Eligible Programmes ({eligibleProgramsList.length})
                    </span>
                    <div className="overflow-x-auto border border-gray-200 rounded-md">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                          <tr>
                            <th className="py-2 px-3">Code</th>
                            <th className="py-2 px-3">Programme Name</th>
                            <th className="py-2 px-3">Components</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {eligibleProgramsList.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-bold text-gray-900">
                                {p.code}
                              </td>
                              <td className="py-2 px-3 text-gray-800 font-medium">
                                {p.name}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {p.hasFieldProject && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Field Project
                                    </span>
                                  )}
                                  {p.hasResearchProject && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                      Research
                                    </span>
                                  )}
                                  {p.hasInternship && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                      Internship
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.3.3 Uploads */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                  Required Evidences (1.3.3)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      Institutional Data Template *
                    </span>
                    <input
                      type="file"
                      ref={docTemplateRef133}
                      onChange={(e) =>
                        handleFileUpload(e, setDocTemplate133, "Data Template")
                      }
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docTemplate133 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docTemplate133.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted133 || isEditing133) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docTemplateRef133.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      BOS Approved Syllabus Copy *
                    </span>
                    <input
                      type="file"
                      ref={docBosSyllabusRef133}
                      onChange={(e) =>
                        handleFileUpload(e, setDocBosSyllabus133, "BOS Syllabus")
                      }
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docBosSyllabus133 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docBosSyllabus133.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted133 || isEditing133) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docBosSyllabusRef133.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      Sample Internship Letters
                    </span>
                    <input
                      type="file"
                      ref={docInternshipLettersRef133}
                      onChange={(e) =>
                        handleFileUpload(e, setDocInternshipLetters133, "Internship Letters")
                      }
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docInternshipLetters133 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docInternshipLetters133.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted133 || isEditing133) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docInternshipLettersRef133.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg space-y-1.5 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-900 block">
                      Sample Evaluated Reports
                    </span>
                    <input
                      type="file"
                      ref={docEvaluatedReportsRef133}
                      onChange={(e) =>
                        handleFileUpload(e, setDocEvaluatedReports133, "Evaluated Reports")
                      }
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      {docEvaluatedReports133 ? (
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[180px]">
                          📄 {docEvaluatedReports133.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No file chosen</span>
                      )}
                      {(!isSubmitted133 || isEditing133) && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => docEvaluatedReportsRef133.current?.click()}
                          className="px-2.5 py-1 bg-white border border-gray-300 text-xs rounded font-medium shadow-sm hover:bg-gray-50"
                        >
                          Browse
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Institutional Website Public Disclosure Link
                  </label>
                  <input
                    type="url"
                    value={webLink133}
                    disabled={isSubmitted133 && !isEditing133}
                    onChange={(e) => {
                      setWebLink133(e.target.value);
                      setIsSaved133(false);
                    }}
                    placeholder="https://manuu.edu.in/naac/metric-1-3-3"
                    className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Actions 1.3.3 */}
              {!isAdmin && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {isSubmitted133 && !isEditing133 ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing133(true)}
                      className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      ✎ Edit 1.3.3 Submission
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave133(false)}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save 1.3.3 Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave133(true)}
                        className="px-4 py-2 bg-indigo-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit 1.3.3 Response
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Criterion1_3;
