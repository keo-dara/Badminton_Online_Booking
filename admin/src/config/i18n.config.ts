import en from "../locales/en.json";
import km from "../locales/km.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  messages: {
    en,
    km,
  },
}));
