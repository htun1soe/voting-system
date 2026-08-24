import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Trash2, User, Mail, Lock } from "lucide-react";

const adminSchema = z.object({
  admin_name: z.string().min(2, "Name required"),
  major_id: z.string().min(1, "Select major"),
  gmail: z.string().email("Valid email required"),
  password: z.string().min(4, "Min 4 characters"),
});

const majorSchema = z.object({
  major: z.string().min(2, "Major required"),
});

type AdminFormData = z.infer<typeof adminSchema>;
type MajorFormData = z.infer<typeof majorSchema>;

/* ================= COMPONENT ================= */

const Developer: React.FC = () => {
  const [majors, setMajors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [organizer, setOrganizer] = useState<any | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  /* ================= FORMS ================= */

  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    reset: resetAdmin,
    formState: { errors: adminErrors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const {
    register: registerMajor,
    handleSubmit: handleMajorSubmit,
    reset: resetMajor,
    formState: { errors: majorErrors },
  } = useForm<MajorFormData>({
    resolver: zodResolver(majorSchema),
  });

  /* ================= LOAD ================= */

  const loadMajors = async () => {
    const res = await fetch("/api/developer/majors", {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) setMajors(data.majors || []);
  };

  const loadAccounts = async () => {
    const res = await fetch("/api/developer/accounts", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) return;

    const list = data.accounts || [];
    setAccounts(list);

    const org = list.find((a: any) => a.account_type === "organizer");
    setOrganizer(org || null);
  };

  useEffect(() => {
    loadMajors();
    loadAccounts();
  }, []);

  /* ================= ACTIONS ================= */

  const addMajor = async (data: MajorFormData) => {
    const fd = new FormData();
    fd.append("major", data.major);

    await fetch("/api/developer/majors", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    resetMajor();
    loadMajors();
  };
  

  const createAdmin = async (data: AdminFormData) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));

    await fetch("/api/developer/admins", {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    resetAdmin();
    loadAccounts();
  };

  const deleteAdmin = async (id: number) => {
    await fetch(`/api/developer/admins/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    loadAccounts();
  };

  const admins = accounts.filter((a) => a.account_type === "admin");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 space-y-8"
    >
      <h1 className="text-3xl font-bold">Developer Dashboard</h1>

      {/* ================= ADD MAJOR ================= */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Add Major</h2>

        <form onSubmit={handleMajorSubmit(addMajor)} className="space-y-4">
          <input
            {...registerMajor("major")}
            className="w-full border rounded-lg p-3"
            placeholder="Major name"
          />
          {majorErrors.major && (
            <p className="text-red-500 text-sm">{majorErrors.major.message}</p>
          )}

          <button className="green-bg text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={16} /> Add Major
          </button>
        </form>
      </div>

      {/* ================= MAJOR LIST ================= */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Majors</h2>

        {majors.map((m) => (
          <div key={m.major_id} className="flex justify-between py-2 border-b">
            <span>{m.major}</span>
          </div>
        ))}
      </div>

      {/* ================= CREATE ADMIN ================= */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Admin</h2>

        <form onSubmit={handleAdminSubmit(createAdmin)} className="grid gap-4">

          <input
            {...registerAdmin("admin_name")}
            placeholder="Name"
            className="border p-3 rounded-lg"
          />
          {adminErrors.admin_name && (
            <p className="text-red-500 text-sm">{adminErrors.admin_name.message}</p>
          )}

          <select {...registerAdmin("major_id")} className="border p-3 rounded-lg">
            <option value="">Select Major</option>
            {majors.map((m) => (
              <option key={m.major_id} value={m.major_id}>
                {m.major}
              </option>
            ))}
          </select>

          <input
            {...registerAdmin("gmail")}
            placeholder="Email"
            className="border p-3 rounded-lg"
          />

          <input
            type="password"
            {...registerAdmin("password")}
            placeholder="Password"
            className="border p-3 rounded-lg"
          />

          <button className="green-bg text-white py-2 rounded-lg">
            Create Admin
          </button>
        </form>
      </div>

      {/* ================= ADMIN LIST ================= */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Admins</h2>

        {admins.map((a) => (
          <div key={a.admin_id} className="flex justify-between py-2 border-b">
            <span>
              {a.admin_name} ({a.admin_gmail})
            </span>

            <button
              onClick={() => deleteAdmin(a.admin_id)}
              className="text-red-500 flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        ))}
      </div>

    </motion.div>
  );
};

export default Developer;