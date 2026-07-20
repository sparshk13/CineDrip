import { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { adminAPI } from '../api/client';

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-purple-400">{hint}</p>}
    </div>
  );
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const { data } = await adminAPI.analytics();
      setAnalytics(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load analytics');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users({ search, role, page, limit });
      setRows(data.data);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, role, page, limit]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAnalytics();
  }, [isAdmin, loadAnalytics]);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(loadUsers, 250);
    return () => clearTimeout(t);
  }, [isAdmin, loadUsers]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const changeRole = async (id, newRole) => {
    try {
      await adminAPI.setRole(id, newRole);
      toast.success('Role updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (!isAdmin) {
    return (
      <div className="ml-[78px] flex min-h-screen items-center justify-center bg-base text-gray-400">
        Admins only.
      </div>
    );
  }

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-12 pt-6">
      <div className="px-4">
        <h1 className="text-xl font-bold text-white">admin console</h1>
        <p className="text-xs text-gray-400">platform analytics & user management</p>
      </div>

      {analytics && (
        <div className="mt-4 grid grid-cols-2 gap-3 px-4 sm:grid-cols-4">
          <StatCard label="total users" value={analytics.totals.users} />
          <StatCard
            label="onboarded"
            value={analytics.totals.onboardedUsers}
            hint={`${analytics.onboardingRate}% rate`}
          />
          <StatCard label="admins" value={analytics.totals.adminUsers} />
          <StatCard label="watchlist items" value={analytics.totals.watchlistItems} />
        </div>
      )}

      {analytics?.topWatchlisted?.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-surface p-4 mx-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-300">top watchlisted</h2>
          <ul className="space-y-1">
            {analytics.topWatchlisted.map((m) => (
              <li key={m._id} className="flex justify-between text-xs text-gray-400">
                <span className="text-gray-200">{m.movieTitle || 'Unknown'}</span>
                <span>{m.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search username or email…"
            className="flex-1 rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          >
            <option value="">all roles</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">username</th>
                <th className="px-4 py-3 font-medium">email</th>
                <th className="px-4 py-3 font-medium">role</th>
                <th className="px-4 py-3 font-medium">onboarded</th>
                <th className="px-4 py-3 font-medium">joined</th>
                <th className="px-4 py-3 font-medium">action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    no users found
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((u) => (
                  <tr key={u._id} className="border-t border-white/5 text-gray-200">
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-white/8 text-gray-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.isOnboarded ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => changeRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/5"
                      >
                        {u.role === 'admin' ? 'demote' : 'promote'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>
            {total} users · page {page} / {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-30 hover:bg-white/5"
            >
              prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-white/10 px-3 py-1 disabled:opacity-30 hover:bg-white/5"
            >
              next
            </button>
          </div>
        </div>
      </div>

      <Sidebar />
    </div>
  );
}
