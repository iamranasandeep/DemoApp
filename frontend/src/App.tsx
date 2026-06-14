import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./slices/authSlice";
import { fetchLiveInventory, fetchProducts } from "./slices/productSlice";
import { AppDispatch, RootState } from "./store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const productsState = useSelector((state: RootState) => state.products);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
  }, [dispatch]);

  const onLogin = (event: FormEvent) => {
    event.preventDefault();
    void dispatch(login({ username, password }));
  };

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    void dispatch(fetchProducts({ page: 1, limit: 20, search }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 text-slate-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 rounded-xl bg-brand-700 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">Inventory Management System</h1>
          <p className="mt-2 text-sm">Multi-warehouse visibility, stock movements, and product history</p>
        </header>

        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          {!auth.token ? (
            <form className="grid gap-3 md:grid-cols-4" onSubmit={onLogin}>
              <input className="rounded border p-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
              <input
                className="rounded border p-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
              <button className="rounded bg-brand-500 px-4 py-2 text-white" type="submit" disabled={auth.loading}>
                Login
              </button>
              {auth.error && <p className="text-red-600">{auth.error}</p>}
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <p>Logged in as {auth.username}</p>
              <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => void dispatch(logout())}>
                Logout
              </button>
            </div>
          )}
        </section>

        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <form className="mb-4 flex gap-3" onSubmit={onSearch}>
            <input className="w-full rounded border p-2" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product" />
            <button className="rounded bg-brand-500 px-4 py-2 text-white" type="submit">
              Search
            </button>
          </form>

          <h2 className="mb-3 text-lg font-semibold">Products</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {productsState.products.map((product) => (
              <div className="rounded border p-3" key={product.id}>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-slate-600">{product.description}</p>
                <button
                  className="mt-3 rounded bg-slate-100 px-3 py-1 text-sm"
                  onClick={() => void dispatch(fetchLiveInventory(product.id))}
                >
                  View Live Inventory
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-3 text-lg font-semibold">Live Inventory</h2>
          {productsState.selectedLiveInventory ? (
            <div>
              <p className="mb-3 font-medium">Total Quantity: {productsState.selectedLiveInventory.totalQuantity}</p>
              <ul className="grid gap-2 md:grid-cols-2">
                {productsState.selectedLiveInventory.warehouses.map((warehouse) => (
                  <li className="rounded border p-2" key={warehouse.warehouse_id}>
                    {warehouse.warehouse_name}: {warehouse.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Select a product to inspect warehouse-wise quantity.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
