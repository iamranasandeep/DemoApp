import { LiveInventory } from "../types";

interface LiveInventoryModalProps {
  isOpen: boolean;
  liveInventory: LiveInventory | null;
  onClose: () => void;
}

export default function LiveInventoryModal({
  isOpen,
  liveInventory,
  onClose
}: LiveInventoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-slate-900">Live Inventory</h2>

        {liveInventory ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-slate-600">Total Quantity</p>
              <p className="text-3xl font-bold text-emerald-700">
                {liveInventory.totalQuantity}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Warehouse Breakdown</p>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {liveInventory.warehouses.map((warehouse) => (
                  <div
                    key={warehouse.warehouse_id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">
                      {warehouse.warehouse_name}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                      {warehouse.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">No inventory data available</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
