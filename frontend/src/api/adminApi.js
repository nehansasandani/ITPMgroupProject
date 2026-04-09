import axiosInstance from "./axiosInstance";

export const getAdminStats = () =>
  axiosInstance.get("/admin/stats").then((r) => r.data);

export const getAdminUsers = () =>
  axiosInstance.get("/admin/users").then((r) => r.data);

export const toggleUserStatus = (id) =>
  axiosInstance.patch(`/admin/users/${id}/toggle-status`).then((r) => r.data);

export const getDisputes = () =>
  axiosInstance.get("/admin/disputes").then((r) => r.data);

export const resolveDispute = (id, action) =>
  axiosInstance
    .patch(`/admin/disputes/${id}/resolve`, { action })
    .then((r) => r.data);

export const getAnalytics = () =>
  axiosInstance.get("/admin/analytics").then((r) => r.data);