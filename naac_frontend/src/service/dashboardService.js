import Request from "@/config/apiConfig";

const getMetrics = async (academicYear = "2024-25") =>
  Request({
    url: `dashboard/metrics?academicYear=${academicYear}`,
    method: "GET",
  });

const updateCriterion = async (id, score) =>
  Request({
    url: `dashboard/criteria/${id}`,
    method: "PUT",
    data: { score },
  });

const DashboardService = {
  getMetrics,
  updateCriterion,
};

export default DashboardService;
