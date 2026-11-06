import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import FacultyService from "@/service/facultyService";
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
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Mail,
  Filter,
  Loader2,
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

const FacultyView = () => {
  const { user } = useSelector((state) => state.auth);
  const isDept = user?.role === "department";

  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "Assistant Professor",
    qualification: "Ph.D.",
    experienceYears: "0",
    researchCount: "0",
    departmentName: "",
    departmentId: "",
  });

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (isDept && user?.departmentId) {
        params.departmentId = user.departmentId;
      } else if (selectedDept && selectedDept !== "All") {
        params.department = selectedDept;
      }
      if (search) params.search = search;

      const res = await FacultyService.getAllFaculty(params);
      if (res?.data?.success) {
        setFaculties(res.data.data.faculties || []);
        setDepartments(res.data.data.departments || []);
      }
    } catch (error) {
      toast.error("Failed to load faculty list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [selectedDept, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFaculty();
  };

  const handleOpenCreate = () => {
    setEditingFaculty(null);
    setFormData({
      name: "",
      email: "",
      designation: "Assistant Professor",
      qualification: "Ph.D.",
      experienceYears: "0",
      researchCount: "0",
      departmentName: user?.department?.name || "",
      departmentId: user?.departmentId || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name || "",
      email: faculty.email || "",
      designation: faculty.designation || "Assistant Professor",
      qualification: faculty.qualification || "Ph.D.",
      experienceYears: (faculty.experienceYears || 0).toString(),
      researchCount: (faculty.researchCount || 0).toString(),
      departmentName: faculty.department || "",
      departmentId: faculty.departmentId || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFaculty) {
        // Edit Faculty
        const payload = {
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          qualification: formData.qualification,
          experienceYears: parseInt(formData.experienceYears) || 0,
          researchCount: parseInt(formData.researchCount) || 0,
        };
        const res = await FacultyService.updateFaculty(
          editingFaculty.id,
          payload
        );
        if (res?.data?.success) {
          toast.success("Faculty member updated successfully");
          setIsDialogOpen(false);
          fetchFaculty();
        }
      } else {
        // Add Faculty
        const payload = {
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          qualification: formData.qualification,
          experienceYears: parseInt(formData.experienceYears) || 0,
          researchCount: parseInt(formData.researchCount) || 0,
          departmentId: isDept
            ? user?.departmentId
            : formData.departmentId || null,
          departmentName: isDept
            ? user?.department?.name
            : formData.departmentName || null,
        };
        const res = await FacultyService.createFaculty(payload);
        if (res?.data?.success) {
          toast.success("Faculty member added successfully");
          setIsDialogOpen(false);
          fetchFaculty();
        }
      }
    } catch (error) {
      const errMsg =
        error?.data?.message || "Failed to save faculty member";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${name}" from the faculty directory?`
      )
    ) {
      return;
    }

    try {
      const res = await FacultyService.deleteFaculty(id);
      if (res?.data?.success) {
        toast.success("Faculty member deleted");
        fetchFaculty();
      }
    } catch (error) {
      toast.error("Failed to delete faculty member");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDept
                  ? `${user?.department?.name || "Department"} Faculty`
                  : "Faculty Directory"}
              </h1>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              {isDept
                ? "Add, edit and manage teaching faculty members, designations, and research count for NAAC Criterion 2 & 3"
                : "University-wide overview of all teaching faculty registered across departments"}
            </p>
          </div>

          {isDept ? (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleOpenCreate}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold px-4 h-10 gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Faculty Member</span>
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">
              <span>Read-Only Oversight</span>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={handleSearch}
            className="flex-1 w-full flex items-center relative"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, email, or designation..."
              className="pl-11 rounded-3xl border-gray-200 bg-gray-50 h-11 text-xs focus-visible:ring-gray-300"
            />
          </form>

          {!isDept && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-2xl bg-white text-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Faculty List Table */}
        <Card className="border-gray-200 rounded-3xl shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500 gap-2 text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading faculty records...</span>
              </div>
            ) : faculties.length === 0 ? (
              <div className="text-center p-16 text-gray-500 space-y-3">
                <Users className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-base font-semibold text-gray-700">
                  No Faculty Registered Yet
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {isDept
                    ? "Click the 'Add Faculty Member' button above to add the first teaching faculty member to this department."
                    : "As Department Heads log into their Department Portals and register teachers, they will appear here automatically."}
                </p>
                {isDept && (
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold px-4 h-9 gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Faculty
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Faculty Member</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Designation</th>
                      <th className="py-4 px-6">Experience</th>
                      <th className="py-4 px-6">Research Papers</th>
                      {isDept && <th className="py-4 px-6 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {faculties.map((f) => (
                      <tr
                        key={f.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">
                            {f.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{f.email}</span>
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {f.qualification}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {f.department}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {f.designation}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {f.experienceYears} Years
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            <BookOpen className="w-3.5 h-3.5" />
                            {f.researchCount} Papers
                          </span>
                        </td>
                        {isDept && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(f)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                title="Edit Faculty"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(f.id, f.name)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                title="Delete Faculty"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add / Edit Faculty Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-3xl p-6 border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {editingFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {isDept
                  ? `Assign faculty member directly to ${
                      user?.department?.name || "your department"
                    }`
                  : "Register a teaching faculty member into the university portal"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Prof. Mohammad Shahid"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="rounded-2xl border-gray-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. shahid@manuu.edu.in"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="rounded-2xl border-gray-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="designation"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Designation
                  </Label>
                  <select
                    id="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 border border-gray-200 rounded-2xl bg-white text-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Guest Faculty">Guest Faculty</option>
                    <option value="HOD & Professor">HOD & Professor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="qualification"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Qualification
                  </Label>
                  <Input
                    id="qualification"
                    placeholder="e.g. Ph.D., M.Tech"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualification: e.target.value,
                      })
                    }
                    className="rounded-2xl border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="experienceYears"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Experience (Years)
                  </Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    placeholder="e.g. 8"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: e.target.value,
                      })
                    }
                    className="rounded-2xl border-gray-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="researchCount"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Research Publications
                  </Label>
                  <Input
                    id="researchCount"
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={formData.researchCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        researchCount: e.target.value,
                      })
                    }
                    className="rounded-2xl border-gray-200 text-xs"
                  />
                </div>
              </div>

              {!isDept && !editingFaculty && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="deptSelect"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Assign Department
                  </Label>
                  <select
                    id="deptSelect"
                    value={formData.departmentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentName: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 border border-gray-200 rounded-2xl bg-white text-gray-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isDept && (
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <p className="text-[11px] text-blue-800">
                    Will be added to:{" "}
                    <strong>{user?.department?.name || "Your Department"}</strong>
                  </p>
                </div>
              )}

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-2xl text-xs h-9"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs h-9 px-4 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : editingFaculty ? (
                    "Update Faculty"
                  ) : (
                    "Add Faculty"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FacultyView;
