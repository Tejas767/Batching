"use client";

import React, { useState, useEffect } from "react";

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
      className={`bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 outline-none print:border-transparent print:p-0 transition-colors w-full ${className}`}
    />
  );
}

export function DeliveryChallan({ batch = {}, onSave }) {
  const [data, setData] = useState({
    companyName: "SUPER TECH RMC",
    address: "Gut No 56,NEAR HIRAMATA TEMPLE,BURDEWASTI,CHAROLI B.K,TAL.HAVELI,DIST.PUNE",
    phone: "Tel : 9011773790 Mob : 9822842416",
    websiteEmail: "Website : - | Email : supertechrmc1@gmail.com",
    gstUdyam: "Firm GST No. : 27ADHFS8815R1Z3 | Udyam Reg. No.: UDYAM-MH-26-0194658",
    
    customer: "",
    siteDetails: "",
    partyPoNo: "",
    partyGstNo: "",
    contactPerson: "",
    contactNo: "",
    driverName: "",
    
    deliveryChallanNo: "",
    challanDate: "",
    typeOfLoading: "",
    timeOfDispatch: "",
    timeAtSite: "",
    exitFromSite: "",
    plantName: "SUPER TECH RMC",

    items: [
      { id: 1, srNo: "1", materialName: "", vehicleNo: "", qty: "", cumQty: "" }
    ],

    weightBridge: { rstNo: "", tareWeight: "", grossWeight: "", netWeight: "" },

    note1: "1.After 1 hour ,900/- per hour will be charged.",
    note2: "2.Do not unload vehicle without weight.",
    castingPurpose: "",
    remark: "",
    
    signCompanyLabel: "Sign for & behalf of",
    signCompanyName: "SUPER TECH RMC",
    signCustomerLabel: "Signed of on behalf of",
    signCustomerName: "Customer :"
  });

  // ── Fields that should persist across batches via localStorage ──
  const GLOBAL_FIELDS = [
    'companyName', 'address', 'phone', 'websiteEmail', 'gstUdyam',
    'note1', 'note2', 'signCompanyLabel', 'signCompanyName',
    'signCustomerLabel', 'signCustomerName', 'plantName',
    'partyPoNo', 'partyGstNo', 'contactPerson', 'contactNo',
    'typeOfLoading', 'castingPurpose', 'remark'
  ];

  // Helper: save global fields to localStorage immediately
  const saveGlobals = (newData) => {
    if (typeof window === 'undefined') return;
    const globals = {};
    GLOBAL_FIELDS.forEach(key => { globals[key] = newData[key]; });
    globals.weightBridge = newData.weightBridge;
    localStorage.setItem('challan_global', JSON.stringify(globals));
  };

  // ── LOAD: merge localStorage + batch data on mount/batch change ──
  useEffect(() => {
    let globalSettings = {};
    
    if (typeof window !== "undefined") {
      try {
        // Version check: clear stale data from old code iterations
        const version = localStorage.getItem("challan_version");
        if (version !== "3") {
          localStorage.removeItem("challan_global");
          localStorage.setItem("challan_version", "3");
        }
        globalSettings = JSON.parse(localStorage.getItem("challan_global") || "{}");
      } catch(e) {}
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(prev => ({
      ...prev,
      ...globalSettings, // Restore saved company info / static fields
      
      // ── COMPANY NAME: sync from Report tab → Challan ──
      companyName: batch.companyName || globalSettings.companyName || prev.companyName,
      signCompanyName: batch.companyName || globalSettings.signCompanyName || prev.signCompanyName,

      // ── BATCH-DERIVED FIELDS (always use latest batch) ──
      customer: batch.customerName || prev.customer,
      siteDetails: batch.site || prev.siteDetails,
      driverName: batch.truckDriver || prev.driverName,
      deliveryChallanNo: batch.docketNo || prev.deliveryChallanNo,
      timeOfDispatch: batch.batchStart || prev.timeOfDispatch,
      challanDate: new Date().toLocaleDateString("en-GB"),
      
      items: [{
        ...prev.items[0],
        materialName: batch.grade ? `RMC ${batch.grade}` : prev.items[0].materialName,
        qty: batch.qty ? `${batch.qty} Cum` : prev.items[0].qty,
        vehicleNo: batch.truckNumber || prev.items[0].vehicleNo,
      }],

      // ── GLOBAL FIELDS (from localStorage, never from batch) ──
      partyPoNo: globalSettings.partyPoNo ?? prev.partyPoNo,
      partyGstNo: globalSettings.partyGstNo ?? prev.partyGstNo,
      contactPerson: globalSettings.contactPerson ?? prev.contactPerson,
      contactNo: globalSettings.contactNo ?? prev.contactNo,
      typeOfLoading: globalSettings.typeOfLoading ?? prev.typeOfLoading,
      timeAtSite: prev.timeAtSite,
      exitFromSite: prev.exitFromSite,
      plantName: batch.companyName || (globalSettings.plantName ?? prev.plantName),
      weightBridge: globalSettings.weightBridge ?? prev.weightBridge,
      castingPurpose: globalSettings.castingPurpose ?? prev.castingPurpose,
      remark: globalSettings.remark ?? prev.remark,
    }));
  }, [batch]);

  // ── SAVE: directly in handlers — no useEffect needed ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => {
      const newData = { ...prev, [name]: value };
      saveGlobals(newData);
      return newData;
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData(prev => {
      const newData = { ...prev, items: newItems };
      saveGlobals(newData);
      return newData;
    });
  };

  const handleWeightChange = (field, value) => {
    setData(prev => {
      const newData = {
        ...prev,
        weightBridge: { ...prev.weightBridge, [field]: value }
      };
      saveGlobals(newData);
      return newData;
    });
  };

  return (
    <div className="bg-white p-8 max-w-5xl mx-auto text-black print:p-0 print:max-w-none font-sans relative" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Action Bar (Hidden in print) */}
      <div className="print:hidden absolute top-0 right-8">
        <button 
          onClick={() => {
            if (typeof window !== "undefined") {
              // Save all global fields before printing
              saveGlobals(data);
              // Ensure it fits the page perfectly without cutting off borders
              const printCSS = document.createElement("style");
              printCSS.id = "challan-print-css";
              printCSS.textContent = `
                @media print {
                  @page { size: A4 portrait; margin: 8mm; }
                  html, body { 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    background: white !important; 
                  }
                  #delivery-challan-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    /* Slightly zoom out if needed, but usually margins fix it */
                    zoom: 0.96;
                  }
                }
              `;
              document.head.appendChild(printCSS);

              // Print the challan
              window.print();
              
              // Cleanup
              document.head.removeChild(printCSS);
            }
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          PRINT CHALLAN
        </button>
      </div>

      {/* Main Outer Border Wrapper */}
      <div id="delivery-challan-container" className="border-[1.5px] border-black mt-8 print:mt-0">
        
        {/* Header Section */}
        <div className="text-center p-2 border-b-[1.5px] border-black">
          <div className="font-bold text-2xl tracking-wide mb-1">
            <EditableField name="companyName" value={data.companyName} onChange={handleChange} className="text-center font-bold" />
          </div>
          <div className="text-[11px] leading-tight flex flex-col gap-[2px]">
            <EditableField name="address" value={data.address} onChange={handleChange} className="text-center" />
            <EditableField name="phone" value={data.phone} onChange={handleChange} className="text-center" />
            <EditableField name="websiteEmail" value={data.websiteEmail} onChange={handleChange} className="text-center" />
            <EditableField name="gstUdyam" value={data.gstUdyam} onChange={handleChange} className="text-center" />
          </div>
        </div>

        {/* Title Bar */}
        <div className="text-center border-b-[1.5px] border-black py-1">
          <span className="font-bold text-[16px] underline tracking-wide">DELIVERY CHALLAN</span>
        </div>

        {/* Info Grid Section */}
        <div className="flex border-b-[1.5px] border-black text-[12px]">
          {/* Left Column */}
          <div className="w-1/2 p-2 flex flex-col gap-1 border-r-[1.5px] border-black">
            <div className="flex">
              <div className="w-[120px] font-bold">Customer</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="customer" value={data.customer} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Site Details</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="siteDetails" value={data.siteDetails} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Party PO No.</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="partyPoNo" value={data.partyPoNo} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Party GST No.</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="partyGstNo" value={data.partyGstNo} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Contact Person</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="contactPerson" value={data.contactPerson} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Contact No.</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="contactNo" value={data.contactNo} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[120px] font-bold">Driver Name</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="driverName" value={data.driverName} onChange={handleChange} /></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-1/2 p-2 flex flex-col gap-1 pl-4">
            <div className="flex">
              <div className="w-[130px] font-bold">Delivery Challan No.</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="deliveryChallanNo" value={data.deliveryChallanNo} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Challan Date</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="challanDate" value={data.challanDate} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Type of Loading</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="typeOfLoading" value={data.typeOfLoading} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Time of Dispatch</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="timeOfDispatch" value={data.timeOfDispatch} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Time at Site</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="timeAtSite" value={data.timeAtSite} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Exit from Site</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="exitFromSite" value={data.exitFromSite} onChange={handleChange} /></div>
            </div>
            <div className="flex">
              <div className="w-[130px] font-bold">Plant Name</div>
              <div className="mr-2 font-bold">:</div>
              <div className="flex-1"><EditableField name="plantName" value={data.plantName} onChange={handleChange} /></div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-b-[1.5px] border-black text-[12px] text-center border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-black font-bold">
              <th className="border-r-[1.5px] border-black p-1 w-[8%]">Sr. No.</th>
              <th className="border-r-[1.5px] border-black p-1 w-[35%]">Material Name</th>
              <th className="border-r-[1.5px] border-black p-1 w-[20%]">Vehicle No.</th>
              <th className="border-r-[1.5px] border-black p-1 w-[17%]">Qty.</th>
              <th className="p-1 w-[20%]">Cummulative Qty.</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border-r-[1.5px] border-black p-1">
                  <EditableField value={item.srNo} onChange={(e) => handleItemChange(index, "srNo", e.target.value)} className="text-center" />
                </td>
                <td className="border-r-[1.5px] border-black p-1">
                  <EditableField value={item.materialName} onChange={(e) => handleItemChange(index, "materialName", e.target.value)} className="text-center" />
                </td>
                <td className="border-r-[1.5px] border-black p-1">
                  <EditableField value={item.vehicleNo} onChange={(e) => handleItemChange(index, "vehicleNo", e.target.value)} className="text-center" />
                </td>
                <td className="border-r-[1.5px] border-black p-1">
                  <EditableField value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} className="text-center" />
                </td>
                <td className="p-1">
                  <EditableField value={item.cumQty} onChange={(e) => handleItemChange(index, "cumQty", e.target.value)} className="text-center" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section */}
        <div className="flex text-[11px] min-h-[160px]">
          
          {/* Bottom Left (Notes & Weight Details) */}
          <div className="w-[55%] p-2 border-r-[1.5px] border-black flex flex-col justify-between">
            <div>
              {/* Weight Bridge Table */}
              <div className="font-bold mb-1 ml-4 mt-2 text-[10px]">Weight Bridge Details :</div>
              <table className="w-[90%] border-[1.5px] border-black text-center mb-3">
                <thead>
                  <tr className="border-b-[1.5px] border-black font-bold text-[10px]">
                    <th className="border-r-[1.5px] border-black p-1 w-[20%]">RST No</th>
                    <th className="border-r-[1.5px] border-black p-1 w-[26%]">Tare Weight</th>
                    <th className="border-r-[1.5px] border-black p-1 w-[26%]">Gross Weight</th>
                    <th className="p-1 w-[28%]">Net Weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-[20px]">
                    <td className="border-r-[1.5px] border-black p-0">
                      <EditableField value={data.weightBridge.rstNo} onChange={(e) => handleWeightChange("rstNo", e.target.value)} className="text-center h-full" />
                    </td>
                    <td className="border-r-[1.5px] border-black p-0">
                      <EditableField value={data.weightBridge.tareWeight} onChange={(e) => handleWeightChange("tareWeight", e.target.value)} className="text-center h-full" />
                    </td>
                    <td className="border-r-[1.5px] border-black p-0">
                      <EditableField value={data.weightBridge.grossWeight} onChange={(e) => handleWeightChange("grossWeight", e.target.value)} className="text-center h-full" />
                    </td>
                    <td className="p-0">
                      <EditableField value={data.weightBridge.netWeight} onChange={(e) => handleWeightChange("netWeight", e.target.value)} className="text-center h-full" />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="font-bold">Please Note,</div>
              <div className="font-bold"><EditableField name="note1" value={data.note1} onChange={handleChange} className="font-bold" /></div>
              <div className="font-bold mb-2"><EditableField name="note2" value={data.note2} onChange={handleChange} className="font-bold" /></div>

              <div className="flex gap-2">
                <span>Casting Purpose :</span>
                <span className="flex-1"><EditableField name="castingPurpose" value={data.castingPurpose} onChange={handleChange} /></span>
              </div>
              <div className="flex gap-2">
                <span>Remark :</span>
                <span className="flex-1"><EditableField name="remark" value={data.remark} onChange={handleChange} /></span>
              </div>
            </div>
          </div>

          {/* Bottom Right (Signatures) */}
          <div className="w-[45%] flex flex-col justify-end p-2 relative">
            <div className="flex justify-between w-full pb-2 px-2">
              <div className="flex flex-col items-start w-1/2">
                <EditableField name="signCompanyLabel" value={data.signCompanyLabel} onChange={handleChange} className="text-[10px]" />
                <EditableField name="signCompanyName" value={data.signCompanyName} onChange={handleChange} className="font-bold text-[11px]" />
              </div>
              <div className="flex flex-col items-start w-1/2 pl-4">
                <EditableField name="signCustomerLabel" value={data.signCustomerLabel} onChange={handleChange} className="text-[10px]" />
                <EditableField name="signCustomerName" value={data.signCustomerName} onChange={handleChange} className="text-[11px]" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

