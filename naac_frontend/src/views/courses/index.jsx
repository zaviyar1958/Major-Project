import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CourseService from "@/service/courseService";
import ProgramService from "@/service/programService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const CoursesView = () => {
  const { user } = useSelector((state) => state.auth);
  const deptName = user?.department?.name || user?.username || "Department";

  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("All");
  const [search, setSearch] = useState("");
  const [filterRevisedLast5Years, setFilterRevisedLast5Years] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Choice Modal: "Add / Update Course"
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

  // 2. New / Edit Course Form Modal
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form State
  const currentYear = new Date().getFullYear();
  const fiveYearsAgo = currentYear - 5; // e.g. 2021 to 2026

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    programId: "",
    credits: "4",
    yearOfOffering: currentYear.toString(),
    yearOfRevision: currentYear.toString(),
    academicYear: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    isEmployability: false,
    isSkillDev: false,
    isEntrepreneurship: false,
    isValueAdded: false,
    isOnlineMOOC: false,
  });

  // 3. Course Update Management Modal (List of courses with search to update revision year)
  const [isUpdateListModalOpen, setIsUpdateListModalOpen] = useState(false);
  const [updateSearch, setUpdateSearch] = useState("");
  const [selectedCourseForRevision, setSelectedCourseForRevision] = useState(null);
  const [revisionYearInput, setRevisionYearInput] = useState("");
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [isSavingRevision, setIsSavingRevision] = useState(false);

  // 4. View Revision History Modal
  const [historyModalCourse, setHistoryModalCourse] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const progRes = await ProgramService.getAllPrograms({
        departmentId: user?.departmentId,
      });
      if (progRes?.data?.success) {
        setPrograms(progRes.data.data || []);
      }

      const params = { departmentId: user?.departmentId };
      if (selectedProgram && selectedProgram !== "All") {
        params.programId = selectedProgram;
      }
      if (search) params.search = search;

      const courseRes = await CourseService.getAllCourses(params);
      if (courseRes?.data?.success) {
        setCourses(courseRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, selectedProgram]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // 5-Year Revision Statistics Calculation
  // A revision in last 5 years is either:
  // 1) course.yearOfRevision >= fiveYearsAgo
  // 2) or any event in course.revisionHistory with eventType == 'REVISED' and revisionYear >= fiveYearsAgo
  const stats5Years = React.useMemo(() => {
    let uniqueRevisedCourses = 0;
    let totalRevisionEvents = 0;
    let multiRevisedCourses = 0;

    courses.forEach((c) => {
      // Find all REVISED events in last 5 years
      const revisionsIn5Yrs = (c.revisionHistory || []).filter(
        (h) => h.eventType === "REVISED" && h.revisionYear >= fiveYearsAgo
      );

      // Also check main course.yearOfRevision if no history records exist yet
      const isRevisedMain =
        c.yearOfRevision &&
        c.yearOfRevision >= fiveYearsAgo &&
        c.yearOfOffering &&
        c.yearOfRevision > c.yearOfOffering;

      const revisionCount = Math.max(revisionsIn5Yrs.length, isRevisedMain ? 1 : 0);

      if (revisionCount > 0) {
        uniqueRevisedCourses += 1;
        totalRevisionEvents += revisionCount;
        if (revisionCount >= 2) {
          multiRevisedCourses += 1;
        }
      }
    });

    const totalCourses = courses.length;
    const revisionPercentage =
      totalCourses > 0
        ? Math.round((uniqueRevisedCourses / totalCourses) * 100)
        : 0;

    return {
      totalCourses,
      uniqueRevisedCourses,
      totalRevisionEvents,
      multiRevisedCourses,
      revisionPercentage,
      rangeText: `${fiveYearsAgo} - ${currentYear}`,
    };
  }, [courses, fiveYearsAgo, currentYear]);

  // Helper to check if a specific course revised in last 5 years
  const getCourse5YearRevisionInfo = (course) => {
    const revisionsIn5Yrs = (course.revisionHistory || []).filter(
      (h) => h.eventType === "REVISED" && h.revisionYear >= fiveYearsAgo
    );
    const count = revisionsIn5Yrs.length;
    const isMainRevised =
      course.yearOfRevision &&
      course.yearOfRevision >= fiveYearsAgo &&
      course.yearOfOffering &&
      course.yearOfRevision > course.yearOfOffering;

    const totalRevisions = Math.max(count, isMainRevised ? 1 : 0);
    return {
      isRevised: totalRevisions > 0,
      count: totalRevisions,
      isMulti: totalRevisions >= 2,
    };
  };

  // Filtered courses for main table
  const displayedCourses = React.useMemo(() => {
    if (!filterRevisedLast5Years) return courses;
    return courses.filter((c) => getCourse5YearRevisionInfo(c).isRevised);
  }, [courses, filterRevisedLast5Years]);

  // Open choice popup
  const handleOpenAddUpdateChoice = () => {
    setIsChoiceModalOpen(true);
  };

  // Action: User clicks "New Course" from choice popup
  const handleSelectNewCourse = () => {
    setIsChoiceModalOpen(false);
    setEditingCourse(null);
    const yr = new Date().getFullYear();
    setFormData({
      name: "",
      code: "",
      programId: programs.length > 0 ? programs[0].id.toString() : "",
      credits: "4",
      yearOfOffering: yr.toString(),
      yearOfRevision: yr.toString(), // New course case: offering year is revision year
      academicYear: `${yr}-${(yr + 1).toString().slice(-2)}`,
      isEmployability: false,
      isSkillDev: false,
      isEntrepreneurship: false,
      isValueAdded: false,
      isOnlineMOOC: false,
    });
    setIsCourseFormOpen(true);
  };

  // Action: User clicks "Course Update" from choice popup
  const handleSelectCourseUpdate = () => {
    setIsChoiceModalOpen(false);
    setUpdateSearch("");
    setSelectedCourseForRevision(null);
    setIsUpdateListModalOpen(true);
  };

  // Offering year change handler in New Course: automatically syncs Revision Year
  const handleOfferingYearChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      yearOfOffering: val,
      // For new course, offering year is also revision year
      yearOfRevision: val,
    }));
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || "",
      code: course.code || "",
      programId: course.programId ? course.programId.toString() : "",
      credits: (course.credits || 4).toString(),
      yearOfOffering: (course.yearOfOffering || 2024).toString(),
      yearOfRevision: (course.yearOfRevision || 2024).toString(),
      academicYear: `${course.yearOfRevision || 2024}-${((course.yearOfRevision || 2024) + 1).toString().slice(-2)}`,
      isEmployability: Boolean(course.isEmployability),
      isSkillDev: Boolean(course.isSkillDev),
      isEntrepreneurship: Boolean(course.isEntrepreneurship),
      isValueAdded: Boolean(course.isValueAdded),
      isOnlineMOOC: Boolean(course.isOnlineMOOC),
    });
    setIsCourseFormOpen(true);
  };

  // Submit New or Edit Course Form
  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Course name and code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        programId: formData.programId ? parseInt(formData.programId) : null,
        credits: parseInt(formData.credits) || 4,
        yearOfOffering: parseInt(formData.yearOfOffering) || 2024,
        yearOfRevision: parseInt(formData.yearOfRevision) || parseInt(formData.yearOfOffering) || 2024,
        academicYear: formData.academicYear,
        isEmployability: formData.isEmployability,
        isSkillDev: formData.isSkillDev,
        isEntrepreneurship: formData.isEntrepreneurship,
        isValueAdded: formData.isValueAdded,
        isOnlineMOOC: formData.isOnlineMOOC,
        departmentId: user?.departmentId,
      };

      if (editingCourse) {
        const res = await CourseService.updateCourse(editingCourse.id, payload);
        if (res?.data?.success) {
          toast.success("Course updated successfully");
          setIsCourseFormOpen(false);
          fetchData();
        }
      } else {
        const res = await CourseService.createCourse(payload);
        if (res?.data?.success) {
          toast.success("New course added successfully with revision history");
          setIsCourseFormOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      const msg = error?.data?.message || "Failed to save course";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Revision Update submission
  const handleSaveRevision = async (e) => {
    e.preventDefault();
    if (!selectedCourseForRevision) return;

    if (!revisionYearInput || isNaN(revisionYearInput)) {
      toast.error("Please enter a valid revision year");
      return;
    }

    setIsSavingRevision(true);
    try {
      const payload = {
        yearOfRevision: parseInt(revisionYearInput),
        remarks: revisionRemarks.trim() || `Course revised in ${revisionYearInput}`,
      };

      const res = await CourseService.updateCourse(
        selectedCourseForRevision.id,
        payload
      );
      if (res?.data?.success) {
        toast.success(
          `Revision year for ${selectedCourseForRevision.code} updated to ${revisionYearInput}`
        );
        setSelectedCourseForRevision(null);
        setRevisionRemarks("");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update revision year");
    } finally {
      setIsSavingRevision(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete course "${name}"?`)) {
      return;
    }

    try {
      const res = await CourseService.deleteCourse(id);
      if (res?.data?.success) {
        toast.success("Course deleted successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  // Filter courses for update modal
  const filteredCoursesForUpdate = courses.filter((c) => {
    if (!updateSearch.trim()) return true;
    const term = updateSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      (c.programCode && c.programCode.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              <span>{deptName}</span>
              <span> • </span>
              <span>NAAC Indicator 1.1.2 & Criterion 1</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Course Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage syllabus courses, offering years, syllabus revisions, and NAAC 1.1.2 focus
            </p>
          </div>

          <div>
            {/* Primary Action Button: Add / Update Course */}
            <button
              onClick={handleOpenAddUpdateChoice}
              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Add / Update Course</span>
            </button>
          </div>
        </div>

        {/* 5-Year Revision Statistics Summary Bar (NAAC Criterion 1.1.2) - Minimalist Black & White */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3.5">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Syllabus Courses
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats5Years.totalCourses}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Offered by Department</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                Revised in 5 Years
              </p>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                {stats5Years.rangeText}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats5Years.uniqueRevisedCourses}{" "}
              <span className="text-xs font-normal text-gray-500">
                ({stats5Years.revisionPercentage}%)
              </span>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Unique courses revised (NAAC 1.1.2)
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Revision Events
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats5Years.totalRevisionEvents}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Cumulative syllabus revisions
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                Multi-Revised (≥2 Times)
              </p>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                Logged
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats5Years.multiRevisedCourses}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Courses revised multiple times in 5 yrs
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course by name or code..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 bg-white text-gray-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-100 font-medium text-gray-800"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* 5-Year Revision Filter Toggle Button - Black & White */}
            <button
              type="button"
              onClick={() => setFilterRevisedLast5Years(!filterRevisedLast5Years)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1.5 ${
                filterRevisedLast5Years
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>{filterRevisedLast5Years ? "✓ Showing 5-Yr Revisions" : "Filter: Last 5 Years Revised"}</span>
              {filterRevisedLast5Years && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                  {stats5Years.uniqueRevisedCourses}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Prog:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none"
              >
                <option value="All">All Programmes</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Loading courses...
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                {filterRevisedLast5Years
                  ? "No Courses Revised in the Last 5 Years Found"
                  : "No Courses Found"}
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {filterRevisedLast5Years
                  ? "None of the registered courses have a revision year in the last 5-year cycle."
                  : 'Click "Add / Update Course" above to register syllabus courses or update existing syllabus revisions.'}
              </p>
              {filterRevisedLast5Years && (
                <button
                  onClick={() => setFilterRevisedLast5Years(false)}
                  className="mt-2 px-3 py-1 text-xs bg-gray-900 text-white rounded-md font-medium"
                >
                  Show All Courses
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Name</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Offering Year</th>
                    <th className="py-3 px-4">Revision Year</th>
                    <th className="py-3 px-4">5-Year Status</th>
                    <th className="py-3 px-4">NAAC Focus</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedCourses.map((c) => {
                    const focusList = [];
                    if (c.isEmployability) focusList.push("Employability");
                    if (c.isSkillDev) focusList.push("Skill Development");
                    if (c.isEntrepreneurship) focusList.push("Entrepreneurship");
                    if (c.isValueAdded) focusList.push("Value Added");
                    if (c.isOnlineMOOC) focusList.push("MOOC/SWAYAM");

                    const rev5Info = getCourse5YearRevisionInfo(c);

                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {c.programCode !== "-" ? c.programCode : "General"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {c.credits} Credits
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {c.yearOfOffering || "-"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {c.yearOfRevision || "-"}
                        </td>
                        <td className="py-3 px-4">
                          {rev5Info.isRevised ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  rev5Info.isMulti
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {rev5Info.isMulti
                                  ? `Revised ${rev5Info.count}× in 5 yrs`
                                  : "Revised in 5 yrs"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">
                              Not revised in 5 yrs
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {focusList.length > 0
                            ? focusList.join(", ")
                            : "General Course"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setHistoryModalCourse(c)}
                            className="text-gray-900 hover:text-black font-semibold underline underline-offset-2"
                            title="View revision history records"
                          >
                            History
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


        {/* 1. Modal: Choice between "New Course" and "Course Update" */}
        <Dialog open={isChoiceModalOpen} onOpenChange={setIsChoiceModalOpen}>
          <DialogContent className="max-w-md bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Course Management Action
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Select whether you want to add a brand new course or update an existing syllabus course
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3.5 my-4">
              {/* Option A: New Course */}
              <button
                type="button"
                onClick={handleSelectNewCourse}
                className="p-4 border-2 border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 rounded-xl text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center font-bold text-xs mb-2 transition-colors">
                  +
                </div>
                <h3 className="font-bold text-xs text-gray-900">New Course</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Add a newly introduced course. Offering year will automatically become the initial revision year.
                </p>
              </button>

              {/* Option B: Course Update */}
              <button
                type="button"
                onClick={handleSelectCourseUpdate}
                className="p-4 border-2 border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 rounded-xl text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-900 group-hover:text-white text-gray-800 flex items-center justify-center font-bold text-xs mb-2 transition-colors">
                  ↻
                </div>
                <h3 className="font-bold text-xs text-gray-900">Course Update</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Search existing courses and update their syllabus revision year with full historical records.
                </p>
              </button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChoiceModalOpen(false)}
                className="text-xs h-8 rounded-md"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2. Modal: New Course / Edit Course Form */}
        <Dialog open={isCourseFormOpen} onOpenChange={setIsCourseFormOpen}>
          <DialogContent className="max-w-md bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {editingCourse
                  ? "Update course attributes and revision year"
                  : "For new courses, the offering year is automatically set as the revision year"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitCourse} className="space-y-3.5 mt-2 text-xs">
              <div className="space-y-1">
                <Label htmlFor="courseName" className="font-semibold text-gray-700">
                  Course Name *
                </Label>
                <Input
                  id="courseName"
                  placeholder="e.g. Advanced Data Structures"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="text-xs border-gray-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="courseCode" className="font-semibold text-gray-700">
                    Course Code *
                  </Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g. CS201"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                    className="text-xs border-gray-200 rounded-md uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="courseProg" className="font-semibold text-gray-700">
                    Programme
                  </Label>
                  <select
                    id="courseProg"
                    value={formData.programId}
                    onChange={(e) =>
                      setFormData({ ...formData, programId: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-xs focus:outline-none"
                  >
                    <option value="">Select Programme</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year Configuration: Offering Year & Revision Year */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Course Introduction & Revision
                  </span>
                  {!editingCourse && (
                    <span className="text-[10px] bg-gray-200 text-gray-800 font-semibold px-2 py-0.5 rounded">
                      Auto-synced for New Course
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="offeringYear" className="font-semibold text-gray-700">
                      Offering Year *
                    </Label>
                    <Input
                      id="offeringYear"
                      type="number"
                      min="1990"
                      max="2035"
                      placeholder="e.g. 2024"
                      value={formData.yearOfOffering}
                      onChange={(e) => handleOfferingYearChange(e.target.value)}
                      required
                      className="text-xs border-gray-200 rounded-md font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="revisionYear" className="font-semibold text-gray-700">
                      Revision Year *
                    </Label>
                    <Input
                      id="revisionYear"
                      type="number"
                      min="1990"
                      max="2035"
                      placeholder="e.g. 2024"
                      value={formData.yearOfRevision}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearOfRevision: e.target.value,
                        })
                      }
                      required
                      className="text-xs border-gray-200 rounded-md font-bold text-gray-900"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-500">
                  {editingCourse
                    ? "Updating the revision year will automatically create an audit record in the course revision history."
                    : "Offering Year and Revision Year will be recorded into the year-wise historical archive for NAAC."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="credits" className="font-semibold text-gray-700">
                    Credits
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="4"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: e.target.value })
                    }
                    className="text-xs border-gray-200 rounded-md"
                  />
                </div>
              </div>

              {/* NAAC Focus Checkboxes */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-2">
                <p className="font-semibold text-gray-800">
                  NAAC Criterion 1.1.2 Focus Attributes:
                </p>
                <div className="space-y-1.5 text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEmployability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isEmployability: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span>Focuses on Employability</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSkillDev}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSkillDev: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span>Focuses on Skill Development</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEntrepreneurship}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isEntrepreneurship: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span>Focuses on Entrepreneurship</span>
                  </label>
                </div>
              </div>

              {/* NAAC Criterion 1.3.2 Focus Attributes */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wider">
                    NAAC Criterion 1.3.2 Attributes:
                  </p>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                    NAAC 1.3.2
                  </span>
                </div>
                <div className="space-y-1.5 text-gray-700 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={formData.isValueAdded}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isValueAdded: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="font-medium">Value-Added Course (VAC)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={formData.isOnlineMOOC}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isOnlineMOOC: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="font-medium">Online MOOC / SWAYAM / NPTEL Course</span>
                  </label>
                </div>
                <p className="text-[10px] text-indigo-600/80 pt-0.5">
                  Check if this course is a Value-Added or MOOC course completed by students for NAAC 1.3.2 reporting.
                </p>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCourseFormOpen(false)}
                  className="text-xs h-8 rounded-md"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 3. Modal: Course Update (Search Courses & Update Revision Year) */}
        <Dialog open={isUpdateListModalOpen} onOpenChange={setIsUpdateListModalOpen}>
          <DialogContent className="max-w-2xl bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Course Update & Revision Manager
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Search courses offered by the department and update syllabus revision years
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              {/* Search Bar within Update Modal */}
              <div>
                <Input
                  type="text"
                  placeholder="Search course by name, code, or programme..."
                  value={updateSearch}
                  onChange={(e) => setUpdateSearch(e.target.value)}
                  className="text-xs border-gray-200 rounded-md bg-white"
                />
              </div>

              {/* Course Revision Quick Form (If a course is selected for revision) */}
              {selectedCourseForRevision && (
                <form
                  onSubmit={handleSaveRevision}
                  className="p-3 bg-gray-50 border border-gray-300 rounded-xl space-y-2.5 text-xs animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      Update Revision Year for: {selectedCourseForRevision.code} - {selectedCourseForRevision.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForRevision(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
                    >
                      ✕ Close Form
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-gray-600">Offering Year</Label>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedCourseForRevision.yearOfOffering || 2024}
                      </p>
                    </div>

                    <div>
                      <Label className="text-[11px] text-gray-600">New Revision Year *</Label>
                      <Input
                        type="number"
                        min="1990"
                        max="2035"
                        value={revisionYearInput}
                        onChange={(e) => setRevisionYearInput(e.target.value)}
                        required
                        className="h-8 text-xs border-gray-300 rounded-md font-bold text-gray-900 bg-white"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-[11px] text-gray-600">Revision Remarks / Note</Label>
                      <Input
                        type="text"
                        placeholder="e.g. BoS approved 20% revision"
                        value={revisionRemarks}
                        onChange={(e) => setRevisionRemarks(e.target.value)}
                        className="h-8 text-xs border-gray-300 rounded-md bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedCourseForRevision(null)}
                      className="text-xs h-7 rounded-md"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingRevision}
                      className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-7 rounded-md font-medium"
                    >
                      {isSavingRevision ? "Saving..." : "Save Revision Year"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Course List Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Course Name</th>
                      <th className="py-2.5 px-3">Programme</th>
                      <th className="py-2.5 px-3">Offering Year</th>
                      <th className="py-2.5 px-3">Revision Year</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCoursesForUpdate.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-6 px-3 text-center text-gray-400 text-xs"
                        >
                          No courses match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredCoursesForUpdate.map((course) => (
                        <tr
                          key={course.id}
                          className={`hover:bg-gray-50 ${
                            selectedCourseForRevision?.id === course.id
                              ? "bg-gray-100"
                              : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-gray-900">
                            {course.code}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-800">
                            {course.name}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {course.programCode || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">
                            {course.yearOfOffering || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">
                            {course.yearOfRevision || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseForRevision(course);
                                setRevisionYearInput(
                                  (course.yearOfRevision || new Date().getFullYear()).toString()
                                );
                                setRevisionRemarks("");
                              }}
                              className="px-2.5 py-1 text-[11px] bg-gray-900 hover:bg-gray-800 text-white rounded font-medium"
                            >
                              Update Revision
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(course)}
                              className="text-gray-500 hover:text-gray-800 font-medium text-[11px]"
                            >
                              Edit All
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateListModalOpen(false)}
                className="text-xs h-8 rounded-md"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 4. Modal: View Revision History Records for a Course */}
        <Dialog
          open={Boolean(historyModalCourse)}
          onOpenChange={(open) => !open && setHistoryModalCourse(null)}
        >
          <DialogContent className="max-w-md bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Course Revision History • {historyModalCourse?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {historyModalCourse?.name} — Timeline of introduction and syllabus revisions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between">
                <div>
                  <span className="text-gray-500">Offering Year:</span>{" "}
                  <span className="font-bold text-gray-800">
                    {historyModalCourse?.yearOfOffering || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Current Revision:</span>{" "}
                  <span className="font-bold text-gray-900">
                    {historyModalCourse?.yearOfRevision || "-"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Event</th>
                      <th className="py-2 px-3">Year</th>
                      <th className="py-2 px-3">Remarks</th>
                      <th className="py-2 px-3 text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyModalCourse?.revisionHistory &&
                    historyModalCourse.revisionHistory.length > 0 ? (
                      historyModalCourse.revisionHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-300"
                            >
                              {item.eventType}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-gray-800">
                            {item.revisionYear}
                          </td>
                          <td className="py-2 px-3 text-gray-500">
                            {item.remarks || "-"}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-400 text-[10px]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 px-3 text-center text-gray-400"
                        >
                          No historical entries logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHistoryModalCourse(null)}
                className="text-xs h-8 rounded-md"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CoursesView;


