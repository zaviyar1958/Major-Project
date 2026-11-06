import Request from "@/config/apiConfig";

const getAllFaculty = async (params) => {
  const query = new URLSearchParams(params).toString();
  return Request({
    url: `faculty${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

const createFaculty = async (payload) =>
  Request({
    url: "faculty",
    method: "POST",
    data: payload,
  });

const updateFaculty = async (id, payload) =>
  Request({
    url: `faculty/${id}`,
    method: "PUT",
    data: payload,
  });

const deleteFaculty = async (id) =>
  Request({
    url: `faculty/${id}`,
    method: "DELETE",
  });

const FacultyService = {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};

export default FacultyService;
