import { useAuthStore } from "~/stores";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const cookie = useCookie("token");
  const token = cookie.value;

  if (!token && to.path !== "/login") {
    return navigateTo("/login");
  }

  // If token exists and user is trying to access login page, redirect to home
  if (token && to.path === "/login") {
    return navigateTo("/");
  }

  // For all other cases, allow the navigation to proceed
  return;
});
