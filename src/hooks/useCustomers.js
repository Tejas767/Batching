"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data.data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const addCustomer = async (name, defaultSite) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, defaultSite }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers((prev) => [data.data, ...prev]);
        toast.success("Customer added successfully");
        return true;
      } else {
        toast.error(data.error || "Failed to add customer");
      }
    } catch (err) {
      toast.error("Network error");
    }
    return false;
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`/api/customers?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        toast.success("Customer deleted");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const deleteAllCustomers = async () => {
    try {
      const res = await fetch("/api/customers?all=true", {
        method: "DELETE",
      });
      if (res.ok) {
        setCustomers([]);
        toast.success("All customers deleted");
      }
    } catch (err) {
      toast.error("Failed to delete all");
    }
  };

  return {
    customers,
    loading,
    addCustomer,
    deleteCustomer,
    deleteAllCustomers,
  };
}
