import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { MetricsRibbon } from './components/MetricsRibbon';
import { EmergencyRequestForm } from './components/EmergencyRequestForm';
import { LiveGpsTracking } from './components/LiveGpsTracking';
import { BloodBankInventory } from './components/BloodBankInventory';
import { MultiChannelAlerts } from './components/MultiChannelAlerts';
import { RequestLifecycleTracker } from './components/RequestLifecycleTracker';
import { AuditReportModal } from './components/AuditReportModal';
import { CompatibilityMatrixModal } from './components/CompatibilityMatrixModal';

import { DynamicPriorityExplanation } from './components/DynamicPriorityExplanation';
import { EmergencyHeatmap } from './components/EmergencyHeatmap';
import { BloodShortagePrediction } from './components/BloodShortagePrediction';
import { DonorChainFailover } from './components/DonorChainFailover';
import { AiEmergencyCoordinator } from './components/AiEmergencyCoordinator';
import { MassCasualtyAndSimulator } from './components/MassCasualtyAndSimulator';
import { HospitalResourceSharing } from './components/HospitalResourceSharing';
import { OneTapDonorResponseModal } from './components/OneTapDonorResponseModal';

import {
  INITIAL_REQUESTS,
  INITIAL_BLOOD_BANKS,
  INITIAL_DONORS,
  INITIAL_TELEMETRY,
  INITIAL_ALERT_LOGS,
  INITIAL_HEATMAP_ZONES,
  INITIAL_SHORTAGE_PREDICTIONS,
  INITIAL_AI_MESSAGES,
  INITIAL_HOSPITAL_TRANSFERS,
  INITIAL_MASS_CASUALTY_EVENT
} from './data/mockData';

import {
  EmergencyRequest,
  BloodBank,
  Donor,
  TransitTelemetry,
  AlertLog,
  BloodGroup,
  ComponentType,
  HeatmapZone,
  ShortagePrediction,
  HospitalTransfer,
  MassCasualtyEvent,
  AICoordinatorMessage,
  DonorChain
} from './types';

import {
  AlertTriangle,
  CheckCircle2,
  X,
  Heart,
  ShieldCheck,
  Smartphone,
  Siren
} from 'lucide-react';

const STORAGE_KEY = 'meditech_emergency_state_v3';

/* =========================================================
   DEFAULT DONOR CHAIN
========================================================= */

const DEFAULT_DONOR_CHAIN: DonorChain = {
  requestId: 'REQ-2026-DEMO',

  activeDonorId: 'dn-101',

  nodes: [
    {
      donorId: 'dn-101',
      name: 'Rahul Deshmukh',
      bloodGroup: 'O-',
      phone: '+919822014490',
      distanceKm: 2.1,
      etaMinutes: 12,
      matchScore: 99,
      status: 'accepted',
      tier: 'Primary'
    },

    {
      donorId: 'dn-102',
      name: 'Amit Joshi',
      bloodGroup: 'O-',
      phone: '+919822014491',
      distanceKm: 4.2,
      etaMinutes: 18,
      matchScore: 93,
      status: 'waiting',
      tier: 'Backup 1'
    },

    {
      donorId: 'dn-103',
      name: 'Sneha Kulkarni',
      bloodGroup: 'O-',
      phone: '+919822014492',
      distanceKm: 5.4,
      etaMinutes: 22,
      matchScore: 86,
      status: 'waiting',
      tier: 'Backup 2'
    }
  ],

  failoverHistory: [
    'System initialized: Primary donor chain activated.',
    'Primary donor verified and ready for emergency response.'
  ]
};

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(
      'Error restoring state from localStorage:',
      err
    );
  }

  return null;
};

