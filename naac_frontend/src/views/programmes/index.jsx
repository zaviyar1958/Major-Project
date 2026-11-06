import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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

const ACADEMIC_YEARS = [
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
];

const ProgrammesView = () => {
  const { user } = useSelector((state) => state.auth);
  const deptName = user?.department?.name || user?.username || "Department";

  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit Program
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: "PG",
    yearOfIntroduction: "2020",
    status: "Active",
    academicYear: "2024-25",
    enrolledStudents: "0",
    hasFieldProject: false,
    hasResearchProject: false,
    hasInternship: false,
  });

  // Modal for Viewing/Updating All Yearly Intakes
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyProgram, setHistoryProgram] = useState(null);
  const [historyYear, setHistoryYear] = useState("2024-25");
  const [historyStudents, setHistoryStudents] = useState("0");
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  const fetchPrograms = async (overrideYear) => {
    setIsLoading(true);
    try {
      const activeYear = overrideYear || selectedYear;
      const params = {
        academicYear: activeYear,
      };
      if (user?.departmentId) {
        params.departmentId = user.departmentId;
      }
      if (search) params.search = search;

      const res = await ProgramService.getAllPrograms(params);
      if (res?.data?.success) {
        setPrograms(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load programmes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [user, selectedYear]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrograms();
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      name: "",
      code: "",
      level: "PG",
      yearOfIntroduction: "2020",
      status: "Active",
      academicYear: selectedYear,
      enrolledStudents: "0",
      hasFieldProject: false,
      hasResearchProject: false,
      hasInternship: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (prog) => {
    setEditingProgram(prog);
    setFormData({
      name: prog.name || "",
      code: prog.code || "",
      level: prog.level || "PG",
      yearOfIntroduction: (prog.yearOfIntroduction || 2020).toString(),
      status: prog.status || "Active",
      academicYear: selectedYear,
      enrolledStudents: (prog.enrolledStudents || 0).toString(),
      hasFieldProject: Boolean(prog.hasFieldProject),
      hasResearchProject: Boolean(prog.hasResearchProject),
      hasInternship: Boolean(prog.hasInternship),
    });
    setIsDialogOpen(true);
  };

  const handleOpenHistory = (prog) => {
    setHistoryProgram(prog);
    setHistoryYear(selectedYear);
    const existing = prog.allEnrollments?.find(
      (e) => e.academicYear === selectedYear
    );
    setHistoryStudents(existing ? existing.enrolledStudents.toString() : "0");
    setIsHistoryModalOpen(true);
  };

  const handleHistoryYearChange = (year) => {
    setHistoryYear(year);
    if (historyProgram) {
      const existing = historyProgram.allEnrollments?.find(
        (e) => e.academicYear === year
      );
      setHistoryStudents(existing ? existing.enrolledStudents.toString() : "0");
    }
  };

  const handleSaveHistoryEnrollment = async (e) => {
    e.preventDefault();
    if (!historyProgram) return;

    setIsSavingHistory(true);
    try {
      const payload = {
        academicYear: historyYear,
        enrolledStudents: parseInt(historyStudents) || 0,
      };
      const res = await ProgramService.updateProgram(historyProgram.id, payload);
      if (res?.data?.success) {
        toast.success(`Enrollment for ${historyYear} updated successfully`);
        setIsHistoryModalOpen(false);
        fetchPrograms();
      }
    } catch (error) {
      toast.error("Failed to update yearly enrollment");
    } finally {
      setIsSavingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Programme name and code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProgram) {
        const payload = {
          name: formData.name,
          code: formData.code,
          level: formData.level,
          yearOfIntroduction: parseInt(formData.yearOfIntroduction) || 2020,
          status: formData.status,
          academicYear: formData.academicYear,
          enrolledStudents: parseInt(formData.enrolledStudents) || 0,
          hasFieldProject: formData.hasFieldProject,
          hasResearchProject: formData.hasResearchProject,
          hasInternship: formData.hasInternship,
        };
        const res = await ProgramService.updateProgram(
          editingProgram.id,
          payload
        );
        if (res?.data?.success) {
          toast.success("Programme updated successfully");
          setIsDialogOpen(false);
          fetchPrograms();
        }
      } else {
        const payload = {
          name: formData.name,
          code: formData.code,
          level: formData.level,
          yearOfIntroduction: parseInt(formData.yearOfIntroduction) || 2020,
          departmentId: user?.departmentId,
          academicYear: formData.academicYear,
          enrolledStudents: parseInt(formData.enrolledStudents) || 0,
          hasFieldProject: formData.hasFieldProject,
          hasResearchProject: formData.hasResearchProject,
          hasInternship: formData.hasInternship,
        };
        const res = await ProgramService.createProgram(payload);
        if (res?.data?.success) {
          toast.success("Programme created successfully");
          setIsDialogOpen(false);
          fetchPrograms();
        }
      }
    } catch (error) {
      const msg = error?.data?.message || "Failed to save programme";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete programme "${name}"? All associated courses and enrollment records will also be removed.`
      )
    ) {
      return;
    }

    try {
      const res = await ProgramService.deleteProgram(id);
      if (res?.data?.success) {
        toast.success("Programme deleted successfully");
        fetchPrograms();
      }
    } catch (error) {
      toast.error("Failed to delete programme");
    }
  };

  // Calculate total students enrolled across all programs in this department for selectedYear
  const totalStudentsInDepartment = programs.reduce(
    (sum, p) => sum + (p.enrolledStudents || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              <span>{deptName}</span>
              <span> • </span>
              <span>NAAC Criterion 1 & 2</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Programme Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Add degree programmes, manage student enrollment, and track yearly intake
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Academic Year Switcher */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
              <span className="text-[11px] font-medium text-gray-500">Session:</span>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="text-xs font-bold text-gray-900 bg-transparent border-0 focus:outline-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium shadow-sm transition-colors"
            >
              + Add Programme
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Total Programmes</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {programs.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Offered by Department</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">
              Enrolled Students ({selectedYear})
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5">
              {totalStudentsInDepartment.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Reflected on Admin Dashboard
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Selected Academic Session</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">
              {selectedYear}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Historical records preserved
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programme by name or code..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 bg-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Programmes Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Loading programmes for {selectedYear}...
            </div>
          ) : programs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                No Programmes Found
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Click "+ Add Programme" above to register degree programmes and set student intake for {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Programme Name</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Year Introduced</th>
                    <th className="py-3 px-4 bg-blue-50/50 text-blue-950 font-bold">
                      Enrolled ({selectedYear})
                    </th>
                    <th className="py-3 px-4">Courses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.map((prog) => (
                    <tr key={prog.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {prog.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{prog.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prog.hasFieldProject && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Field Project
                            </span>
                          )}
                          {prog.hasResearchProject && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Research
                            </span>
                          )}
                          {prog.hasInternship && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Internship
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {prog.level}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {prog.yearOfIntroduction || "-"}
                      </td>
                      <td className="py-3 px-4 bg-blue-50/30">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-800 text-sm">
                            {prog.enrolledStudents || 0}
                          </span>
                          <span className="text-[10px] text-gray-400">students</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {prog.coursesCount} Courses
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                          {prog.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenHistory(prog)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          title="View and manage intake for other academic years"
                        >
                          Yearly Intake
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prog)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prog.id, prog.name)}
                          className="text-gray-500 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingProgram ? "Edit Programme Details" : "Add New Programme"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Enter details and student enrollment for this academic programme
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-2 text-xs">
              <div className="space-y-1">
                <Label htmlFor="progName" className="font-semibold text-gray-700">
                  Programme Name *
                </Label>
                <Input
                  id="progName"
                  placeholder="e.g. Master of Computer Applications"
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
                  <Label htmlFor="progCode" className="font-semibold text-gray-700">
                    Programme Code *
                  </Label>
                  <Input
                    id="progCode"
                    placeholder="e.g. MCA"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                    className="text-xs border-gray-200 rounded-md uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="progLevel" className="font-semibold text-gray-700">
                    Level
                  </Label>
                  <select
                    id="progLevel"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-xs focus:outline-none"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="PhD">Doctor of Philosophy (Ph.D.)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
              </div>

              {/* Academic Year & Student Enrollment Section */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Student Enrollment & Academic Year
                  </span>
                  <span className="text-[10px] text-gray-400">NAAC Criterion 2.1</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="academicYear" className="font-semibold text-gray-700">
                      Academic Year *
                    </Label>
                    <select
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        let existingCount = "0";
                        if (editingProgram) {
                          const ex = editingProgram.allEnrollments?.find(
                            (item) => item.academicYear === newYear
                          );
                          if (ex) existingCount = ex.enrolledStudents.toString();
                        }
                        setFormData({
                          ...formData,
                          academicYear: newYear,
                          enrolledStudents: existingCount,
                        });
                      }}
                      className="w-full h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-xs focus:outline-none font-medium"
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="enrolledStudents"
                      className="font-semibold text-gray-700"
                    >
                      No. of Students Enrolled *
                    </Label>
                    <Input
                      id="enrolledStudents"
                      type="number"
                      min="0"
                      placeholder="e.g. 200"
                      value={formData.enrolledStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrolledStudents: e.target.value,
                        })
                      }
                      required
                      className="text-xs border-gray-200 rounded-md font-semibold text-blue-900"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-500">
                  Changing or editing the number for this academic year will not overwrite other academic years. Each year's data is safely preserved.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="yearIntro" className="font-semibold text-gray-700">
                    Year of Introduction
                  </Label>
                  <Input
                    id="yearIntro"
                    type="number"
                    min="1990"
                    max="2030"
                    placeholder="e.g. 2018"
                    value={formData.yearOfIntroduction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearOfIntroduction: e.target.value,
                      })
                    }
                    className="text-xs border-gray-200 rounded-md"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="progStatus" className="font-semibold text-gray-700">
                    Status
                  </Label>
                  <select
                    id="progStatus"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-700 text-xs focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* NAAC Criterion 1.3 Curriculum Components */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                    Curriculum Components
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                    NAAC Metric 1.3.3
                  </span>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={formData.hasFieldProject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasFieldProject: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">Has Field Projects</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={formData.hasResearchProject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasResearchProject: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">Has Research Projects</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={formData.hasInternship}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasInternship: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">Has Internships / Industry Immersion</span>
                  </label>
                </div>
                <p className="text-[10px] text-indigo-600/80 pt-0.5">
                  Check if this programme curriculum includes field projects, research, or internships for NAAC 1.3.3 auto-calculation.
                </p>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
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
                    : editingProgram
                    ? "Update Programme"
                    : "Add Programme"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Yearly Intake Management (History & Multi-Year View) */}
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogContent className="max-w-md bg-white rounded-xl p-6 border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Yearly Student Intake • {historyProgram?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {historyProgram?.name} — Manage enrollment count per academic session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-3">
              {/* Existing Recorded Years */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Recorded Sessions in Database
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Academic Session</th>
                        <th className="py-2 px-3">Students Enrolled</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historyProgram?.allEnrollments &&
                      historyProgram.allEnrollments.length > 0 ? (
                        historyProgram.allEnrollments.map((enr) => (
                          <tr key={enr.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 font-semibold text-gray-800">
                              {enr.academicYear}
                            </td>
                            <td className="py-2 px-3 font-bold text-blue-800">
                              {enr.enrolledStudents} students
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => {
                                  setHistoryYear(enr.academicYear);
                                  setHistoryStudents(
                                    enr.enrolledStudents.toString()
                                  );
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-3 px-3 text-center text-gray-400 text-xs"
                          >
                            No enrollment records yet. Add below.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form to Add or Update a Specific Session */}
              <form
                onSubmit={handleSaveHistoryEnrollment}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-xs"
              >
                <p className="font-semibold text-gray-800">
                  Update or Add Session Enrollment
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-semibold text-gray-700">
                      Academic Year
                    </Label>
                    <select
                      value={historyYear}
                      onChange={(e) => handleHistoryYearChange(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded-md bg-white text-gray-700 text-xs font-medium focus:outline-none"
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-semibold text-gray-700">
                      Enrolled Students
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={historyStudents}
                      onChange={(e) => setHistoryStudents(e.target.value)}
                      required
                      className="h-8 text-xs border-gray-200 rounded-md font-bold text-blue-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="text-xs h-7 rounded-md"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-7 rounded-md"
                    disabled={isSavingHistory}
                  >
                    {isSavingHistory ? "Saving..." : `Save ${historyYear} Intake`}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProgrammesView;

