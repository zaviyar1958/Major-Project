import React, { useState, useEffect } from "react";
import DepartmentService from "@/service/departmentService";
import SchoolService from "@/service/schoolService";
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
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Mail,
  User,
  Key,
  GraduationCap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

const DepartmentsView = () => {
  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    schoolId: "",
    hodName: "",
    email: "",
    password: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, schoolRes] = await Promise.all([
        DepartmentService.getAllDepartments(),
        SchoolService.getAllSchools(),
      ]);

      if (deptRes?.data?.success) setDepartments(deptRes.data.data);
      if (schoolRes?.data?.success) setSchools(schoolRes.data.data);
    } catch (error) {
      toast.error("Failed to load departments and schools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      schoolId: schools[0]?.id ? schools[0].id.toString() : "",
      hodName: "",
      email: "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      schoolId: dept.schoolId ? dept.schoolId.toString() : "",
      hodName: dept.hodName || "",
      email: dept.email,
      password: "", // Leave blank unless changing
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.schoolId || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!editingDept && !formData.password) {
      toast.error("Please provide an initial password for HOD login");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDept) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await DepartmentService.updateDepartment(editingDept.id, payload);
        if (res?.data?.success) {
          toast.success("Department and credentials updated!");
          setIsDialogOpen(false);
          fetchData();
        }
      } else {
        const res = await DepartmentService.createDepartment(formData);
        if (res?.data?.success) {
          toast.success("Department & HOD login credentials created successfully!");
          setIsDialogOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? Its HOD login account will also be removed.`)) return;

    try {
      const res = await DepartmentService.deleteDepartment(id);
      if (res?.data?.success) {
        toast.success("Department and login credentials deleted");
        setDepartments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Academic Departments</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Manage departments, link to schools, and generate HOD login credentials for NAAC reporting
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-3xl px-5 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Department
          </Button>
        </div>

        {/* Departments Table */}
        <Card className="border-gray-200 rounded-3xl shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading departments from PostgreSQL...</span>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center p-12 text-gray-500 space-y-2">
                <FolderTree className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-medium">No departments registered yet</p>
                <p className="text-xs">Click "Add New Department" to create a department and its HOD account.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Department & Code</th>
                      <th className="py-4 px-6">Parent School</th>
                      <th className="py-4 px-6">Head of Department (HOD)</th>
                      <th className="py-4 px-6">HOD Login Credentials</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{dept.name}</div>
                          <span className="inline-block mt-0.5 text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {dept.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Building2 className="w-3.5 h-3.5" />
                            {dept.schoolName || "Unlinked"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{dept.hodName || "HOD Not Assigned"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-mono">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>{dept.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active Login Account</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(dept)}
                            className="text-gray-600 hover:text-gray-900 rounded-2xl h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Add / Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingDept ? "Edit Department" : "Add New Department & Generate Login"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Registers the department under its School and generates HOD credentials for NAAC reporting.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Department Name *</Label>
                <Input
                  required
                  placeholder="e.g. Department of Computer Science & IT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Department Code *</Label>
                  <Input
                    required
                    placeholder="e.g. CSIT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="rounded-2xl border-gray-200 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Parent School *</Label>
                  <select
                    required
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="" disabled>Select School</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Head of Department (HOD) Name</Label>
                <Input
                  placeholder="e.g. Dr. Abdul Wahid"
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              {/* Login Credentials Section */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <Key className="w-3.5 h-3.5" />
                  <span>HOD Portal Login Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Login Email *</Label>
                    <Input
                      required
                      type="email"
                      placeholder="hod.cs@manuu.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-gray-200 bg-white h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">
                      {editingDept ? "Password (Leave blank to keep current)" : "Password *"}
                    </Label>
                    <Input
                      type="text"
                      placeholder={editingDept ? "Unchanged" : "e.g. cs@manuu123"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="rounded-xl border-gray-200 bg-white h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-2xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Department"
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

export default DepartmentsView;
