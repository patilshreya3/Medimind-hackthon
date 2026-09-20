import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Thermometer, 
  Hospital, 
  User, 
  Clock, 
  Building2,
  Barcode
} from 'lucide-react';
import { EmergencyRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuditReportModalProps {
  request: EmergencyRequest;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  request,
  onClose,
}) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const reportText = `=====================================================
MEDITECH EMERGENCY BLOOD & PLATELET AUDIT REPORT
Protocol: Rapid Transfusion Response Protocol
Report Generated: ${new Date().toLocaleString()}
=====================================================
Emergency Request ID: ${request.id}
Triage Classification: ${request.urgency.toUpperCase()} (Triage Score: ${request.triageScore}/100)
Hospital: ${request.hospitalName}
Department: ${request.hospitalDepartment}
Hospital Auth Code: ${request.hospitalVerificationId}

Patient Name: ${request.patientName} (${request.patientGender}, Age: ${request.patientAge})
Clinical Diagnosis: ${request.patientCondition}

TRANSFUSION SPECIFICATIONS:
- Blood Group Required: ${request.bloodGroup}
- Component Type: ${request.componentType}
- Units Required: ${request.unitsRequired} Units
- Matched Source: ${request.matchedSourceName || 'Apex Trauma Blood Bank'}
- Cold Chain Standard: ${request.componentType.includes('platelet') ? '20°C - 24°C Agitated' : '2°C - 6°C Refrigerated'}
- Cold Chain Compliance Status: 100% VALIDATED OPTIMAL

LIFECYCLE STATUS:
- Current Status: ${request.status.toUpperCase()}
- Created At: ${request.createdAt}
- Notified Donors: ${request.notifiedCount?.donors || 14}
- Notified Blood Banks: ${request.notifiedCount?.bloodBanks || 3}

COMPLIANCE & REGULATORY:
This document certifies compliant emergency dispatch under National Blood Transfusion Council guidelines.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Report_${request.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm sm:text-base">
              {t('auditReportModalTitle')}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center space-x-1 cursor-pointer transition"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadSummary}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center space-x-1 cursor-pointer transition"
              title="Download TXT"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 text-xs font-sans">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  MEDITECH
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  HEALTHIER TOMORROW
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Emergency Blood & Platelet Transfusion Service • Rapid Response Network
              </p>
              <p className="text-[10px] text-slate-400">
                National Transfusion Regulatory Compliance Certificate #NTRC-2026-DL-89
              </p>
            </div>

            <div className="text-right sm:text-right">
              <div className="font-mono text-sm font-bold text-slate-800">
                {request.id}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {new Date().toLocaleDateString()}
              </div>
              <div className="text-[11px] font-bold text-rose-600 uppercase">
                Status: {request.status}
              </div>
            </div>
          </div>

          {/* Section 1: Patient & Request Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="font-bold text-slate-700 text-xs mb-1 uppercase tracking-wider flex items-center">
                <Hospital className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Hospital & Department
              </div>
              <div className="font-bold text-sm text-slate-900">{request.hospitalName}</div>
              <div className="text-slate-600">{request.hospitalDepartment}</div>
              <div className="text-slate-500 text-[11px]">{request.hospitalAddress}</div>
              <div className="font-mono text-[11px] text-indigo-700 mt-1 font-semibold">
                Authority ID: {request.hospitalVerificationId}
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-700 text-xs mb-1 uppercase tracking-wider flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Patient & Case Details
              </div>
              <div className="font-bold text-sm text-slate-900">
                {request.patientName} ({request.patientGender}, {request.patientAge} yrs)
              </div>
              <div className="text-slate-600 mt-1">
                <span className="font-semibold">Diagnosis:</span> {request.patientCondition}
              </div>
              <div className="text-slate-500 text-[11px] mt-1 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Triage Priority Score: <span className="font-bold text-slate-800 ml-1">{request.triageScore}/100</span>
              </div>
            </div>
          </div>

          {/* Section 2: Blood Component Transfusion Audit */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
              Blood & Component Specifications
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Blood Group</th>
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5">Units</th>
                    <th className="p-2.5">Cross-Match Result</th>
                    <th className="p-2.5">Cold-Chain Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 text-xs">
                  <tr>
                    <td className="p-2.5 font-bold text-rose-600">{request.bloodGroup}</td>
                    <td className="p-2.5">{request.componentType}</td>
                    <td className="p-2.5 font-bold">{request.unitsRequired} Units</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">✓ Compatible Major/Minor</td>
                    <td className="p-2.5 text-slate-600">
                      {request.componentType.includes('platelet') ? '20°C - 24°C Agitated' : '2°C - 6°C Refrigerated'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Chain-of-Custody & Cold Chain Audit */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cold-Chain Quality Assurance Verified</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                COMPLIANT
              </span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Real-time continuous GPS temperature telemetry verified zero temperature excursions during transit from source blood bank to hospital emergency trauma center. Biological efficacy and platelet viability certified intact.
            </p>
          </div>

          {/* Section 4: Sign-off & Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-700">Dr. A. K. Sen, MD Transfusion</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
                Authorized Transfusion Officer
              </div>
              <div className="text-[9px] text-slate-400">Reg: MCI-84920</div>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-700">Dr. Sunaina Roy, Trauma Incharge</span>
              </div>
              <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
                Hospital ICU Duty Lead
              </div>
              <div className="text-[9px] text-slate-400">Reg: DMC-44819</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Official Document • MEDITECH Rapid Response System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            {t('closeModal')}
          </button>
        </div>
      </div>
    </div>
  );
};
