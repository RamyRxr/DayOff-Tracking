import { Dialog } from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function SuccessModal({ isOpen, title, message, onConfirm }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onConfirm} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0B1120] p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-semibold text-[#111827] dark:text-[#E8EFF8]">
            {title}
          </Dialog.Title>
          {message && (
            <p className="mt-2 text-sm text-[#6B7280] dark:text-[#7A9CC4]">
              {message}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90"
            >
              {t("ok")}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
