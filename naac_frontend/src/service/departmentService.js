import Request from "@/config/apiConfig";

const getAllDepartments = async (schoolId) =>
  Request({
    url: `departments${schoolId ? `?schoolId=${schoolId}` : ""}`,
    method: "GET",
  });

const createDepartment = async (data) =>
  Request({
    url: "departments",
    method: "POST",
    data,
  });

const updateDepartment = async (id, data) =>
  Request({
    url: `departments/${id}`,
    method: "PUT",
    data,
  });

const deleteDepartment = async (id) =>
  Request({
    url: `departments/${id}`,
    method: "DELETE",
  });

const DepartmentService = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

export default DepartmentService;
