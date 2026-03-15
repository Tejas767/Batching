"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok) setVehicles(data.data);
    } catch (err) {
      console.error("Failed to load vehicles", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = async (truckNumber, driverName) => {
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckNumber, driverName }),
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles((prev) => [data.data, ...prev]);
        toast.success("Vehicle added successfully");
        return true;
      } else {
        toast.error(data.error || "Failed to add vehicle");
      }
    } catch (err) {
      toast.error("Network error");
    }
    return false;
  };

  const deleteVehicle = async (id) => {
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
        toast.success("Vehicle deleted");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const deleteAllVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles?all=true", {
        method: "DELETE",
      });
      if (res.ok) {
        setVehicles([]);
        toast.success("All vehicles deleted");
      }
    } catch (err) {
      toast.error("Failed to delete all");
    }
  };

  return {
    vehicles,
    loading,
    addVehicle,
    deleteVehicle,
    deleteAllVehicles,
  };
}
