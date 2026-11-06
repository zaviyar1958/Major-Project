import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FolderTree,
  Layers,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  Construction,
} from "lucide-react";

const getModuleInfo = (pathname) => {
  if (pathname.includes("/schools")) {
    return {
      title: "School Management",
      category: "Academic Hierarchy",
      icon: Building2,
      description:
        "Manage university schools (e.g. School of Technology, School of Sciences, School of Languages) and assign Deans.",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    };
  }
  if (pathname.includes("/departments")) {
    return {
      title: "Department Management",
      category: "Academic Hierarchy",
      icon: FolderTree,
      description:
        "Register university departments, assign HODs, manage departmental login credentials, and track departmental NAAC contributions.",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
  }
  if (pathname.includes("/sections")) {
    return {
      title: "Section Management",
      category: "Administrative Hierarchy",
      icon: Layers,
      description:
        "Manage central university administrative and academic sections (Academic Section, Examination Branch, IQAC Secretariat, Library, Accounts).",
      color: "bg-purple-50 text-purple-600 border-purple-200",
    };
  }
  if (pathname.includes("/criterion/")) {
    const parts = pathname.split("/criterion/")[1]?.split("/") || [];
    const critNum = parts[0] || "1";
    const subNum = parts[1] ? `.${parts[1]}` : "";
    return {
      title: `NAAC Criterion ${critNum}${subNum} Assessment`,
      category: "NAAC 7 Criteria Framework",
      icon: FileText,
      description:
        "Quantitative (QnM) and Qualitative (QlM) metrics collection, document proof uploads (SSR), and DVV validation for this indicator.",
      color: "bg-amber-50 text-amber-600 border-amber-200",
    };
  }

  return {
    title: "Module Under Setup",
    category: "System Module",
    icon: Construction,
    description: "This section is defined in the navigation hierarchy.",
    color: "bg-gray-50 text-gray-600 border-gray-200",
  };
};

const PlaceholderView = () => {
  const location = useLocation();
  const info = getModuleInfo(location.pathname);
  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${info.color}`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {info.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                  {info.title}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{info.description}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5" />
              UI Scaffold Ready
            </div>
          </div>
        </div>

        {/* Structure Preview Card */}
        <Card className="border-gray-200 rounded-3xl shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center border border-gray-200 text-gray-400">
              <Construction className="w-8 h-8 text-gray-500" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                Structure Created in Navigation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Aapke order ke anusaar humne sidebar me <strong>{info.title}</strong>{" "}
                ka route aur hierarchy bana di hai. Ab hum step-by-step isme
                forms aur working logic connect karenge!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderView;
