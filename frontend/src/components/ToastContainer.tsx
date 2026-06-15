import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeToast } from "../slices/toastSlice";

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onRemove
}: {
  toast: { id: string; message: string; type: "success" | "error" | "info"; duration?: number };
  onRemove: () => void;
}) {
  useEffect(() => {
    if (!toast.duration) return;
    
    const timer = setTimeout(onRemove, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const bgColor =
    toast.type === "success" ? "bg-emerald-500" :
    toast.type === "error" ? "bg-rose-500" :
    "bg-blue-500";

  return (
    <div
      className={`${bgColor} text-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between animate-slide-in`}
    >
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onRemove}
        className="ml-4 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
