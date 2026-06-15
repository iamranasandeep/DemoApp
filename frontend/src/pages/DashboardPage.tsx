import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logout } from "../slices/authSlice";
import {
  createBulkMovements,
  createMovement,
  createProduct,
  fetchLiveInventory,
  fetchProducts
} from "../slices/productSlice";
import { fetchWarehouses } from "../slices/warehouseSlice";
import { StockMovementPayload } from "../types";

const categoryOptions = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Apparel" },
  { id: 3, name: "Home" },
  { id: 4, name: "Sports" },
  { id: 5, name: "Books" },
  { id: 6, name: "Health" },
  { id: 7, name: "Automotive" },
  { id: 8, name: "Food" }
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const productsState = useAppSelector((state) => state.products);
  const warehouseState = useAppSelector((state) => state.warehouses);

  const [search, setSearch] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [categoryId, setCategoryId] = useState(1);

  const [singleMovement, setSingleMovement] = useState<StockMovementPayload>({
    productId: 1,
    warehouseId: 1,
    quantity: 1,
    movementType: "IN"
  });

  const [bulkText, setBulkText] = useState("1,1,10,IN\n2,2,3,OUT");

  useEffect(() => {
    void dispatch(fetchProducts({ page: 1, limit: 30 }));
    void dispatch(fetchWarehouses());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.token) {
      navigate("/login", { replace: true });
    }
  }, [auth.token, navigate]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    void dispatch(fetchProducts({ page: 1, limit: 30, search }));
  };

  const onCreateProduct = (event: FormEvent) => {
    event.preventDefault();
    if (!productName.trim()) {
      return;
    }

    void dispatch(createProduct({ name: productName, description: productDescription, categoryId }))
      .then(() => {
        setProductName("");
        setProductDescription("");
        void dispatch(fetchProducts({ page: 1, limit: 30 }));
      });
  };

  const onSingleMovement = (event: FormEvent) => {
    event.preventDefault();
    void dispatch(createMovement(singleMovement)).then(() => {
      void dispatch(fetchLiveInventory(singleMovement.productId));
    });
  };

  const onBulkMovement = (event: FormEvent) => {
    event.preventDefault();

    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const movements: StockMovementPayload[] = lines.map((line) => {
      const [productId, warehouseId, quantity, movementType] = line.split(",").map((value) => value.trim());
      return {
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        quantity: Number(quantity),
        movementType: movementType.toUpperCase() as "IN" | "OUT"
      };
    });

    void dispatch(createBulkMovements({ movements }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Inventory Dashboard</h1>
            <p className="text-xs text-slate-500">Manage products and stock movements across 5 warehouses</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{auth.username}</span>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void dispatch(logout())}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold">Create Product</h2>
            <form className="mt-4 space-y-3" onSubmit={onCreateProduct}>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white" type="submit">
                Add Product
              </button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold">Single Product Movement</h2>
            <form className="mt-4 space-y-3" onSubmit={onSingleMovement}>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={singleMovement.productId}
                onChange={(e) => setSingleMovement({ ...singleMovement, productId: Number(e.target.value) })}
              >
                {productsState.products.slice(0, 100).map((product) => (
                  <option key={product.id} value={product.id}>{product.id} - {product.name}</option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={singleMovement.warehouseId}
                onChange={(e) => setSingleMovement({ ...singleMovement, warehouseId: Number(e.target.value) })}
              >
                {warehouseState.warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type="number"
                min={1}
                value={singleMovement.quantity}
                onChange={(e) => setSingleMovement({ ...singleMovement, quantity: Number(e.target.value) })}
              />
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={singleMovement.movementType}
                onChange={(e) => setSingleMovement({ ...singleMovement, movementType: e.target.value as "IN" | "OUT" })}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
              <button className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white" type="submit">
                Submit Movement
              </button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold">Bulk Product Movement</h2>
            <p className="mt-1 text-xs text-slate-500">Format per line: productId,warehouseId,quantity,IN|OUT</p>
            <form className="mt-4 space-y-3" onSubmit={onBulkMovement}>
              <textarea
                className="h-36 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button className="w-full rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white" type="submit">
                Submit Bulk Movements
              </button>
            </form>
          </article>
        </section>

        <section className="space-y-6 lg:col-span-8">
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Products</h2>
              <form className="flex w-80 gap-2" onSubmit={onSearch}>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product"
                />
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Search</button>
              </form>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productsState.products.map((product) => (
                <div className="rounded-xl border border-slate-200 p-3" key={product.id}>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{product.description || "No description"}</p>
                  <button
                    className="mt-3 w-full rounded-md bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700"
                    onClick={() => void dispatch(fetchLiveInventory(product.id))}
                  >
                    View Warehouse Quantities
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold">Live Inventory</h2>
            {productsState.selectedLiveInventory ? (
              <div className="mt-3">
                <p className="mb-2 text-sm font-semibold text-slate-700">Total Quantity: {productsState.selectedLiveInventory.totalQuantity}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {productsState.selectedLiveInventory.warehouses.map((warehouse) => (
                    <div className="rounded-lg border border-slate-200 px-3 py-2" key={warehouse.warehouse_id}>
                      <p className="text-sm font-medium">{warehouse.warehouse_name}</p>
                      <p className="text-xs text-slate-500">Quantity: {warehouse.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Pick a product to display warehouse-wise and total stock.</p>
            )}
          </article>

          {(productsState.actionMessage || productsState.actionError) && (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              {productsState.actionMessage && <p className="text-sm font-semibold text-emerald-700">{productsState.actionMessage}</p>}
              {productsState.actionError && <p className="text-sm font-semibold text-rose-600">{productsState.actionError}</p>}
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
