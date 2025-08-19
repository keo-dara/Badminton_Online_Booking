import type { User } from "~/models";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    profile: {} as User,
    themeDark: false,
  }),
  actions: {
    async fetchMe(): Promise<User> {
      const authStore = useAuthStore();
      const res: User = await $fetch(
        `/api/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      this.profile = res;
      return res;
    },
    async updateProfile(): Promise<User> {
      const authStore = useAuthStore();
      const res: User = await $fetch(
        `/api/auth/me`,
        {
          method: "PATCH",
          body: {
            profilePicture: this.$state.profile.profilePicture,
          },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      return res;
    },
    async loadTheme() {
      const theme = useCookie("theme");
      this.themeDark = !!theme.value;
    },
    async saveTheme() {
      const theme = useCookie("theme");

      if (theme.value) {
        theme.value = null;
      } else {
        theme.value = "1";
      }
    },
    async loadLang() {
      const theme = useCookie("lang");
      return theme;
    },
    async setLang(lang: string) {
      const theme = useCookie("lang");
      theme.value = lang;
    },
  },
});
