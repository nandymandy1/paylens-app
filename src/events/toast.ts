import mitt from "mitt";

export type ToastTone = "success" | "error" | "warning" | "info";

export type ToastPayload = {
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastEvents = {
  show: ToastPayload;
};

const toastEvents = mitt<ToastEvents>();

export const showToast = (payload: ToastPayload) => {
  toastEvents.emit("show", payload);
};

export default toastEvents;
