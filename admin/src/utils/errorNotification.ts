import type { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";
import type { HttpResponseError } from "~/models";

export const notificationHttpError = (
  error: any,
  notification: NotificationApiInjection
) => {
  const body = error.response._data;
  const err = body as HttpResponseError;
  notification.error({
    title: `${err.statusCode}`,
    content: `${err.message}`,
    duration: 2500,
  });
};

export const notificationSuccess = (notification: NotificationApiInjection) => {
  const { $i18n } = useNuxtApp();
  notification.success({ content: $i18n.t("success"), duration: 1000 });
};

export const mergeString = (first: string, second: string) => {
  const { locale, setLocale } = useI18n();

  if (locale.value === "km") {
    return `${first}${second}`;
  }
  return `${first} ${second}`;
};
