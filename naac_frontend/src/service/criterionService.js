import Request from "@/config/apiConfig";

const getSubmissions = async (params) => {
  const query = new URLSearchParams(params).toString();
  return Request({
    url: `criterion/submissions${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

const saveSubmission = async (data) =>
  Request({
    url: "criterion/save",
    method: "POST",
    data,
  });

const CriterionService = {
  getSubmissions,
  saveSubmission,
};

export default CriterionService;
