"use client";

import React, { useState } from "react";

/**
 * Editable input — declared OUTSIDE the component to avoid
 * re-creating it on every render (fixes react-hooks/static-components).
 */
function EditableField({ name, value, onChange, className = "", type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-1 outline-none print:border-transparent print:p-0 transition-colors ${className}`}
    />
  );
}

export function TaxInvoice() {
  const [data, setData] = useState({
    companyName: "Malushte Brothers",
    addressLine1: "Old Tambat Lane Ratnagiri",
    gstin: "27ABGPM8691N1ZR",
    stateName: "Maharashtra",
    stateCode: "27",
    contact: "02352-224778 / 9822052563",
    email: "malushtebrothers@gmail.com",
    
    buyerName: "Shree Ramkrishna Anandvan Krushi Paryatan Kendra",
    buyerAddressLine1: "Flat No 2, Saint Mary Apartment, K-Villa",
    buyerAddressLine2: "Near Holy Cross School, Naupada, Thane West, Thane- 400602",
    buyerGstin: "27AEQPB7841G1ZB",
    buyerStateName: "Maharashtra",
    buyerStateCode: "27",
    buyerPlaceOfSupply: "Maharashtra",
    buyerContactPerson: "Girish Moreshwar Bapat",
    buyerContact: "9820023106",

    invoiceNo: "MB-23-24/CR-1563",
    invoiceDate: "21-Oct-23",
    deliveryNote: "",
    paymentTerms: "",
    referenceNo: "",
    otherReferences: "",
    buyersOrderNo: "",
    orderDate: "",
    dispatchDocNo: "06 (14)",
    deliveryNoteDate: "",
    dispatchedThrough: "",
    destination: "",
    termsOfDelivery: "",

    items: [
      { id: 1, desc: "GP SHS 50*50 APOLLO IS", qty: 70.00, qtyUnit: "PCS", rate: 1086.53, rateUnit: "PCS", disc: "", amount: 76057.10 },
      { id: 2, desc: "", qty: 0, qtyUnit: "", rate: 0, rateUnit: "", disc: "", amount: 0 },
      { id: 3, desc: "", qty: 0, qtyUnit: "", rate: 0, rateUnit: "", disc: "", amount: 0 },
    ],

    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0,
    roundOff: -0.38,
    
    amountInWords: "INR Eighty Nine Thousand Seven Hundred Forty Seven Only",
    
    companyVatTin: "27650175694V",
    companyCstNo: "27650175694C",
    companyPan: "ABGPM8691N",
    
    bankName: "HDFC BANK",
    bankAcNo: "50200019042402",
    bankBranch: "RATNAGIRI & HDFC0000430",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    const numValue = field === 'qty' || field === 'rate' || field === 'amount' ? parseFloat(value) || 0 : value;
    newItems[index][field] = numValue;
    
    // Auto calculate amount if qty or rate changes
    if (field === 'qty' || field === 'rate') {
        newItems[index].amount = (newItems[index].qty * newItems[index].rate);
    }
    
    setData(prev => ({ ...prev, items: newItems }));
  };

  // Calculations
  const totalTaxableValue = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalQty = data.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  
  const cgstAmount = totalTaxableValue * (data.cgstRate / 100);
  const sgstAmount = totalTaxableValue * (data.sgstRate / 100);
  const igstAmount = totalTaxableValue * (data.igstRate / 100);
  
  const grandTotal = totalTaxableValue + cgstAmount + sgstAmount + igstAmount + parseFloat(data.roundOff || 0);

  return (
    <div className="bg-white p-8 max-w-5xl mx-auto shadow-lg text-[13px] text-gray-900 font-sans print:shadow-none print:p-0 print:max-w-none">
      <h1 className="text-center font-bold text-lg mb-2">TAX INVOICE</h1>
      
      <div className="border border-gray-800 flex flex-col">
        {/* Top Section */}
        <div className="flex border-b border-gray-800">
          {/* Company Details (Left) */}
          <div className="w-1/2 border-r border-gray-800 p-2">
            <EditableField name="companyName" value={data.companyName} onChange={handleChange} className="font-bold text-base mb-1" />
            <EditableField name="addressLine1" value={data.addressLine1} onChange={handleChange} />
            <div className="flex"><span className="w-20">GSTIN/UIN:</span> <EditableField name="gstin" value={data.gstin} onChange={handleChange} className="flex-1 font-bold" /></div>
            <div className="flex"><span className="w-20">State Name:</span> <EditableField name="stateName" value={data.stateName} onChange={handleChange} className="flex-1" /> <span className="w-12">Code:</span> <EditableField name="stateCode" value={data.stateCode} onChange={handleChange} className="w-12" /></div>
            <div className="flex"><span className="w-20">Contact:</span> <EditableField name="contact" value={data.contact} onChange={handleChange} className="flex-1" /></div>
            <div className="flex"><span className="w-20">E-Mail:</span> <EditableField name="email" value={data.email} onChange={handleChange} className="flex-1 text-blue-600" type="email" /></div>
          </div>
          
          {/* Invoice Details (Right) */}
          <div className="w-1/2 flex flex-col">
            <div className="flex border-b border-gray-800 h-1/4">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Invoice No.</div>
                <EditableField name="invoiceNo" value={data.invoiceNo} onChange={handleChange} className="font-bold" />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Dated</div>
                <EditableField name="invoiceDate" value={data.invoiceDate} onChange={handleChange} className="font-bold" />
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 h-1/4">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Delivery Note</div>
                <EditableField name="deliveryNote" value={data.deliveryNote} onChange={handleChange} />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Mode/Terms of Payment</div>
                <EditableField name="paymentTerms" value={data.paymentTerms} onChange={handleChange} />
              </div>
            </div>

            <div className="flex border-b border-gray-800 h-1/4">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Reference No. & Date.</div>
                <EditableField name="referenceNo" value={data.referenceNo} onChange={handleChange} />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Other References</div>
                <EditableField name="otherReferences" value={data.otherReferences} onChange={handleChange} />
              </div>
            </div>

            <div className="flex h-1/4">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">{"Buyer's Order No."}</div>
                <EditableField name="buyersOrderNo" value={data.buyersOrderNo} onChange={handleChange} />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Dated</div>
                <EditableField name="orderDate" value={data.orderDate} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row (Buyer & More Info) */}
        <div className="flex border-b border-gray-800">
          <div className="w-1/2 border-r border-gray-800 p-2">
            <div className="text-xs text-gray-600 mb-1">Buyer (Bill to)</div>
            <EditableField name="buyerName" value={data.buyerName} onChange={handleChange} className="font-bold mb-1" />
            <EditableField name="buyerAddressLine1" value={data.buyerAddressLine1} onChange={handleChange} />
            <EditableField name="buyerAddressLine2" value={data.buyerAddressLine2} onChange={handleChange} />
            <div className="flex"><span className="w-24">GSTIN/UIN:</span> <EditableField name="buyerGstin" value={data.buyerGstin} onChange={handleChange} className="flex-1 font-bold" /></div>
            <div className="flex"><span className="w-24">State Name:</span> <EditableField name="buyerStateName" value={data.buyerStateName} onChange={handleChange} className="flex-1" /> <span className="w-12">Code:</span> <EditableField name="buyerStateCode" value={data.buyerStateCode} onChange={handleChange} className="w-12" /></div>
            <div className="flex"><span className="w-24">Place of Supply:</span> <EditableField name="buyerPlaceOfSupply" value={data.buyerPlaceOfSupply} onChange={handleChange} className="flex-1" /></div>
            <div className="flex"><span className="w-24">Contact Person:</span> <EditableField name="buyerContactPerson" value={data.buyerContactPerson} onChange={handleChange} className="flex-1" /></div>
            <div className="flex"><span className="w-24">Contact:</span> <EditableField name="buyerContact" value={data.buyerContact} onChange={handleChange} className="flex-1" /></div>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex border-b border-gray-800 h-1/3">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Dispatch Doc No.</div>
                <EditableField name="dispatchDocNo" value={data.dispatchDocNo} onChange={handleChange} />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Delivery Note Date</div>
                <EditableField name="deliveryNoteDate" value={data.deliveryNoteDate} onChange={handleChange} />
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 h-1/3">
              <div className="w-1/2 border-r border-gray-800 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Dispatched through</div>
                <EditableField name="dispatchedThrough" value={data.dispatchedThrough} onChange={handleChange} />
              </div>
              <div className="w-1/2 p-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 leading-tight">Destination</div>
                <EditableField name="destination" value={data.destination} onChange={handleChange} />
              </div>
            </div>

            <div className="flex h-1/3 p-1">
              <div className="w-full flex flex-col justify-start">
                <div className="text-xs text-gray-600 leading-tight mb-1">Terms of Delivery</div>
                <textarea 
                  name="termsOfDelivery" 
                  value={data.termsOfDelivery} 
                  onChange={handleChange}
                  className="w-full h-full bg-transparent resize-none outline-none text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-center text-xs">
              <th className="border-r border-gray-800 font-normal p-1 w-8">Sl<br/>No</th>
              <th className="border-r border-gray-800 font-normal p-1">Description of Goods</th>
              <th className="border-r border-gray-800 font-normal p-1 w-20">Quantity</th>
              <th className="border-r border-gray-800 font-normal p-1 w-20">Rate</th>
              <th className="border-r border-gray-800 font-normal p-1 w-12">per</th>
              <th className="border-r border-gray-800 font-normal p-1 w-12">Disc. %</th>
              <th className="font-normal p-1 w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="h-8 align-top group hover:bg-gray-50">
                <td className="border-r border-gray-800 p-1 text-center">{index + 1}</td>
                <td className="border-r border-gray-800 p-1">
                  <input
                    value={item.desc}
                    onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                    className="w-full bg-transparent outline-none font-semibold"
                  />
                </td>
                <td className="border-r border-gray-800 p-1">
                  <div className="flex items-center justify-end">
                    <input
                      type="number"
                      value={item.qty || ""}
                      onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                      className="w-full bg-transparent outline-none text-right font-semibold"
                    />
                    <span className="ml-1 text-xs">{item.qtyUnit}</span>
                  </div>
                </td>
                <td className="border-r border-gray-800 p-1">
                  <input
                    type="number"
                    value={item.rate || ""}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                    className="w-full bg-transparent outline-none text-right"
                  />
                </td>
                <td className="border-r border-gray-800 p-1 text-center text-xs">
                  <input
                    value={item.rateUnit}
                    onChange={(e) => handleItemChange(index, "rateUnit", e.target.value)}
                    className="w-full bg-transparent outline-none text-center"
                  />
                </td>
                <td className="border-r border-gray-800 p-1">
                  <input
                    value={item.disc}
                    onChange={(e) => handleItemChange(index, "disc", e.target.value)}
                    className="w-full bg-transparent outline-none text-center"
                  />
                </td>
                <td className="p-1 text-right font-semibold">
                  {(item.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
            
            {/* Taxes and Totals Padding row */}
            <tr className="h-32 align-bottom">
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800 p-1 text-right italic font-semibold">
                <div className="flex justify-end gap-4">
                  <div className="text-right">
                    <div>CGST</div>
                    <div>SGST</div>
                    <div>Round Off</div>
                  </div>
                </div>
              </td>
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800 text-xs italic p-1 text-right">Less :</td>
              <td className="p-1 text-right font-semibold">
                <div>{cgstAmount.toFixed(2)}</div>
                <div>{sgstAmount.toFixed(2)}</div>
                <div>
                  <input type="number" step="0.01" name="roundOff" value={data.roundOff} onChange={handleChange} className="w-16 bg-transparent outline-none text-right" />
                </div>
              </td>
            </tr>
            
            <tr className="border-t border-b border-gray-800">
              <td colSpan="2" className="border-r border-gray-800 p-1 text-right font-bold">Total</td>
              <td className="border-r border-gray-800 p-1 text-right font-bold">{totalQty.toFixed(2)} {data.items[0].qtyUnit}</td>
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800"></td>
              <td className="border-r border-gray-800"></td>
              <td className="p-1 text-right font-bold text-base">₹ {grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Area */}
        <div className="flex flex-col">
          <div className="border-b border-gray-800 p-1 text-xs">
            Amount Chargeable (in words) <span className="float-right">E. & O.E</span>
            <EditableField name="amountInWords" value={data.amountInWords} onChange={handleChange} className="font-bold text-sm block mt-1" />
          </div>

          <div className="flex border-b border-gray-800">
            <div className="w-1/2 border-r border-gray-800 p-2 flex flex-col justify-between">
              <div>
                <div className="flex"><span className="w-32">{"Company's VAT TIN"}</span>: <EditableField name="companyVatTin" value={data.companyVatTin} onChange={handleChange} className="font-bold flex-1" /></div>
                <div className="flex"><span className="w-32">{"Company's CST No."}</span>: <EditableField name="companyCstNo" value={data.companyCstNo} onChange={handleChange} className="font-bold flex-1" /></div>
                <div className="flex"><span className="w-32">{"Company's PAN"}</span>: <EditableField name="companyPan" value={data.companyPan} onChange={handleChange} className="font-bold flex-1" /></div>
              </div>
              <div className="mt-4 text-xs">
                <u className="font-semibold">Declaration</u><br/>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
            </div>
            
            <div className="w-1/2 p-2">
              <div className="flex mb-2"><span className="w-24">Date & Time</span>: <span className="font-bold ml-1">{data.invoiceDate} at {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="text-xs mb-1">{"Company's Bank Details"}</div>
              <div className="flex"><span className="w-24">Bank Name</span>: <EditableField name="bankName" value={data.bankName} onChange={handleChange} className="font-bold flex-1" /></div>
              <div className="flex"><span className="w-24">A/c No.</span>: <EditableField name="bankAcNo" value={data.bankAcNo} onChange={handleChange} className="font-bold flex-1" /></div>
              <div className="flex"><span className="w-24">Branch & IFS Code</span>: <EditableField name="bankBranch" value={data.bankBranch} onChange={handleChange} className="font-bold flex-1" /></div>
            </div>
          </div>

          <div className="flex">
            <div className="w-1/2 border-r border-gray-800 p-2 relative h-24 flex items-end">
              <div className="w-full border-t border-gray-800 text-center pt-1 text-xs">{"Customer's Seal and Signature"}</div>
            </div>
            <div className="w-1/2 p-2 relative h-24 flex flex-col justify-between items-end">
              <div className="w-full text-right font-semibold">for {data.companyName}</div>
              <div className="text-xs text-right mt-auto w-full border-t border-gray-800 pt-1">Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2 text-xs font-semibold">
        SUBJECT TO RATNAGIRI JURISDICTION<br/>
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}
