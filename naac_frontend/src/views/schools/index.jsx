import React, { useState, useEffect } from "react";
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
  Building2,
  Plus,
  Trash2,
  Edit2,
  FolderTree,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const SchoolsView = () => {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    deanName: "",
    deanEmail: "",
  });

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const res = await SchoolService.getAllSchools();
      if (res?.data?.success) {
        setSchools(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleOpenCreate = () => {
    setEditingSchool(null);
    setFormData({ name: "", code: "", deanName: "", deanEmail: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      deanName: school.deanName || "",
      deanEmail: school.deanEmail || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error("School name and code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSchool) {
        const res = await SchoolService.updateSchool(editingSchool.id, formData);
        if (res?.data?.success) {
          toast.success("School updated successfully");
          setIsDialogOpen(false);
          fetchSchools();
        }
      } else {
        const res = await SchoolService.createSchool(formData);
        if (res?.data?.success) {
          toast.success("School created successfully");
          setIsDialogOpen(false);
          fetchSchools();
        }
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save school");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All associated departments will also be affected.`)) return;

    try {
      const res = await SchoolService.deleteSchool(id);
      if (res?.data?.success) {
        toast.success("School deleted successfully");
        setSchools((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete school");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Schools of Study</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Manage university faculties/schools grouping departments under Dean oversight
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-3xl px-5 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New School
          </Button>
        </div>

        {/* Schools Table */}
        <Card className="border-gray-200 rounded-3xl shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading schools...</span>
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center p-12 text-gray-500 space-y-2">
                <Building2 className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-medium">No schools registered yet</p>
                <p className="text-xs">Click "Add New School" to create the first university school.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">School Name & Code</th>
                      <th className="py-4 px-6">Dean of the School</th>
                      <th className="py-4 px-6">Dean Email</th>
                      <th className="py-4 px-6">Departments</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{school.name}</div>
                          <span className="inline-block mt-0.5 text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {school.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{school.deanName || "Not Appointed"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {school.deanEmail ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{school.deanEmail}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {school.departmentsCount || 0}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(school)}
                            className="text-gray-600 hover:text-gray-900 rounded-2xl h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(school.id, school.name)}
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
          <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingSchool ? "Edit School" : "Add New School"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Enter school details. Schools serve as academic faculty groups for departments.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">School Name *</Label>
                <Input
                  required
                  placeholder="e.g. School of Computer Science & IT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">School Code *</Label>
                <Input
                  required
                  placeholder="e.g. SCSIT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="rounded-2xl border-gray-200 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Dean Full Name</Label>
                <Input
                  placeholder="e.g. Prof. Syed Mohammad Rahat"
                  value={formData.deanName}
                  onChange={(e) => setFormData({ ...formData, deanName: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Dean Email Address</Label>
                <Input
                  type="email"
                  placeholder="dean.tech@manuu.edu.in"
                  value={formData.deanEmail}
                  onChange={(e) => setFormData({ ...formData, deanEmail: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              <DialogFooter className="pt-4 flex gap-2 justify-end">
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
                    "Save School"
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

export default SchoolsView;
