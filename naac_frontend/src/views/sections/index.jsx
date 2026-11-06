import React, { useState, useEffect } from "react";
import SectionService from "@/service/sectionService";
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
  Layers,
  Plus,
  Trash2,
  Edit2,
  Mail,
  User,
  Key,
  CheckCircle2,
  Building2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const SectionsView = () => {
  const [sections, setSections] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSec, setEditingSec] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    schoolName: "School of Sciences",
    inchargeName: "",
    email: "",
    password: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [secRes, schoolRes] = await Promise.all([
        SectionService.getAllSections(),
        SchoolService.getAllSchools(),
      ]);

      if (secRes?.data?.success) setSections(secRes.data.data);
      if (schoolRes?.data?.success) setSchools(schoolRes.data.data);
    } catch (error) {
      toast.error("Failed to load sections and schools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingSec(null);
    setFormData({
      name: "",
      code: "",
      schoolName: "School of Sciences",
      inchargeName: "",
      email: "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sec) => {
    setEditingSec(sec);
    setFormData({
      name: sec.name,
      code: sec.code,
      schoolName: sec.schoolName || "School of Sciences",
      inchargeName: sec.inchargeName || "",
      email: sec.email,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!editingSec && !formData.password) {
      toast.error("Please provide an initial login password");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSec) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        const res = await SectionService.updateSection(editingSec.id, payload);
        if (res?.data?.success) {
          toast.success("Section and credentials updated!");
          setIsDialogOpen(false);
          fetchData();
        }
      } else {
        const res = await SectionService.createSection(formData);
        if (res?.data?.success) {
          toast.success("Section and login credentials created successfully!");
          setIsDialogOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? Its login account will also be removed.`)) return;

    try {
      const res = await SectionService.deleteSection(id);
      if (res?.data?.success) {
        toast.success("Section deleted successfully");
        setSections((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 border border-purple-200 rounded-2xl flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Academic Sections & Wings</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Manage school-affiliated academic sections (Botany, Chemistry, Physics, Zoology) and generate logins
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-3xl px-5 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Section
          </Button>
        </div>

        {/* Sections Table */}
        <Card className="border-gray-200 rounded-3xl shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading sections from PostgreSQL...</span>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center p-12 text-gray-500 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-gray-300" />
                <p className="font-medium">No sections registered yet</p>
                <p className="text-xs">Click "Add New Section" to create an academic section.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Section Name & Code</th>
                      <th className="py-4 px-6">Parent School</th>
                      <th className="py-4 px-6">Section Head / In-Charge</th>
                      <th className="py-4 px-6">Login Account</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {sections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{sec.name}</div>
                          <span className="inline-block mt-0.5 text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {sec.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Building2 className="w-3.5 h-3.5" />
                            {sec.schoolName || "School of Sciences"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{sec.inchargeName || "Not currently listed"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-mono">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>{sec.email}</span>
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
                            onClick={() => handleOpenEdit(sec)}
                            className="text-gray-600 hover:text-gray-900 rounded-2xl h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sec.id, sec.name)}
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
                {editingSec ? "Edit Section" : "Add New Section & Generate Login"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm">
                Registers the academic section under its parent School and generates login credentials.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Section Name *</Label>
                <Input
                  required
                  placeholder="e.g. Botany Section"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Section Code *</Label>
                  <Input
                    required
                    placeholder="e.g. BOT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="rounded-2xl border-gray-200 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Parent School *</Label>
                  <select
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Section Head</Label>
                <Input
                  placeholder="e.g. Not currently listed"
                  value={formData.inchargeName}
                  onChange={(e) => setFormData({ ...formData, inchargeName: e.target.value })}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              {/* Login Credentials Section */}
              <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-purple-800 text-xs font-bold">
                  <Key className="w-3.5 h-3.5" />
                  <span>Section Portal Login Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Username or Email *</Label>
                    <Input
                      required
                      placeholder="e.g. manuu.botany"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-gray-200 bg-white h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">
                      {editingSec ? "Password (Leave blank to keep)" : "Password *"}
                    </Label>
                    <Input
                      type="text"
                      placeholder={editingSec ? "Unchanged" : "e.g. 123456"}
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
                    "Save Section"
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

export default SectionsView;
