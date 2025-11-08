import { toast } from "react-toastify";

export function showError(message?: string) {
  toast.error(message ?? "Something went wrong", {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
}

export function showSuccess(message?: string) {
  toast.success(message ?? "Done", {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
}

export function showInfo(message: string) {
  toast.info(message, {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
}

export function showWarning(message: string) {
  toast.warning(message, {
    position: "bottom-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
}

export default { showError, showSuccess, showInfo, showWarning };
