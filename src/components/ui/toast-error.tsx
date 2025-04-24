import { AlertCircle } from "lucide-react";

export const ToastError = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div
    data-testid="toast-error"
    className="flex w-full max-w-sm items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-lg dark:border-red-800 dark:bg-red-950 dark:text-red-100"
  >
    <AlertCircle className="h-5 w-5 mt-0.5 text-red-500 dark:text-red-400" />
    <div>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-red-700 dark:text-red-300">
        {message}
      </div>
    </div>
  </div>
);
