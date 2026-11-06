import Request from "@/config/apiConfig";

const getAllSchools = async () =>
  Request({
    url: "schools",
    method: "GET",
  });

const createSchool = async (data) =>
  Request({
    url: "schools",
    method: "POST",
    data,
  });

const updateSchool = async (id, data) =>
  Request({
    url: `schools/${id}`,
    method: "PUT",
    data,
  });

const deleteSchool = async (id) =>
  Request({
    url: `schools/${id}`,
    method: "DELETE",
  });

const SchoolService = {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
};

export default SchoolService;
