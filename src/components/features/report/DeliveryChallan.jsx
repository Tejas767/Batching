"use client";

import React, { useState } from "react";

/**
 * Editable input — declared OUTSIDE the component to avoid
 * re-creating it on every render (fixes react-hooks/static-components).
 */
function EditableField({ name, value, onChange, className = "", type = "text" }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 outline-none print:border-transparent print:p-0 transition-colors ${className}`}
    />
  );
}

export function DeliveryChallan() {
  const [data, setData] = useState({
    companyName: "SHREE HARI ENTERPRISES",
    address: "123 Industrial Area, Phase 1, City",
    phone: "+91 98765 43210",
    email: "info@shreehari.com",
    gstin: "27ABCDE1234F1Z5",
    
    partyName: "ABC Construction Co.",
    partyAddress: "Site 4, New Town",
    partyPhone: "+91 91234 56789",
    partyEmail: "contact@abcconst.com",
    partyGstin: "27XYZAB9876C1Z2",

    shippingName: "ABC Construction Co. - Site A",
    shippingAddress: "Site 4, New Town",
    shippingPhone: "+91 91234 56789",
    shippingEmail: "site@abcconst.com",
    shippingGstin: "27XYZAB9876C1Z2",

    challanNo: "DC-2023-001",
    date: new Date().toISOString().split('T')[0],
    deliveryTime: "10:30 AM",
    
    items: [
      { id: 1, name: "Ready Mix Concrete M-25", hsn: "38245010", qty: "7.00", unit: "CUM" },
      { id: 2, name: "", hsn: "", qty: "", unit: "" },
      { id: 3, name: "", hsn: "", qty: "", unit: "" },
    ],

    terms: "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed.",
    receivedBy: "",
    receivedName: "",
    receivedComment: "",
    receivedDate: "",
    
    deliveredBy: "",
    deliveredName: "",
    deliveredComment: "",
    deliveredDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData(prev => ({ ...prev, items: newItems }));
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg text-sm text-gray-800 print:shadow-none print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-blue-500 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 tracking-wider">DELIVERY CHALLAN</h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-300 tracking-widest">LOGO</h2>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-6 grid grid-cols-[120px_1fr] gap-y-1">
        <div className="font-semibold text-blue-600">Company Name</div>
        <div><EditableField className="font-bold text-lg" name="companyName" value={data.companyName} onChange={handleChange} /></div>
        
        <div className="text-gray-600">Address</div>
        <div><EditableField name="address" value={data.address} onChange={handleChange} /></div>
        
        <div className="text-gray-600">Phone No</div>
        <div><EditableField name="phone" value={data.phone} onChange={handleChange} /></div>
        
        <div className="text-gray-600">Email ID</div>
        <div><EditableField name="email" value={data.email} onChange={handleChange} /></div>
        
        <div className="text-gray-600">GSTIN</div>
        <div><EditableField name="gstin" value={data.gstin} onChange={handleChange} /></div>
      </div>

      <hr className="border-blue-300 mb-6" />

      {/* Parties Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-bold text-blue-600 mb-2">Delivery Challan For :</h3>
          <div className="grid grid-cols-[100px_1fr] gap-y-1">
            <div className="text-gray-600">Party Name</div>
            <div><EditableField name="partyName" value={data.partyName} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Address</div>
            <div><EditableField name="partyAddress" value={data.partyAddress} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Phone No</div>
            <div><EditableField name="partyPhone" value={data.partyPhone} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Email ID</div>
            <div><EditableField name="partyEmail" value={data.partyEmail} onChange={handleChange} /></div>
            
            <div className="text-gray-600">GSTIN</div>
            <div><EditableField name="partyGstin" value={data.partyGstin} onChange={handleChange} /></div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-blue-600 mb-2">Shipping To :</h3>
          <div className="grid grid-cols-[100px_1fr] gap-y-1">
            <div className="text-gray-600">Shipping Name</div>
            <div><EditableField name="shippingName" value={data.shippingName} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Address</div>
            <div><EditableField name="shippingAddress" value={data.shippingAddress} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Phone No</div>
            <div><EditableField name="shippingPhone" value={data.shippingPhone} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Email ID</div>
            <div><EditableField name="shippingEmail" value={data.shippingEmail} onChange={handleChange} /></div>
            
            <div className="text-gray-600">GSTIN</div>
            <div><EditableField name="shippingGstin" value={data.shippingGstin} onChange={handleChange} /></div>
          </div>
        </div>
      </div>

      <hr className="border-blue-300 mb-4" />

      {/* Challan Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="grid grid-cols-[100px_1fr] gap-y-1">
          <div className="text-gray-600">Challan No</div>
          <div><EditableField name="challanNo" value={data.challanNo} onChange={handleChange} /></div>
          <div className="text-gray-600">Date</div>
          <div><EditableField type="date" name="date" value={data.date} onChange={handleChange} /></div>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-y-1">
          <div className="text-gray-600">Delivery Time</div>
          <div><EditableField type="time" name="deliveryTime" value={data.deliveryTime} onChange={handleChange} /></div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-[#0ba5e9] text-white">
            <th className="border border-[#0ba5e9] p-2 text-left w-16">SL NO.</th>
            <th className="border border-[#0ba5e9] p-2 text-left">Item Name</th>
            <th className="border border-[#0ba5e9] p-2 text-left w-32">HSN/SAC Code</th>
            <th className="border border-[#0ba5e9] p-2 text-right w-32">Quantity</th>
            <th className="border border-[#0ba5e9] p-2 text-left w-24">Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="border border-gray-200 p-2 text-center">{index + 1}</td>
              <td className="border border-gray-200 p-1">
                <input
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  className="w-full bg-transparent outline-none px-1"
                />
              </td>
              <td className="border border-gray-200 p-1">
                <input
                  value={item.hsn}
                  onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                  className="w-full bg-transparent outline-none px-1"
                />
              </td>
              <td className="border border-gray-200 p-1">
                <input
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                  className="w-full bg-transparent outline-none px-1 text-right"
                  type="number"
                />
              </td>
              <td className="border border-gray-200 p-1">
                <input
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  className="w-full bg-transparent outline-none px-1"
                />
              </td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-[#0ba5e9] text-white font-bold">
            <td colSpan="3" className="border border-[#0ba5e9] p-2 text-center">TOTAL</td>
            <td className="border border-[#0ba5e9] p-2 text-right">
              {data.items.reduce((acc, curr) => acc + (parseFloat(curr.qty) || 0), 0).toFixed(2)}
            </td>
            <td className="border border-[#0ba5e9] p-2"></td>
          </tr>
        </tbody>
      </table>

      {/* Footer / Terms */}
      <div className="flex justify-between items-start mb-16">
        <div className="w-1/2 pr-4">
          <div className="text-gray-600 mb-1">Terms & Conditions :</div>
          <textarea
            name="terms"
            value={data.terms}
            onChange={handleChange}
            className="w-full h-24 bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none resize-none print:border-transparent print:p-0"
          />
        </div>
        <div className="w-1/2 text-right">
          <div className="mb-12 font-semibold">For, <input name="companyName" value={data.companyName} onChange={handleChange} className="bg-transparent outline-none text-right w-48 font-semibold" /></div>
          <hr className="border-gray-400 w-48 ml-auto mb-1" />
          <div className="text-gray-600 text-sm">Authorised Signature</div>
        </div>
      </div>

      <hr className="border-blue-300 mb-4" />

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="grid grid-cols-[100px_1fr] gap-y-1">
            <div className="text-gray-600">Received By</div>
            <div><EditableField name="receivedBy" value={data.receivedBy} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Name</div>
            <div><EditableField name="receivedName" value={data.receivedName} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Comment</div>
            <div><EditableField name="receivedComment" value={data.receivedComment} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Date</div>
            <div><EditableField type="date" name="receivedDate" value={data.receivedDate} onChange={handleChange} /></div>
            
            <div className="text-gray-600 mt-4">Signature</div>
            <div className="mt-4 border-b border-gray-400 w-48"></div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-[100px_1fr] gap-y-1">
            <div className="text-gray-600">Delivered By</div>
            <div><EditableField name="deliveredBy" value={data.deliveredBy} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Name</div>
            <div><EditableField name="deliveredName" value={data.deliveredName} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Comment</div>
            <div><EditableField name="deliveredComment" value={data.deliveredComment} onChange={handleChange} /></div>
            
            <div className="text-gray-600">Date</div>
            <div><EditableField type="date" name="deliveredDate" value={data.deliveredDate} onChange={handleChange} /></div>
            
            <div className="text-gray-600 mt-4">Signature</div>
            <div className="mt-4 border-b border-gray-400 w-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
