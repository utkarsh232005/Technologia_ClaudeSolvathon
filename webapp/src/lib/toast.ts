import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  warning: (message: string) => {
    toast.warning(message);
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  }
};
