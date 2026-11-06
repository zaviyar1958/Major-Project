import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Dashboard from "../views/dashboard/dashboard";
import DepartmentDashboard from "../views/dashboard/departmentDashboard";
import SchoolsView from "../views/schools";
import DepartmentsView from "../views/departments";
import SectionsView from "../views/sections";
import FacultyView from "../views/faculty";
import ProgrammesView from "../views/programmes";
import CoursesView from "../views/courses";
import Criterion1_1 from "../views/criterion/criterion1_1";
import Criterion1_2 from "../views/criterion/criterion1_2";
import Criterion1_3 from "../views/criterion/criterion1_3";
import Criterion1_4 from "../views/criterion/criterion1_4";
import Criterion4_1 from "../views/criterion/criterion4_1";
import PlaceholderView from "../views/placeholder";
import { useSelector } from "react-redux";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, [user]);

  const isDept = user?.role === "department";

  return (
    <div className="bg-white flex flex-row h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={isDept ? <DepartmentDashboard /> : <Dashboard />}
          />
          <Route
            path="/dashboard"
            element={isDept ? <DepartmentDashboard /> : <Dashboard />}
          />
          <Route
            path="/schools"
            element={isDept ? <DepartmentDashboard /> : <SchoolsView />}
          />
          <Route
            path="/departments"
            element={isDept ? <DepartmentDashboard /> : <DepartmentsView />}
          />
          <Route
            path="/sections"
            element={isDept ? <DepartmentDashboard /> : <SectionsView />}
          />
          <Route path="/faculty" element={<FacultyView />} />
          <Route path="/programmes" element={<ProgrammesView />} />
          <Route path="/courses" element={<CoursesView />} />
          <Route path="/criterion/1/1" element={<Criterion1_1 />} />
          <Route path="/criterion/1/2" element={<Criterion1_2 />} />
          <Route path="/criterion/1/3" element={<Criterion1_3 />} />
          <Route path="/criterion/1/4" element={<Criterion1_4 />} />
          <Route path="/criterion/4/1" element={<Criterion4_1 />} />
          <Route path="/criterion/*" element={<PlaceholderView />} />
          <Route
            path="*"
            element={isDept ? <DepartmentDashboard /> : <Dashboard />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
