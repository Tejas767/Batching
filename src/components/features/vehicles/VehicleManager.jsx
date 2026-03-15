"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Truck, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function VehicleManager({ 
  vehicles, 
  onAdd, 
  onDelete, 
  onDeleteAll,
  loading 
}) {
  const [truckNumber, setTruckNumber] = useState("");
  const [driverName, setDriverName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!truckNumber.trim()) return;
    const success = await onAdd(truckNumber, driverName);
    if (success) {
      setTruckNumber("");
      setDriverName("");
    }
  };

  return (
    <div className="md:mx-auto md:max-w-5xl">
      <Card>
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">
              Vehicle Management
            </p>
            <h2 className="text-2xl font-semibold text-brand-1">Add Vehicle</h2>
            <p className="mt-1 text-sm text-stone-500">
              Manage your list of trucks and their default drivers.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete ALL vehicles?")) {
                onDeleteAll();
              }
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete All
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-10 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <Input
              label="Truck Number"
              placeholder="e.g. MH-12-AB-1234"
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <Input
              label="Driver Name"
              placeholder="e.g. Rahul Patil"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!truckNumber.trim() || loading}
            className="w-full md:w-auto h-[46px] px-8 bg-emerald-700 hover:bg-emerald-800 rounded-xl"
            icon={<Truck size={16} />}
          >
            Add Vehicle
          </Button>
        </form>

        {/* Table Head */}
        <div className="rounded-t-xl bg-brand-1/95 px-6 py-3 text-white flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <div className="w-1/3 text-left">Truck Number</div>
          <div className="w-1/3 text-center">Driver Name</div>
          <div className="w-1/3 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="rounded-b-xl border-x border-b border-border min-h-[200px] flex flex-col">
          {vehicles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400">
              <AlertCircle size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No vehicles added yet.</p>
            </div>
          ) : (
            vehicles.map((vehicle, idx) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={vehicle._id}
                className={`flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-surface transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"
                }`}
              >
                <div className="w-1/3 text-sm font-bold text-brand-1">{vehicle.truckNumber}</div>
                <div className="w-1/3 text-sm text-center font-medium text-stone-600">
                  {vehicle.driverName || <span className="opacity-30">—</span>}
                </div>
                <div className="w-1/3 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm("Delete this vehicle?")) onDelete(vehicle._id);
                    }}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
