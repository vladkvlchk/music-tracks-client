import { CheckCircle } from "lucide-react";

export const ToastSuccess = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div
    data-testid="toast-success"
    className="flex w-full max-w-sm items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 shadow-lg dark:border-green-800 dark:bg-green-950 dark:text-green-100"
  >
    <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 dark:text-green-400" />
    <div>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-green-700 dark:text-green-300">
        {message}
      </div>
    </div>
  </div>
);
