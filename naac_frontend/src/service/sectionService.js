import Request from "@/config/apiConfig";

const getAllSections = async () =>
  Request({
    url: "sections",
    method: "GET",
  });

const createSection = async (data) =>
  Request({
    url: "sections",
    method: "POST",
    data,
  });

const updateSection = async (id, data) =>
  Request({
    url: `sections/${id}`,
    method: "PUT",
    data,
  });

const deleteSection = async (id) =>
  Request({
    url: `sections/${id}`,
    method: "DELETE",
  });

const SectionService = {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
};

export default SectionService;
