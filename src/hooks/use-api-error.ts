import { useCallback } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useI18n, type DictKey } from "@/lib/i18n";

/** Maps server error codes to translated, human messages. */
export function useApiError() {
  const { t } = useI18n();
  const message = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError) {
        const key = `err.${err.code}` as DictKey;
        const msg = t(key);
        return msg === key ? t("common.error") : msg;
      }
      return t("common.error");
    },
    [t],
  );
  const notify = useCallback((err: unknown) => toast.error(message(err)), [message]);
  return { message, notify };
}
