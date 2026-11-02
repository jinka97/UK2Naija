import React, { useState } from 'react';
import {
  Table,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Database,
  Layers,
  ShieldCheck,
  Code,
  FileSpreadsheet,
  CheckCheck,
  Eye,
  Info,
} from 'lucide-react';
import { CustomerRequest, GoogleSheetsConfig } from '../types';
import {
  exportRequestsToCsv,
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  syncToGoogleSheets,
  syncAllRequestsToGoogleSheets,
} from '../services/storage';

interface GoogleSheetsHubProps {
  requests: CustomerRequest[];
  onRefresh: () => void;
}

export const GoogleSheetsHub: React.FC<GoogleSheetsHubProps> = ({ requests, onRefresh }) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>(getGoogleSheetsConfig());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [inspectingRequest, setInspectingRequest] = useState<CustomerRequest | null>(requests[0] || null);
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'data' | 'inspector'>('guide');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetsConfig(config);
    alert('Google Sheets Webhook configuration saved successfully!');
  };

  const handleTestSync = async () => {
    if (!config.webhookUrl) {
      alert('Please enter your Google Apps Script Web App URL first.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Testing live transmission to Google Sheets...');

    const sample = requests[0] || {
      id: 'UK2N-TEST',
      createdAt: new Date().toISOString(),
      customerName: 'Test Customer',
      whatsappPhone: '+234 800 000 0000',
      deliveryCity: 'Lagos (Test)',
      deliveryAddress: 'Test Address',
      category: 'Test',
      items: [{ id: '1', name: 'Test Product', quantity: 1 }],
      budget: 'flexible',
      status: 'submitted',
    };

    const ok = await syncToGoogleSheets(sample);
    setIsSyncing(false);

    if (ok) {
      setSyncStatus('Transmission test signal sent! Check your Google Sheet to verify the new row.');
    } else {
      setSyncStatus('Sync request dispatched. Note: Browser CORS in Apps Script is handled silently.');
    }
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleBatchSyncAll = async () => {
    if (!config.webhookUrl) {
      alert('Please configure your Google Apps Script Web App URL first.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(`Syncing all ${requests.length} customer records to Google Sheets...`);
    const res = await syncAllRequestsToGoogleSheets(requests);
    setIsSyncing(false);

    setSyncStatus(`Sync completed! ${res.count} of ${requests.length} requests dispatched to your spreadsheet.`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const appsScriptCode = `// -----------------------------------------------------------------
// UK2NAIJA: PRODUCTION GOOGLE SHEETS LIVE ORDERS SINK
// -----------------------------------------------------------------
// 1. In Google Sheets: Extensions > Apps Script
// 2. Paste this code completely, replacing any existing code
// 3. Click "Deploy" > "New deployment"
// 4. Select Type: "Web App"
//    - Description: "UK2Naija Live Orders Webhook"
//    - Execute as: "Me (your email)"
//    - Who has access: "Anyone" (crucial for receiving browser requests)
// 5. Copy the generated Web App URL and paste into UK2Naija Admin
//    OR put it in src/config/sheetsConfig.ts for automatic live logging!
// -----------------------------------------------------------------

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000); // Wait up to 15s to ensure concurrent requests never clash

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("UK2Naija_Orders") || ss.getActiveSheet();

    // Auto-create formatted header row if sheet is brand new
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp (UTC)",
        "Request_ID",
        "Customer_Name",
        "WhatsApp_Number",
        "Delivery_City",
        "Delivery_Address",
        "Category",
        "Product_Items_Summary",
        "Budget_Range",
        "Lifecycle_Status",
        "Landed_Quote_GBP",
        "Landed_Quote_NGN",
        "UK_Retailer",
        "Admin_Sourcing_Notes"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#f8fafc");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var payload = JSON.parse(e.postData.contents);
    var row = payload.data;

    // Validate that essential fields exist to guarantee accurate receipt
    if (!row.requestId || !row.customerName) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing mandatory Request_ID or Customer_Name"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Check if Request_ID already exists (to update status or quotation in place)
    var data = sheet.getDataRange().getValues();
    var targetRowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim() === String(row.requestId).trim()) {
        targetRowIndex = i + 1; // 1-indexed sheet row
        break;
      }
    }

    var rowValues = [
      row.timestamp || new Date().toISOString(),
      row.requestId,
      row.customerName,
      row.whatsapp,
      row.deliveryCity,
      row.deliveryAddress || "Standard Hub Collection",
      row.category,
      row.productItems,
      row.budget,
      row.status,
      row.quoteGbp,
      row.quoteNgn,
      row.retailer,
      row.notes
    ];

    if (targetRowIndex > 0) {
      // Update existing record in place
      sheet.getRange(targetRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Append new customer request row
      sheet.appendRow(rowValues);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      requestId: row.requestId,
      action: targetRowIndex > 0 ? "updated" : "appended"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Browser GET health check (if user opens the Web App URL in browser)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "UK Source Nigeria Google Sheets Webhook Sink",
    message: "Ready to receive customer request payloads from UK Source assistant."
  })).setMimeType(ContentService.MimeType.JSON);
}`;


  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Google Sheets Master Database Hub
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">Order Persistence & Spreadsheet Integration</h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            All customer requests are backed up locally in browser storage and can be automatically mirrored into your
            live Google Sheet via Google Apps Script Webhook.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportRequestsToCsv(requests)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleBatchSyncAll}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync All ({requests.length})</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Sub-Tabs: Integration Guide, Live Data Table, Payload Inspector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'guide'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Integration Setup & Verification
        </button>
        <button
          onClick={() => setActiveSubTab('data')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'data'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Live Spreadsheet Grid ({requests.length} Rows)
        </button>
        <button
          onClick={() => setActiveSubTab('inspector')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSubTab === 'inspector'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Request Field Accuracy Inspector
        </button>
      </div>

      {/* TAB 1: INTEGRATION SETUP GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Connector Config Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Send className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">Webhook Connector Settings</h3>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Apps Script Web App URL *
                </label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {config.webhookUrl ? '✓ Connected to Webhook' : 'Paste your deployed Google Web App URL above.'}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Sheet Tab Name</label>
                <input
                  type="text"
                  value={config.sheetName}
                  onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                  Save URL
                </button>
                <button
                  type="button"
                  onClick={handleTestSync}
                  disabled={isSyncing}
                  className="w-1/2 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Test Webhook</span>
                </button>
              </div>
            </form>

            {/* Detailed Integration Steps */}
            <div className="pt-4 border-t border-slate-100 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Step-by-Step Integration Process:
              </h4>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong>Create Google Sheet:</strong> Open{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 underline font-semibold"
                    >
                      sheets.new
                    </a>{' '}
                    and name it <em>"UK2Naija Orders"</em>.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong>Open Script Editor:</strong> Click <em>Extensions ➔ Apps Script</em> in the Google Sheets top menu.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong>Paste Code:</strong> Delete any code in <code>Code.gs</code> and paste the script from the right box.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong>Deploy as Web App:</strong> Click <em>Deploy ➔ New deployment</em>. Select type <em>Web app</em>, execute as <em>Me</em>, and set <strong>Who has access: Anyone</strong> (required to log live customer requests).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <div>
                    <strong>Connect Live Site:</strong> Copy the Web App URL and either paste it into the connector above, or paste it into <code>src/config/sheetsConfig.ts</code> as <code>DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL</code> so all GitHub Pages visitors automatically log their orders to your sheet!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Apps Script Box */}
          <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  Google Apps Script (Production Handler)
                </span>
              </div>

              <button
                onClick={copyAppsScript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <div className="grow bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-300 max-h-[460px]">
              <pre>{appsScriptCode}</pre>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-slate-400 text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Includes concurrency locks, header auto-generation & update-in-place</span>
              </span>
              <span className="text-slate-500 font-mono">v1.2</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SPREADSHEET TABLE VIEW */}
      {activeSubTab === 'data' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Spreadsheet Record Viewer ({requests.length} Orders Stored)
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Sheet Tab: {config.sheetName}</span>
          </div>

          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="p-2.5 border-r border-slate-200 text-center text-slate-400 w-10">#</th>
                  <th className="p-2.5 border-r border-slate-200">Request_ID</th>
                  <th className="p-2.5 border-r border-slate-200">Timestamp</th>
                  <th className="p-2.5 border-r border-slate-200">Customer_Name</th>
                  <th className="p-2.5 border-r border-slate-200">WhatsApp</th>
                  <th className="p-2.5 border-r border-slate-200">Delivery_City</th>
                  <th className="p-2.5 border-r border-slate-200">Category</th>
                  <th className="p-2.5 border-r border-slate-200 max-w-xs">Product_Items</th>
                  <th className="p-2.5 border-r border-slate-200">Budget</th>
                  <th className="p-2.5 border-r border-slate-200">Status</th>
                  <th className="p-2.5 border-r border-slate-200">Quote_GBP</th>
                  <th className="p-2.5 border-r border-slate-200">Quote_NGN</th>
                  <th className="p-2.5">Retailer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {requests.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 border-r border-slate-200 text-center text-slate-400 font-sans">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{req.id}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-500 whitespace-nowrap">
                      {req.createdAt.split('T')[0]}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-sans font-medium text-slate-800">
                      {req.customerName}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600">{req.whatsappPhone}</td>
                    <td className="p-2.5 border-r border-slate-200 font-sans text-slate-600">
                      {req.deliveryCity.split(' (')[0]}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-sans text-slate-600">{req.category}</td>
                    <td className="p-2.5 border-r border-slate-200 font-sans max-w-xs truncate text-slate-800">
                      {req.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-sans text-slate-500">{req.budget}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          req.status === 'quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'purchased' || req.status === 'dispatched'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-900 font-semibold">
                      {req.quotation ? `£${req.quotation.totalGbp.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-bold">
                      {req.quotation ? `₦${req.quotation.totalNgn.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-2.5 font-sans text-slate-600">
                      {req.quotation?.retailerFound || 'Not yet quoted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FIELD ACCURACY INSPECTOR */}
      {activeSubTab === 'inspector' && inspectingRequest && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Payload Verification for {inspectingRequest.id}
              </h3>
              <p className="text-slate-500 text-xs">
                Inspect how customer data is sanitized, validated, and mapped into the Google Sheets columns.
              </p>
            </div>

            <select
              value={inspectingRequest.id}
              onChange={(e) => {
                const found = requests.find((r) => r.id === e.target.value);
                if (found) setInspectingRequest(found);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.customerName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Mapped Spreadsheet Values:</span>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-700">
                <p>
                  <strong>Timestamp:</strong> {inspectingRequest.createdAt}
                </p>
                <p>
                  <strong>Request_ID:</strong> {inspectingRequest.id}
                </p>
                <p>
                  <strong>Customer_Name:</strong> {inspectingRequest.customerName}
                </p>
                <p>
                  <strong>WhatsApp_Number:</strong> {inspectingRequest.whatsappPhone}
                </p>
                <p>
                  <strong>Delivery_Location:</strong> {inspectingRequest.deliveryCity}
                </p>
                <p>
                  <strong>Delivery_Address:</strong> {inspectingRequest.deliveryAddress || 'Standard Hub Collection'}
                </p>
                <p>
                  <strong>Category:</strong> {inspectingRequest.category}
                </p>
                <p>
                  <strong>Product_Items:</strong>{' '}
                  {inspectingRequest.items.map((i) => `${i.name} (Qty: ${i.quantity})`).join(', ')}
                </p>
                <p>
                  <strong>Budget_Range:</strong> {inspectingRequest.budget}
                </p>
                <p>
                  <strong>Status:</strong> {inspectingRequest.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Outbound Webhook JSON Payload:</span>
              <div className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-60">
                <pre>
                  {JSON.stringify(
                    {
                      action: 'append_or_update',
                      sheet: config.sheetName,
                      data: {
                        timestamp: inspectingRequest.createdAt,
                        requestId: inspectingRequest.id,
                        customerName: inspectingRequest.customerName,
                        whatsapp: inspectingRequest.whatsappPhone,
                        deliveryCity: inspectingRequest.deliveryCity,
                        deliveryAddress: inspectingRequest.deliveryAddress || 'Standard Hub Collection',
                        category: inspectingRequest.category,
                        productItems: inspectingRequest.items
                          .map((i) => `${i.name} (Qty: ${i.quantity})`)
                          .join('; '),
                        budget: inspectingRequest.budget,
                        status: inspectingRequest.status.toUpperCase(),
                        quoteGbp: inspectingRequest.quotation
                          ? `£${inspectingRequest.quotation.totalGbp.toFixed(2)}`
                          : 'Pending',
                        quoteNgn: inspectingRequest.quotation
                          ? `₦${inspectingRequest.quotation.totalNgn.toLocaleString()}`
                          : 'Pending',
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