const MainApp: React.FC = () => {
  const { t } = useLanguage();

  const saved = loadSavedState();

  // =========================================================
  // CORE APP STATE
  // =========================================================

  const [requests, setRequests] =
    useState<EmergencyRequest[]>(
      saved?.requests || INITIAL_REQUESTS
    );

  const [bloodBanks, setBloodBanks] =
    useState<BloodBank[]>(
      saved?.bloodBanks || INITIAL_BLOOD_BANKS
    );

  const [donors, setDonors] =
    useState<Donor[]>(
      saved?.donors || INITIAL_DONORS
    );

  const [telemetry, setTelemetry] =
    useState<TransitTelemetry>(
      saved?.telemetry || INITIAL_TELEMETRY
    );

  const [alerts, setAlerts] =
    useState<AlertLog[]>(
      saved?.alerts || INITIAL_ALERT_LOGS
    );

  // =========================================================
  // PRIVACY MODE
  // =========================================================

  const [privacyMode, setPrivacyMode] =
    useState<boolean>(
      saved?.privacyMode !== undefined
        ? saved.privacyMode
        : true
    );

  // =========================================================
  // USP STATE
  // =========================================================

  const [heatmapZones, setHeatmapZones] =
    useState<HeatmapZone[]>(
      INITIAL_HEATMAP_ZONES
    );

  const [shortagePredictions, setShortagePredictions] =
    useState<ShortagePrediction[]>(
      INITIAL_SHORTAGE_PREDICTIONS
    );

  const [aiMessages, setAiMessages] =
    useState<AICoordinatorMessage[]>(
      INITIAL_AI_MESSAGES
    );

  const [hospitalTransfers, setHospitalTransfers] =
    useState<HospitalTransfer[]>(
      INITIAL_HOSPITAL_TRANSFERS
    );

  const [massCasualtyEvent, setMassCasualtyEvent] =
    useState<MassCasualtyEvent>(
      INITIAL_MASS_CASUALTY_EVENT
    );

  // =========================================================
  // NAVIGATION & MODALS
  // =========================================================

  const [activeTab, setActiveTab] =
    useState<string>('requests');

  const [activeRequestId, setActiveRequestId] =
    useState<string>(
      INITIAL_REQUESTS[0].id
    );

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState<boolean>(false);

  const [selectedAuditRequest, setSelectedAuditRequest] =
    useState<EmergencyRequest | null>(null);

  const [isOneTapModalOpen, setIsOneTapModalOpen] =
    useState<boolean>(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // =========================================================
  // CURRENT ACTIVE REQUEST
  // =========================================================

  const currentActiveRequest =
    requests.find(
      r => r.id === activeRequestId
    ) || requests[0];

  // =========================================================
  // LOCAL STORAGE SYNC
  // =========================================================

  useEffect(() => {
    try {
      const stateToPersist = {
        requests,
        bloodBanks,
        donors,
        telemetry,
        alerts,
        privacyMode
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stateToPersist)
      );
    } catch (err) {
      console.error(
        'Error persisting state to localStorage:',
        err
      );
    }
  }, [
    requests,
    bloodBanks,
    donors,
    telemetry,
    alerts,
    privacyMode
  ]);

  // =========================================================
  // RESET DATA
  // =========================================================

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);

    setRequests(INITIAL_REQUESTS);
    setBloodBanks(INITIAL_BLOOD_BANKS);
    setDonors(INITIAL_DONORS);
    setTelemetry(INITIAL_TELEMETRY);
    setAlerts(INITIAL_ALERT_LOGS);
    setPrivacyMode(true);

    showToast(
      '🔄 Memory Cleared: Restored original mock dataset.'
    );
  };

  // =========================================================
  // CREATE NEW EMERGENCY REQUEST
  // =========================================================

  const handleCreateRequest = (
    newRequest: EmergencyRequest
  ) => {
    setRequests([
      newRequest,
      ...requests
    ]);

    setActiveRequestId(newRequest.id);

    setIsCreateModalOpen(false);

    const newAlerts: AlertLog[] = [
      {
        id: `ALT-${Date.now()}-1`,
        requestId: newRequest.id,
        channel: 'whatsapp',
        recipientType: 'Donor',
        recipientName:
          'All Verified Apheresis Donors in 10km',
        destination: 'Broadcast Group',
        sentAt: 'Just now',
        status: 'delivered',
        messagePreview:
          `🚨 URGENT TRANSFUSION: ${newRequest.unitsRequired} units of ${newRequest.bloodGroup} ${newRequest.componentType} needed at ${newRequest.hospitalName}. Tap to respond.`
      },

      {
        id: `ALT-${Date.now()}-2`,
        requestId: newRequest.id,
        channel: 'ivr_call',
        recipientType: 'Blood Bank',
        recipientName:
          'AIIMS Apex Trauma Blood Bank',
        destination:
          '+91 11 2658 8500',
        sentAt: 'Just now',
        status: 'acknowledged',
        messagePreview:
          `Flash Call Auto-Dial: Code Red Priority Request ${newRequest.id} matching your inventory.`
      },

      {
        id: `ALT-${Date.now()}-3`,
        requestId: newRequest.id,
        channel: 'sms',
        recipientType: 'Donor',
        recipientName:
          'Registered Standby Apheresis Donors',
        destination:
          '+91 98***',
        sentAt: 'Just now',
        status: 'sent',
        messagePreview:
          `MEDITECH SOS: Emergency ${newRequest.bloodGroup} requested at ${newRequest.hospitalName}. Reply YES to accept.`
      }
    ];

    setAlerts([
      ...newAlerts,
      ...alerts
    ]);

    setTelemetry({
      ...telemetry,

      requestId: newRequest.id,

      distanceRemainingKm: 4.8,

      etaMinutes: 14,

      routeCheckpoints: [
        {
          name:
            `${newRequest.hospitalName} Emergency Triage Cleared`,
          completed: true,
          timestamp: 'Just now'
        },

        {
          name:
            'Blood Bank Inventory Match Confirmed & Cross-match Ready',
          completed: false
        },

        {
          name:
            'Cold-Chain Dispatch Transport En Route',
          completed: false
        },

        {
          name:
            'Hospital Emergency Gate Arrival',
          completed: false
        },

        {
          name:
            'ICU Bedside Handover & Transfusion',
          completed: false
        }
      ]
    });

    showToast(
      `🚨 Emergency Request ${newRequest.id} Broadcast across SMS, WhatsApp & Blood Banks!`
    );

    setActiveTab('priority');
  };

  // =========================================================
  // RESERVE STOCK
  // =========================================================

  const handleReserveStock = (
    bankId: string,
    bankName: string,
    bloodGroup: BloodGroup,
    component: ComponentType
  ) => {
    setBloodBanks(prevBanks =>
      prevBanks.map(bank => {
        if (bank.id === bankId) {
          const currentStock =
            bank.inventory[bloodGroup]?.[component] || 0;

          return {
            ...bank,

            inventory: {
              ...bank.inventory,

              [bloodGroup]: {
                ...bank.inventory[bloodGroup],

                [component]:
                  Math.max(
                    0,
                    currentStock - 1
                  )
              }
            }
          };
        }

        return bank;
      })
    );

    setRequests(prevRequests =>
      prevRequests.map(req => {
        if (req.id === activeRequestId) {
          return {
            ...req,

            status: 'in_transit',

            matchedSourceType:
              'blood_bank',

            matchedSourceName:
              bankName
          };
        }

        return req;
      })
    );

    const newAlert: AlertLog = {
      id: `ALT-${Date.now()}`,
      requestId: activeRequestId,
      channel: 'whatsapp',
      recipientType: 'Blood Bank',
      recipientName: bankName,
      destination: '+91 (Duty Desk)',
      sentAt: 'Just now',
      status: 'acknowledged',

      messagePreview:
        `Stock Reserved: 1 unit of ${bloodGroup} ${component} locked for Request ${activeRequestId}. Courier dispatch assigned.`
    };

    setAlerts([
      newAlert,
      ...alerts
    ]);

    showToast(
      `✓ Stock Reserved at ${bankName}! Transit courier assigned.`
    );

    setActiveTab('tracking');
  };

  // =========================================================
  // ALERT DONOR
  // =========================================================

  const handleAlertDonor = (
    donorId: string,
    donorName: string
  ) => {
    const newAlert: AlertLog = {
      id: `ALT-${Date.now()}`,
      requestId: activeRequestId,
      channel: 'whatsapp',
      recipientType: 'Donor',
      recipientName: donorName,
      destination: '+91 (Private Mobile)',
      sentAt: 'Just now',
      status: 'delivered',

      messagePreview:
        `SOS Direct Alert: Urgent call to ${donorName} for emergency donation for Request ${activeRequestId}.`
    };

    setAlerts([
      newAlert,
      ...alerts
    ]);

    showToast(
      `Direct SOS Alert sent to ${donorName} via WhatsApp & SMS!`
    );
  };

  // =========================================================
  // DONOR RESPONSE SIMULATION
  // =========================================================

  const handleSimulateDonorResponse = (
    donorName: string,
    status: 'accepted' | 'en_route'
  ) => {
    setDonors(prevDonors =>
      prevDonors.map(d => {
        if (donorName.includes(d.name)) {
          return {
            ...d,
            responseStatus: status
          };
        }

        return d;
      })
    );

    setRequests(prev =>
      prev.map(req => {
        if (req.id === activeRequestId) {
          return {
            ...req,

            status:
              status === 'en_route'
                ? 'in_transit'
                : 'confirmed',

            matchedSourceType:
              'donor',

            matchedSourceName:
              donorName
          };
        }

        return req;
      })
    );

    const responseAlert: AlertLog = {
      id: `ALT-${Date.now()}`,
      requestId: activeRequestId,
      channel: 'in_app',
      recipientType: 'Donor',
      recipientName: donorName,
      destination: 'Hospital Dashboard',
      sentAt: 'Just now',
      status: 'accepted',

      messagePreview:
        `CONFIRMED: ${donorName} has ${
          status === 'accepted'
            ? 'accepted the emergency request'
            : 'started traveling to the blood center'
        }.`
    };

    setAlerts([
      responseAlert,
      ...alerts
    ]);

    showToast(
      `Donor Update: ${donorName} is now marked as ${
        status === 'accepted'
          ? 'Accepted'
          : 'En Route'
      }!`
    );
  };

  // =========================================================
  // PRE-ALERT
  // =========================================================

  const handleSendPreAlert = (
    predictionId: string,
    count: number
  ) => {
    setShortagePredictions(prev =>
      prev.map(p => {
        if (p.id === predictionId) {
          return {
            ...p,
            isPreAlertSent: true
          };
        }

        return p;
      })
    );

    const newAlert: AlertLog = {
      id: `ALT-PRE-${Date.now()}`,
      requestId: 'PREDICTIVE-SURGE',
      channel: 'whatsapp',
      recipientType: 'Donor',
      recipientName:
        `${count} Standby Apheresis Donors`,
      destination:
        'Emergency Prevention Group',
      sentAt: 'Just now',
      status: 'delivered',

      messagePreview:
        `MEDITECH Standby Notice: Potential scarcity forecast in next 6h. Are you available for standby donation?`
    };

    setAlerts([
      newAlert,
      ...alerts
    ]);

    showToast(
      `🔮 Pre-emptive alert dispatched to ${count} verified donors! Zero stockout prevented.`
    );
  };

  // =========================================================
  // AI COORDINATOR
  // =========================================================

  const handleSendAIMessage = (
    text: string
  ) => {
    const userMsg: AICoordinatorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',

      timestamp:
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

      text: text
    };

    const botReply: AICoordinatorMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',

      timestamp:
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

      text:
        `Processing triage parameters: Query analyzed for emergency criteria. Compatibility matrix verified across Pune municipal inventory.`,

      triagedCard: {
        urgency: 'critical',

        bloodGroup:
          text.includes('O-')
            ? 'O-'
            : text.includes('A+')
              ? 'A+'
              : 'O+',

        component:
          text.includes('platelet')
            ? 'platelets_sdp'
            : 'prbc',

        compatibleBanksFound: 3,

        eligibleDonorsFound: 5,

        nearestResourceDistance:
          '1.8 km (Sassoon Blood Bank)',

        estimatedResponseEta:
          '9 mins',

        recommendedAction:
          'Immediate dispatch corridor authorized. Locked 2 units in Sassoon reserve & alerted 4 standby apheresis donors.'
      }
    };

    setAiMessages(prev => [
      ...prev,
      userMsg,
      botReply
    ]);
  };

  // =========================================================
  // AI DISPATCH
  // =========================================================

  const handleDispatchFromAI = (
    card: AICoordinatorMessage['triagedCard']
  ) => {
    if (!card) return;

    showToast(
      `🚀 Emergency corridor locked for ${card.bloodGroup} ${card.component.toUpperCase()} via AI Coordinator!`
    );

    setActiveTab('tracking');
  };

  // =========================================================
  // MASS CASUALTY
  // =========================================================

  const handleToggleMassEmergency = () => {
    setMassCasualtyEvent(prev => {
      const nextState =
        !prev.isActive;

      if (nextState) {
        showToast(
          '🚨 MASS CASUALTY INCIDENT COMMAND ACTIVATED! Multi-hospital triage online.'
        );
      } else {
        showToast(
          'Mass Casualty mode deactivated. Returning to routine triage queue.'
        );
      }

      return {
        ...prev,
        isActive: nextState
      };
    });
  };

  // =========================================================
  // HOSPITAL TRANSFER
  // =========================================================

  const handleCreateHospitalTransfer = (
    transfer: HospitalTransfer
  ) => {
    setHospitalTransfers([
      transfer,
      ...hospitalTransfers
    ]);

    showToast(
      `🏥 Inter-hospital transfer ${transfer.id} launched between ${transfer.donorHospital} and ${transfer.requesterHospital}!`
    );
  };

  // =========================================================
  // ADVANCE LIFECYCLE
  // =========================================================

  const handleAdvanceLifecycle = (
    requestId: string
  ) => {

    const stageOrder = [
      'triage',
      'searching',
      'matched',
      'confirmed',
      'in_transit',
      'delivered',
      'transfused'
    ] as const;

    const currentRequest = requests.find(
      req => req.id === requestId
    );

    if (!currentRequest) {
      return;
    }

    const currentIdx = stageOrder.findIndex(
      stage => stage === currentRequest.status
    );

    if (currentIdx >= stageOrder.length - 1) {
      showToast(
        '❤️ PROCESS COMPLETED — Blood safely given to patient!'
      );

      return;
    }

    const nextIdx = currentIdx + 1;

    const nextStatus = stageOrder[nextIdx]!;

    setRequests(prevRequests =>
      prevRequests.map(req => {

        if (req.id !== requestId) {
          return req;
        }

        return {
          ...req,

          status: nextStatus,

          ...(nextStatus === 'delivered'
            ? {
                deliveryTimestamp:
                  'Just now'
              }
            : {})
        };
      })
    );

    if (nextStatus === 'transfused') {
      showToast(
        '❤️ PROCESS COMPLETED — Blood safely given to patient!'
      );
    } else {
      showToast(
        `Request ${requestId} advanced to next lifecycle stage.`
      );
    }
  };

  // =========================================================
  // PRIVACY
  // =========================================================

  const handleTogglePrivacy = (
    requestId: string
  ) => {
    setRequests(prev =>
      prev.map(req => {

        if (req.id === requestId) {
          return {
            ...req,
            privacyMasked:
              !req.privacyMasked
          };
        }

        return req;
      })
    );
  };

  // =========================================================
  // CONFIRM DELIVERY
  // =========================================================

  const handleConfirmDelivery = () => {
    setRequests(prev =>
      prev.map(req => {

        if (req.id === activeRequestId) {
          return {
            ...req,
            status: 'delivered',
            deliveryTimestamp:
              'Just now'
          };
        }

        return req;
      })
    );

    setTelemetry({
      ...telemetry,

      distanceRemainingKm: 0,

      etaMinutes: 0,

      routeCheckpoints:
        telemetry.routeCheckpoints.map(
          c => ({
            ...c,

            completed: true,

            timestamp:
              c.timestamp ||
              'Just now'
          })
        )
    });

    showToast(
      `✓ Units safely delivered and handed over at ${currentActiveRequest.hospitalName}!`
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      {/* TOAST */}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 max-w-md animate-in slide-in-from-bottom-2 duration-200">

          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

          <p className="text-xs font-medium leading-tight flex-1">
            {toastMessage}
          </p>

          <button
            onClick={() =>
              setToastMessage(null)
            }
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* ONE-TAP DONOR SOS */}

      <button
        onClick={() =>
          setIsOneTapModalOpen(true)
        }
        className="fixed bottom-5 left-5 z-40 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white px-3.5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center space-x-2 text-xs font-black cursor-pointer transition transform hover:scale-105"
        title="Open One-Tap Mobile Donor SOS screen"
      >

        <Smartphone className="w-4 h-4 animate-bounce" />

        <span className="hidden sm:inline">
          📱 One-Tap Donor SOS (Mobile Demo)
        </span>

      </button>

      {/* HEADER */}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={() =>
          setIsCreateModalOpen(true)
        }
        activeRequestsCount={
          requests.filter(
            r =>
              r.status !== 'transfused' &&
              r.status !== 'delivered'
          ).length
        }
        privacyMode={privacyMode}
        onTogglePrivacyMode={() => {

          setPrivacyMode(prev => {

            const next = !prev;

            showToast(
              next
                ? '🛡️ Privacy Shield ENABLED: Patient & donor details masked'
                : '🔓 Privacy Shield DISABLED: Unmasked operational view'
            );

            return next;
          });
        }}
        onResetData={handleResetData}
      />

      {/* METRICS */}

      <MetricsRibbon
        activeEmergenciesCount={
          requests.filter(
            r =>
              r.urgency === 'critical'
          ).length
        }

        totalDonorsAlerted={
          alerts.filter(
            a =>
              a.recipientType === 'Donor'
          ).length + 38
        }
      />

      {/* MASS CASUALTY WARNING */}

      {massCasualtyEvent.isActive && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-black text-center flex items-center justify-center space-x-2 animate-pulse">

          <Siren className="w-4 h-4" />

          <span>
            MASS CASUALTY INCIDENT IN PROGRESS:
            {' '}
            {massCasualtyEvent.eventName}
            {' '}
            ({massCasualtyEvent.incidentLocation})
          </span>

          <button
            onClick={() =>
              setActiveTab('mass_casualty')
            }
            className="underline ml-2 hover:text-rose-200"
          >
            Open Incident Command ›
          </button>

        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* REQUESTS */}

        {activeTab === 'requests' && (
          <div className="space-y-6">

            <EmergencyRequestForm
              onSubmit={handleCreateRequest}
            />

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">

              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center space-x-2">

                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />

                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Active Emergency Transfusion Requests ({requests.length})
                  </h3>

                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Click any request to view GPS transit & lifecycle
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {requests.map(req => (

                  <div
                    key={req.id}
                    onClick={() => {
                      setActiveRequestId(req.id);
                      setActiveTab('lifecycle');
                    }}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition hover:shadow-xs ${
                      req.id === activeRequestId
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {req.id}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
                        {req.bloodGroup}
                      </span>

                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-2 truncate">
                      {req.hospitalName}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {req.unitsRequired} {t('units')} • {req.componentType}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">

                      <span className="font-bold text-slate-600 dark:text-slate-400 uppercase">
                        {req.status}
                      </span>

                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        {req.urgency.toUpperCase()}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>
        )}

        {/* PRIORITY */}

        {activeTab === 'priority' && (
          <DynamicPriorityExplanation
            requests={requests}
            onSelectRequest={id => {
              setActiveRequestId(id);
              setActiveTab('tracking');
            }}
          />
        )}

        {/* GPS */}

        {activeTab === 'tracking' && (
          <LiveGpsTracking
            request={currentActiveRequest}
            telemetry={telemetry}
            onUpdateTelemetry={setTelemetry}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {/* INVENTORY */}

        {activeTab === 'inventory' && (
          <BloodBankInventory
            bloodBanks={bloodBanks}
            donors={donors}
            onReserveStock={handleReserveStock}
            onAlertDonor={handleAlertDonor}
            privacyMode={privacyMode}
          />
        )}

        {/* HEATMAP */}

        {activeTab === 'heatmap' && (
          <EmergencyHeatmap
            zones={heatmapZones}
            bloodBanks={bloodBanks}
            donors={donors}
          />
        )}

        {/* PREDICTIONS */}

        {activeTab === 'predictions' && (
          <BloodShortagePrediction
            predictions={shortagePredictions}
            onSendPreAlert={handleSendPreAlert}
          />
        )}

        {/* DONOR CHAIN */}

        {activeTab === 'failover' && (
          <DonorChainFailover
            initialChain={
              currentActiveRequest.donorChain ||
              DEFAULT_DONOR_CHAIN
            }

            onDonorStatusChange={(name, status) => {
              showToast(
                `Donor Chain Event: ${name} updated to ${status}`
              );
            }}
          />
        )}

        {/* AI COORDINATOR */}

        {activeTab === 'coordinator' && (
          <AiEmergencyCoordinator
            messages={aiMessages}
            onSendMessage={handleSendAIMessage}
            onDispatchFromAI={handleDispatchFromAI}
          />
        )}

        {/* MASS CASUALTY */}

        {activeTab === 'mass_casualty' && (
          <MassCasualtyAndSimulator
            event={massCasualtyEvent}
            onToggleMassEmergency={
              handleToggleMassEmergency
            }
          />
        )}

        {/* HOSPITAL RESOURCE SHARING */}

        {activeTab === 'h2h' && (
          <HospitalResourceSharing
            transfers={hospitalTransfers}
            onCreateTransfer={
              handleCreateHospitalTransfer
            }
          />
        )}

        {/* ALERTS */}

        {activeTab === 'alerts' && (
          <MultiChannelAlerts
            alerts={alerts}
            activeRequest={currentActiveRequest}

            onSimulateDonorResponse={
              handleSimulateDonorResponse
            }

            onBroadcastNewAlert={channel => {

              const newAlert: AlertLog = {
                id: `ALT-${Date.now()}`,

                requestId:
                  currentActiveRequest.id,

                channel,

                recipientType: 'Donor',

                recipientName:
                  'Broadcast Surge Call',

                destination:
                  'Emergency Channel',

                sentAt:
                  'Just now',

                status:
                  'delivered',

                messagePreview:
                  `Flash broadcast dispatched over ${channel.toUpperCase()} for ${currentActiveRequest.unitsRequired} units of ${currentActiveRequest.bloodGroup}.`
              };

              setAlerts([
                newAlert,
                ...alerts
              ]);

              showToast(
                `Surge alert transmitted over ${channel.toUpperCase()}!`
              );
            }}
          />
        )}

        {/* LIFECYCLE */}

        {activeTab === 'lifecycle' && (
          <RequestLifecycleTracker
            requests={requests}
            activeRequestId={activeRequestId}
            onSelectRequest={
              setActiveRequestId
            }
            onOpenAuditReport={
              setSelectedAuditRequest
            }
            onTogglePrivacy={
              handleTogglePrivacy
            }
            onAdvanceLifecycle={
              handleAdvanceLifecycle
            }
          />
        )}

        {/* COMPATIBILITY */}

        {activeTab === 'compatibility' && (
          <CompatibilityMatrixModal />
        )}

      </main>

      {/* CREATE REQUEST MODAL */}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">

          <div className="max-w-3xl w-full">

            <EmergencyRequestForm
              onSubmit={handleCreateRequest}
              onCancel={() =>
                setIsCreateModalOpen(false)
              }
            />

          </div>

        </div>
      )}

      {/* ONE-TAP DONOR MODAL */}

      {isOneTapModalOpen && (
        <OneTapDonorResponseModal
          request={currentActiveRequest}

          onAccept={() => {

            handleSimulateDonorResponse(
              'Rahul Deshmukh',
              'en_route'
            );

            showToast(
              'Donor confirmed via One-Tap Response! Navigation pass issued.'
            );
          }}

          onDecline={() => {

            showToast(
              'Donor marked unavailable. Failover cascade triggered.'
            );
          }}

          onClose={() =>
            setIsOneTapModalOpen(false)
          }
        />
      )}

      {/* AUDIT REPORT MODAL */}

      {selectedAuditRequest && (
        <AuditReportModal
          request={selectedAuditRequest}
          onClose={() =>
            setSelectedAuditRequest(null)
          }
        />
      )}

      {/* FOOTER */}

      <footer className="bg-slate-900 border-t border-slate-800 text-white text-xs py-6 mt-12">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center space-x-2">

            <div className="w-6 h-6 rounded-md bg-rose-600 flex items-center justify-center text-white">

              <Heart className="w-3.5 h-3.5 fill-white stroke-none" />

            </div>

            <span className="font-bold">
              MEDITECH
            </span>

            <span className="text-slate-500">
              •
            </span>

            <span className="text-slate-400">
              Rapid Response Blood & Platelet Logistics
            </span>

          </div>

          <div className="flex items-center space-x-4 text-slate-400">

            <span>
              Bilingual Medical Interface (English & हिन्दी)
            </span>

            <span>
              •
            </span>

            <span className="text-emerald-400 flex items-center">

              <ShieldCheck className="w-3.5 h-3.5 mr-1" />

              NBTC Standards Compliant

            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

// =========================================================
// APP ROOT
// =========================================================

export default function App() {

  return (
    <ThemeProvider>

      <LanguageProvider>

        <MainApp />

      </LanguageProvider>

    </ThemeProvider>
  );
}