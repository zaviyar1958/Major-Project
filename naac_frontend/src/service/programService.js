import Request from "@/config/apiConfig";

const getAllPrograms = async (params) => {
  const query = new URLSearchParams(params).toString();
  return Request({
    url: `programs${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

const createProgram = async (payload) =>
  Request({
    url: "programs",
    method: "POST",
    data: payload,
  });

const updateProgram = async (id, payload) =>
  Request({
    url: `programs/${id}`,
    method: "PUT",
    data: payload,
  });

const deleteProgram = async (id) =>
  Request({
    url: `programs/${id}`,
    method: "DELETE",
  });

const ProgramService = {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
};

export default ProgramService;
