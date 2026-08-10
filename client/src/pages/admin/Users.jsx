import { useState, useEffect } from "react";
import { Ban, CheckCircle, Trash2 } from "lucide-react";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import * as userService from "../../services/userService";

const ROLE_VARIANT = { admin: "brand", staff: "amber", user: "neutral" };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleBlock = async (user) => {
    setBusyId(user._id);
    try {
      await userService.toggleBlockUser(user._id, !user.isActive);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not update user.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (user, role) => {
    setBusyId(user._id);
    try {
      await userService.updateUserRole(user._id, role);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Could not update role.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete user.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950">Users</h1>
      <p className="mt-1 text-sm text-ink-500">{users.length} registered users</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        {loading ? (
          <Spinner fullPage label="Loading users" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" />
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-ink-950">{u.username}</td>
                  <td className="px-4 py-3 text-ink-500">{u.email}</td>
                  <td className="px-4 py-3 text-ink-500">{u.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u._id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-white px-2 text-xs focus:border-brand-500 focus:outline-none"
                    >
                      <option value="user">user</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isVerified ? "success" : "danger"}>
                      {u.isVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={u.isActive ? "success" : "danger"}>
                      {u.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggleBlock(u)}
                        disabled={busyId === u._id}
                        title={u.isActive ? "Block user" : "Unblock user"}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950 disabled:opacity-50"
                      >
                        {u.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;