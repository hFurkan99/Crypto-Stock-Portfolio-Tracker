import { useTranslation } from "@/lib/useTranslation";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "warning",
}: ConfirmModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      gradient: "from-red-500 to-red-600",
      glow: "bg-red-500/20",
      button:
        "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-600/30 hover:shadow-red-600/50 border-red-500/20",
      ring: "ring-red-500/20",
    },
    warning: {
      gradient: "from-yellow-500 to-yellow-600",
      glow: "bg-yellow-500/20",
      button:
        "from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-yellow-600/30 hover:shadow-yellow-600/50 border-yellow-500/20",
      ring: "ring-yellow-500/20",
    },
    success: {
      gradient: "from-green-500 to-green-600",
      glow: "bg-green-500/20",
      button:
        "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-600/30 hover:shadow-green-600/50 border-green-500/20",
      ring: "ring-green-500/20",
    },
  };

  const styles = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Decorative gradient */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${styles.glow} rounded-full blur-3xl pointer-events-none`}
        ></div>

        {/* Fixed Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <h3
            className={`text-lg sm:text-xl font-bold bg-linear-to-r ${styles.gradient} bg-clip-text text-transparent flex items-center gap-2`}
          >
            <div
              className={`w-2 h-2 rounded-full bg-linear-to-r ${styles.gradient} animate-pulse`}
            ></div>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-all active:scale-95 text-muted-foreground hover:text-foreground shrink-0 ml-4"
          >
            <span className="text-xl font-light">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto flex-1 px-6 py-6">
          <p className="text-base text-foreground/80 leading-relaxed p-4 rounded-xl bg-muted/30 border border-border/30">
            {message}
          </p>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border/50 text-sm sm:text-base font-semibold hover:bg-muted/50 transition-all active:scale-95"
          >
            {cancelText || t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl bg-linear-to-br ${styles.button} text-white text-sm sm:text-base font-semibold transition-all active:scale-95 border`}
          >
            {confirmText || t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
