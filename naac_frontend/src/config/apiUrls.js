const apiUrls = {
  base_url: import.meta.env.VITE_API_URL,
  login: "login",
  register: "register",
  user: "user",
  ViewAllUser: "view-all-user",
  ForgotPassword:'forgot-password',
  ResetPassword:'reset-password',
  onboard:'onboard',
  notices: "notices",
  noticeById: (id) => `notices/${id}`,
  recentNotices: "notices/recent",
  markNoticeAsOld: (id) => `notices/${id}/mark-old`,
  bulkDeleteNotices: "notices/bulk",
  testimonials: "testimonials",
};

export default apiUrls;