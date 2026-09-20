import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  Building,
  Droplet,
  Truck,
  Heart,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

import { EmergencyRequest, RequestStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RequestLifecycleTrackerProps {
  requests: EmergencyRequest[];
  activeRequestId: string;
  onSelectRequest: (requestId: string) => void;
  onOpenAuditReport: (request: EmergencyRequest) => void;
  onTogglePrivacy: (requestId: string) => void;
  onAdvanceLifecycle: (requestId: string) => void;
}

export const RequestLifecycleTracker: React.FC<
  RequestLifecycleTrackerProps
> = ({
  requests,
  activeRequestId,
  onSelectRequest,
  onOpenAuditReport,
  onTogglePrivacy,
  onAdvanceLifecycle,
}) => {

  const { t } = useLanguage();

  const currentRequest =
    requests.find(
      (r) => r.id === activeRequestId
    ) || requests[0];

  if (!currentRequest) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500">
        No active blood request available.
      </div>
    );
  }

  // =========================================================
  // LIFECYCLE STAGES
  // =========================================================

  const stages: {
    id: RequestStatus;
    label: string;
    icon: React.ElementType;
    desc: string;
  }[] = [

    {
      id: 'triage',
      label: t('stageTriage'),
      icon: AlertTriangle,
      desc:
        'Triage priority calculated & authority verified.',
    },

    {
      id: 'searching',
      label: t('stageSearching'),
      icon: Droplet,
      desc:
        'Scanning verified blood banks & apheresis donors.',
    },

    {
      id: 'matched',
      label: t('stageMatched'),
      icon: ShieldCheck,
      desc:
        'Exact ABO & Rh immunological compatibility verified.',
    },

    {
      id: 'confirmed',
      label: t('stageConfirmed'),
      icon: Building,
      desc:
        'Blood bank reserve locked; cross-match initiated.',
    },

    {
      id: 'in_transit',
      label: t('stageInTransit'),
      icon: Truck,
      desc:
        'Active GPS tracking with cold-chain sensor monitoring.',
    },

    {
      id: 'delivered',
      label: t('stageDelivered'),
      icon: CheckCircle2,
      desc:
        'Received at trauma center blood storage facility.',
    },

    {
      id: 'transfused',
      label: t('stageTransfused'),
      icon: Heart,
      desc:
        'Transfusion administered; patient vitals stabilized.',
    },
  ];

  // =========================================================
  // STAGE ORDER
  // =========================================================

  const stageOrder: RequestStatus[] = [
    'triage',
    'searching',
    'matched',
    'confirmed',
    'in_transit',
    'delivered',
    'transfused',
  ];

  // =========================================================
  // CURRENT STAGE
  // =========================================================

  const currentStageIndex = Math.max(
    0,
    stageOrder.indexOf(
      currentRequest.status
    )
  );

  // =========================================================
  // PROCESS COMPLETION
  // =========================================================

  const isProcessCompleted =
    currentRequest.status === 'transfused';

  // =========================================================
  // PROGRESS
  // =========================================================

  const progressPercentage =
    isProcessCompleted
      ? 100
      : stages.length > 1
        ? (currentStageIndex /
            (stages.length - 1)) *
          100
        : 0;

  // =========================================================
  // PRIVACY DISPLAY NAME
  // =========================================================

  const displayName =
    currentRequest.privacyMasked
      ? `${currentRequest.patientName.charAt(0)}*** ${
          currentRequest.patientName.split(' ')[1]
            ? currentRequest.patientName
                .split(' ')[1]
                .charAt(0) + '***'
            : ''
        } (ID: ${currentRequest.id.slice(-4)})`
      : currentRequest.patientName;

  return (
    <div className="space-y-5">

      {/* ========================================================= */}
      {/* PROCESS COMPLETED BANNER */}
      {/* ========================================================= */}

      {isProcessCompleted && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 shadow-sm">

          <div className="flex items-center justify-center gap-3">

            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">

              <CheckCircle2 className="w-6 h-6" />

            </div>

            <div className="text-center">

              <h2 className="text-lg font-black text-emerald-800">
                ❤️ PROCESS COMPLETED
              </h2>

              <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                Blood safely given to patient
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">

          <div>

            <div className="flex items-center space-x-2">

              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Traceability Engine
              </span>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {t('lifecycleTitle')}
              </h2>

            </div>

            <p className="text-xs text-slate-500 mt-1">
              {t('lifecycleSub')}
            </p>

          </div>

          {/* ACTION BUTTONS */}

          <div className="flex flex-wrap items-center gap-2">

            {/* NEXT STAGE BUTTON */}

            <button
              type="button"
              id="advance-lifecycle-btn"
              onClick={() =>
                onAdvanceLifecycle(
                  currentRequest.id
                )
              }
              disabled={isProcessCompleted}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                isProcessCompleted
                  ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
              }`}
            >

              {isProcessCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />

                  <span>
                    Process Completed
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Next Stage Step
                  </span>

                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}

            </button>

            {/* AUDIT REPORT */}

            <button
              type="button"
              id="generate-audit-report-btn"
              onClick={() =>
                onOpenAuditReport(
                  currentRequest
                )
              }
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >

              <FileText className="w-3.5 h-3.5" />

              <span>
                {t('generateAuditReport')}
              </span>

            </button>

          </div>

        </div>

        {/* ========================================================= */}
        {/* REQUEST SELECTOR */}
        {/* ========================================================= */}

        <div className="pt-3 flex space-x-2 overflow-x-auto no-scrollbar">

          {requests.map((req) => (

            <button
              key={req.id}
              type="button"
              onClick={() =>
                onSelectRequest(req.id)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                req.id === currentRequest.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >

              <span
                className={`w-2 h-2 rounded-full ${
                  req.status === 'in_transit'
                    ? 'bg-amber-300 animate-ping'
                    : req.status === 'delivered' ||
                      req.status === 'transfused'
                    ? 'bg-emerald-300'
                    : 'bg-rose-300'
                }`}
              />

              <span>
                {req.id}
              </span>

              <span className="opacity-80">
                ({req.bloodGroup})
              </span>

            </button>

          ))}

        </div>

      </div>

      {/* ========================================================= */}
      {/* REQUEST PROFILE */}
      {/* ========================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">

          <div>

            <div className="flex items-center flex-wrap gap-2">

              <h3 className="text-lg font-bold text-slate-900">
                {displayName}
              </h3>

              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-xs rounded border border-rose-200">

                {currentRequest.bloodGroup}
                {' • '}
                {currentRequest.unitsRequired}
                {' '}
                {t('units')}

              </span>

              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  currentRequest.urgency ===
                  'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentRequest.urgency}
              </span>

            </div>

            <p className="text-xs text-slate-500 mt-1">

              {currentRequest.hospitalName}

              {' • '}

              {currentRequest.hospitalDepartment}

              {' • Hospital Auth: '}

              <span className="font-mono text-slate-700">
                {currentRequest.hospitalVerificationId}
              </span>

            </p>

          </div>

          {/* PRIVACY */}

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">

            <button
              type="button"
              id="toggle-privacy-btn"
              onClick={() =>
                onTogglePrivacy(
                  currentRequest.id
                )
              }
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >

              {currentRequest.privacyMasked ? (
                <>
                  <EyeOff className="w-4 h-4 text-emerald-600" />

                  <span>
                    Privacy Shield Active (Name Anonymized)
                  </span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-slate-400" />

                  <span>
                    Full Medical Identity Visible
                  </span>
                </>
              )}

            </button>

          </div>

        </div>

        {/* ========================================================= */}
        {/* COMPLETE 7-STEP PROCESS */}
        {/* ========================================================= */}

        <div className="mt-5">

          <div className="relative">

            {/* CONNECTING LINE */}

            <div className="hidden lg:block absolute top-4 left-6 right-6 h-1 bg-slate-200 z-0">

              <div
                className={`h-full transition-all duration-700 ${
                  isProcessCompleted
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

            {/* SEVEN STEPS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 relative z-10">

              {stages.map(
                (stage, idx) => {

                  const Icon =
                    stage.icon;

                  // =================================================
                  // IMPORTANT COMPLETION LOGIC
                  // =================================================

                  const isCompleted =
                    isProcessCompleted
                      ? true
                      : idx <
                        currentStageIndex;

                  const isCurrent =
                    !isProcessCompleted &&
                    idx ===
                      currentStageIndex;

                  const isFuture =
                    !isProcessCompleted &&
                    idx >
                      currentStageIndex;

                  return (

                    <div
                      key={stage.id}
                      className={`min-w-0 p-2.5 rounded-lg border flex flex-col justify-between transition-all duration-500 ${
                        isCompleted
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : isCurrent
                          ? 'border-rose-600 bg-rose-50 shadow-sm ring-2 ring-rose-600/20'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >

                      <div>

                        {/* ICON + NUMBER */}

                        <div className="flex items-center justify-between mb-1.5">

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >

                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Icon className="w-3.5 h-3.5" />
                            )}

                          </div>

                          <span className="text-[9px] font-mono font-bold text-slate-500">
                            STEP {idx + 1}
                          </span>

                        </div>

                        {/* TITLE */}

                        <h4
                          className={`text-[11px] font-bold leading-tight ${
                            isCompleted
                              ? 'text-emerald-900'
                              : isCurrent
                              ? 'text-rose-900'
                              : 'text-slate-800'
                          }`}
                        >
                          {stage.label}
                        </h4>

                        {/* DESCRIPTION */}

                        <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                          {stage.desc}
                        </p>

                      </div>

                      {/* STATUS */}

                      <div className="mt-2 pt-1.5 border-t border-slate-200/70 text-[9px] font-semibold">

                        {isCompleted && (
                          <span className="text-emerald-700 font-bold">
                            ✓ COMPLETED
                          </span>
                        )}

                        {isCurrent && (
                          <span className="text-rose-600 font-bold">
                            ● ACTIVE NOW
                          </span>
                        )}

                        {isFuture && (
                          <span className="text-slate-400">
                            UPCOMING
                          </span>
                        )}

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* FINAL COMPLETION MESSAGE */}
        {/* ========================================================= */}

        {isProcessCompleted && (
          <div className="mt-5 bg-emerald-50 border border-emerald-300 rounded-xl p-4">

            <div className="flex items-center justify-center gap-3">

              <CheckCircle2 className="w-6 h-6 text-emerald-600" />

              <div>

                <p className="text-sm font-black text-emerald-800">
                  PROCESS COMPLETED
                </p>

                <p className="text-xs text-emerald-700">
                  All 7 lifecycle stages completed successfully.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* CLINICAL + LOGISTICS */}
        {/* ========================================================= */}

        <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

          {/* CLINICAL */}

          <div>

            <div className="font-bold text-slate-800 flex items-center">

              <ShieldCheck className="w-4 h-4 text-indigo-600 mr-1.5" />

              Clinical Condition & Cross-Match Audit:

            </div>

            <p className="text-slate-600 mt-1 leading-relaxed">
              {currentRequest.patientCondition}
            </p>

          </div>

          {/* LOGISTICS */}

          <div>

            <div className="font-bold text-slate-800">
              Assigned Sourcing & Cold-Chain Logistics:
            </div>

            <p className="text-slate-600 mt-1 leading-relaxed">

              Matched Sourcing:{' '}

              <span className="font-semibold text-slate-900">
                {currentRequest.matchedSourceName ||
                  'AIIMS Apex Blood Bank'}
              </span>

              <br />

              Cold-Chain Temperature Standard:{' '}

              <span className="font-semibold text-emerald-700">

                {currentRequest.componentType.includes(
                  'platelet'
                )
                  ? '20°C - 24°C Agitated'
                  : '2°C - 6°C Refrigerated'}

              </span>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};