import { AlertCircle, CheckCircle2 } from "lucide-react";

type ToastTone = "success" | "error";

export function Toast({
  message,
  tone,
}: {
  message: string;
  tone: ToastTone;
}) {
  if (!message) {
    return null;
  }

  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`fixed right-4 top-20 z-50 flex max-w-sm gap-3 rounded-md border p-4 text-sm shadow-lg ${toneClasses}`}
      role="status"
    >
      <Icon className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
