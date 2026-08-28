import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Trash2, Key, Plus } from "lucide-react";

/* ================= TYPES & SCHEMAS ================= */

const adminSchema = z
  .object({
    admin_name: z.string().min(2, "Name required"),
    admin_role: z.enum(["major_admin", "whole_admin", "whole_organizer"]),
    major_id: z.string().optional(),
    gmail: z.string().email("Valid email required"),
    password: z.string().min(4, "Min 4 characters"),
  })
  .refine(
    (data) => {
      if (data.admin_role === "major_admin") {
        return !!data.major_id && data.major_id !== "";
      }
      return true;
    },
    {
      message: "Major selection required for Major Admin",
      path: ["major_id"],
    }
  );

const majorSchema = z.object({
  major: z.string().min(2, "Major required"),
});

type AdminFormData = z.infer<typeof adminSchema>;
type MajorFormData = z.infer<typeof majorSchema>;

interface Major {
  major_id: number;
  major: string;
}

interface AdminAccount {
  admin_id: number;
  admin_name: string;
  admin_role: string;
  major?: string;
  admin_gmail: string;
}

/* ================= COMPONENT ================= */

const Developer: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);

  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    watch: watchAdmin,
    reset: resetAdmin,
    formState: { errors: adminErrors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      admin_role: "major_admin",
    },
  });

  const {
    register: registerMajor,
    handleSubmit: handleMajorSubmit,
    reset: resetMajor,
    formState: { errors: majorErrors },
  } = useForm<MajorFormData>({
    resolver: zodResolver(majorSchema),
  });

  const selectedRole = watchAdmin("admin_role");

  /* ================= DATA FETCHING ================= */

  const loadMajors = async () => {
    try {
      const res = await fetch("/api/developer/majors", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setMajors(data.majors || []);
      else alert(data.detail || "Unable to load majors");
    } catch {
      alert("Failed to fetch majors");
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/developer/accounts", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setAccounts(data.accounts || []);
      else alert(data.detail || "Unable to load admin accounts");
    } catch {
      alert("Failed to fetch accounts");
    }
  };

  const refreshData = async () => {
    await Promise.all([loadMajors(), loadAccounts()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  /* ================= HANDLERS ================= */

  const onAddMajor = async (data: MajorFormData) => {
    const fd = new FormData();
    fd.append("major", data.major);

    const res = await fetch("/api/developer/majors", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const resData = await res.json();

    if (!res.ok) {
      alert(resData.detail);
      return;
    }

    resetMajor();
    refreshData();
  };

  const onDeleteMajor = async (majorId: number) => {
    if (!window.confirm("Delete this major?")) return;

    const res = await fetch(`/api/developer/majors/${majorId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail);
      return;
    }

    refreshData();
  };

  const onCreateAdmin = async (data: AdminFormData) => {
    const fd = new FormData();
    fd.append("admin_name", data.admin_name);
    fd.append("admin_role", data.admin_role);
    fd.append("gmail", data.gmail);
    fd.append("password", data.password);

    if (data.admin_role === "major_admin" && data.major_id) {
      fd.append("major_id", data.major_id);
    }

    const res = await fetch("/api/developer/accounts", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const resData = await res.json();

    if (!res.ok) {
      alert(resData.detail);
      return;
    }

    resetAdmin();
    refreshData();
  };

  const onChangePassword = async (account: AdminAccount) => {
    const newPassword = prompt("Enter a new password (minimum 8 characters):");
    if (!newPassword) return;

    const fd = new FormData();
    fd.append("admin_name", account.admin_name);
    fd.append("gmail", account.admin_gmail);
    fd.append("password", newPassword);

    const res = await fetch(`/api/developer/accounts/${account.admin_id}`, {
      method: "PUT",
      body: fd,
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail);
      return;
    }

    alert("Password changed successfully. It cannot be changed again today.");
  };

  const onDeleteAccount = async (adminId: number) => {
    if (!window.confirm("Delete this admin account?")) return;

    const res = await fetch(`/api/developer/accounts/${adminId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.detail);
      return;
    }

    refreshData();
  };

  return (
    <div className="min-h-screen --background text-[#182033]">
      <div className="max-w-[1120px] mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Major Management */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] shadow-sm space-y-4">
            <h2 className="text-xl font-bold">Majors</h2>

            <form onSubmit={handleMajorSubmit(onAddMajor)} className="space-y-3">
              <input
                {...registerMajor("major")}
                placeholder="Major name"
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white"
              />
              {majorErrors.major && (
                <p className="text-red-500 text-sm">{majorErrors.major.message}</p>
              )}
              <button
                type="submit"
                className="green-bg text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-slate-800 cursor-pointer"
              >
                <Plus size={16} /> Add Major
              </button>
            </form>

            {/* Render table only if majors exist */}
            {majors.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#edf0f5]">
                      <th className="p-3">Major</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {majors.map((m) => (
                      <tr key={m.major_id} className="border-b border-[#edf0f5]">
                        <td className="p-3">{m.major}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => onDeleteMajor(m.major_id)}
                            className="bg-[#b42318] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-red-700 text-sm cursor-pointer"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Admin Account Management */}
          <div className="bg-white border border-[#e7ebf2] rounded-[20px] p-[22px] shadow-sm space-y-4">
            <h2 className="text-xl font-bold">Admin Accounts</h2>

            <form onSubmit={handleAdminSubmit(onCreateAdmin)} className="space-y-3">
              <input
                {...registerAdmin("admin_name")}
                placeholder="Display name"
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white"
              />
              {adminErrors.admin_name && (
                <p className="text-red-500 text-sm">{adminErrors.admin_name.message}</p>
              )}

              <select
                {...registerAdmin("admin_role")}
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white"
              >
                <option value="major_admin">Major Admin (also organizes own major)</option>
                <option value="whole_admin">Whole Admin (candidate management only)</option>
                <option value="whole_organizer">Whole Organizer (start/end Whole only)</option>
              </select>

              <select
                {...registerAdmin("major_id")}
                disabled={selectedRole !== "major_admin"}
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <option value="">Select Major</option>
                {majors.map((m) => (
                  <option key={m.major_id} value={m.major_id}>
                    {m.major}
                  </option>
                ))}
              </select>
              {adminErrors.major_id && (
                <p className="text-red-500 text-sm">{adminErrors.major_id.message}</p>
              )}

              <input
                {...registerAdmin("gmail")}
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white"
              />
              {adminErrors.gmail && (
                <p className="text-red-500 text-sm">{adminErrors.gmail.message}</p>
              )}

              <input
                {...registerAdmin("password")}
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-[#d6dbe5] rounded-lg bg-white"
              />
              {adminErrors.password && (
                <p className="text-red-500 text-sm">{adminErrors.password.message}</p>
              )}

              <button
                type="submit"
                className="green-bg text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Create Account
              </button>
            </form>

            {/* Render table only if accounts exist */}
            {accounts.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#edf0f5]">
                      <th className="p-3">Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Major</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr key={acc.admin_id} className="border-b border-[#edf0f5]">
                        <td className="p-3">{acc.admin_name}</td>
                        <td className="p-3">{acc.admin_role}</td>
                        <td className="p-3">{acc.major || "—"}</td>
                        <td className="p-3">{acc.admin_gmail}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onChangePassword(acc)}
                              className="green-bg text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-slate-600 text-sm cursor-pointer"
                            >
                              <Key size={14} /> Change Password
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAccount(acc.admin_id)}
                              className="bg-[#b42318] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-red-700 text-sm cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Developer;