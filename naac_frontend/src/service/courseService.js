import Request from "@/config/apiConfig";

const getAllCourses = async (params) => {
  const query = new URLSearchParams(params).toString();
  return Request({
    url: `courses${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

const createCourse = async (payload) =>
  Request({
    url: "courses",
    method: "POST",
    data: payload,
  });

const updateCourse = async (id, payload) =>
  Request({
    url: `courses/${id}`,
    method: "PUT",
    data: payload,
  });

const deleteCourse = async (id) =>
  Request({
    url: `courses/${id}`,
    method: "DELETE",
  });

const CourseService = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};

export default CourseService;
