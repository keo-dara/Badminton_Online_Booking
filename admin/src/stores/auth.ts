import { type Auth } from "~/models";

export const useAuthStore = defineStore("auth", {
  state: () => ({ token: "", isLoading: false }),
  getters: {
    isAuth: (state) => state.token !== null && state.token !== "",
    isLoad: (state) => state.isLoading,
  },
  actions: {
    async initToken() {
      const cookie = useCookie("token");
      const token = cookie.value;

      if (token) {
        this.token = token as string | "";
      }

      return this.token;
    },

    async login(username: string, password: string, authCode?: string) {
      const res: Auth = await $fetch(
        `/api/auth/login`,
        {
          method: "POST",
          body: {
            username,
            password,
            authCode,
          },
        }
      );
      // 
      this.token = res.accessToken;
      const cookie = useCookie("token");
      cookie.value = res.accessToken;

      if (username === "root") {
        await navigateTo("/user");
      } else {
        await navigateTo("/");
      }
    },
    async logout() {
      const router = useRouter();
      this.token = "";
      router.replace("/");
      const cookie = useCookie("token");
      cookie.value = "";
    },
  },
});
