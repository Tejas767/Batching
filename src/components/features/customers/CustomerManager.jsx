"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash2, UserPlus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/Card";

export function CustomerManager({ 
  customers, 
  onAdd, 
  onDelete, 
  onDeleteAll,
  loading 
}) {
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const pageSize = 10;
  
  const siteRef = useRef(null);

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      siteRef.current?.focus();
    }
  };

  // ── FILTERING & PAGINATION ──
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.defaultSite && c.defaultSite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const success = await onAdd(name, site);
    if (success) {
      setName("");
      setSite("");
    }
  };

  return (
    <div className="w-full">
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">
              Customer Management
            </p>
            <h2 className="text-2xl font-semibold text-brand-1">Add Customer</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <input 
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-brand-1 focus:outline-none focus:ring-1 focus:ring-brand-1/20 transition-all placeholder:text-stone-400"
              />
              <svg className="absolute left-3 top-3 h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="rounded-lg bg-red-600/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
            >
              Delete All
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteAllConfirm}
          onClose={() => setShowDeleteAllConfirm(false)}
          onConfirm={onDeleteAll}
          title="Delete All Customers?"
          message="This action cannot be undone. All customer data will be permanently removed."
          confirmText="Yes, Delete All"
        />

        <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <Input
              id="customer-name"
              label="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>
          <div className="flex-1 w-full">
            <Input
              ref={siteRef}
              id="customer-site"
              label="Default Site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || loading}
            className="w-full md:w-auto h-[46px] px-8 bg-emerald-700 hover:bg-emerald-800 rounded-xl"
            icon={<UserPlus size={16} />}
          >
            Add Customer
          </Button>
        </form>

        {/* Table Head */}
        <div className="rounded-t-xl bg-brand-1/95 px-6 py-3 text-white flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <div className="w-1/3 text-left">Customer Name</div>
          <div className="w-1/3 text-center">Default Site</div>
          <div className="w-1/3 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="rounded-b-xl border-x border-b border-border min-h-[100px] flex flex-col">
          {paginatedCustomers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400">
              <AlertCircle size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">
                {searchTerm ? "No customers match your search." : "No customers added yet."}
              </p>
            </div>
          ) : (
            paginatedCustomers.map((customer, idx) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={customer._id}
                className={`flex items-center justify-between px-6 py-2 border-b border-border last:border-0 hover:bg-surface transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                }`}
              >
                <div className="w-1/3 text-sm font-bold text-brand-1">{customer.name}</div>
                <div className="w-1/3 text-sm text-center font-medium text-stone-600">
                  {customer.defaultSite || <span className="opacity-30">—</span>}
                </div>
                <div className="w-1/3 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm("Delete this customer?")) onDelete(customer._id);
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors rounded-lg border border-red-100 hover:border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border mt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Page <span className="text-brand-1">{currentPage}</span> of <span className="text-brand-1">{totalPages}</span> — {filteredCustomers.length} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:border-brand-1 hover:text-brand-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:border-brand-1 hover:text-brand-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
