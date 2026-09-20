import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  UserCheck,
  UserX,
  Clock,
  ArrowDown,
  RefreshCw,
  ShieldCheck,
  Zap,
  Radio,
  Compass,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

import { DonorChain, DonorChainNode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { RealMessagingModal } from './RealMessagingModal';

interface DonorChainFailoverProps {
  initialChain: DonorChain;
  onDonorStatusChange?: (donorName: string, status: string) => void;
}

interface SupabaseDonor {
  id: string;
  name: string;
  gender: string;
  age: number;
  blood_group: string;
  phone: string;
  distance_km: number;
  is_available: boolean;
  last_donation_date: string;
  donations_count: number;
  is_verified: boolean;
  response_status: string;
}

export const DonorChainFailover: React.FC<DonorChainFailoverProps> = ({
  initialChain,
  onDonorStatusChange,
}) => {
  const { t } = useLanguage();

  const [chain, setChain] = useState<DonorChain>(initialChain);

  const [searchRadiusKm, setSearchRadiusKm] =
    useState<number>(5);

  const [isRadiusExpanded, setIsRadiusExpanded] =
    useState<boolean>(false);

  const [selectedDonorForMsg, setSelectedDonorForMsg] =
    useState<{
      name: string;
      bloodGroup: string;
      distanceKm: number;
      phone?: string;
    } | null>(null);

  const [supabaseDonors, setSupabaseDonors] =
    useState<SupabaseDonor[]>([]);

  const [donorsLoading, setDonorsLoading] =
    useState<boolean>(true);

  const [donorsError, setDonorsError] =
    useState<string | null>(null);

  // ==============================
  // FETCH DONORS FROM SUPABASE
  // ==============================

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setDonorsLoading(true);
        setDonorsError(null);

        const response = await fetch('/api/donors');

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || 'Failed to fetch donors'
          );
        }

        setSupabaseDonors(result.data);
      } catch (error: any) {
        console.error('Donor fetch failed:', error);

        setDonorsError(
          error.message || 'Failed to load donors'
        );
      } finally {
        setDonorsLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // ==============================
  // PRIMARY DONOR UNAVAILABLE
  // ==============================

  const handleSimulatePrimaryUnavailable = () => {
    setChain(prev => {
      const updatedNodes: DonorChainNode[] =
        prev.nodes.map(node => {
          if (node.tier === 'Primary') {
            return {
              ...node,
              status: 'declined'
            };
          }

          if (node.tier === 'Backup 1') {
            return {
              ...node,
              status: 'active'
            };
          }

          return node;
        });

      return {
        ...prev,
        activeDonorId: 'dn-103',
        nodes: updatedNodes,
        failoverHistory: [
          `Failover Triggered: Primary donor marked unavailable at ${new Date().toLocaleTimeString()}`,
          `Zero-Downtime Cascade: Activated Backup 1 within 0.4 seconds`,
          ...prev.failoverHistory
        ]
      };
    });

    onDonorStatusChange?.(
      'Primary Donor',
      'declined'
    );
  };

  // ==============================
  // EXPAND SEARCH RADIUS
  // ==============================

  const handleSimulateNoOneAnswered = () => {
    setSearchRadiusKm(15);
    setIsRadiusExpanded(true);

    const extendedNodes: DonorChainNode[] = [
      ...chain.nodes.map(node => ({
        ...node,
        status: (
          node.status === 'accepted'
            ? 'declined'
            : node.status
        ) as DonorChainNode['status']
      })),

      {
        donorId: 'dn-ext-201',
        name: 'Dr. Pooja Naik (Apheresis Standby)',
        bloodGroup: 'B+',
        phone: '+919822019944',
        distanceKm: 12.4,
        etaMinutes: 26,
        matchScore: 89,
        status: 'active',
        tier: 'Tier 2 Expansion'
      },

      {
        donorId: 'dn-ext-202',
        name: 'Vikram Shinde (Regional Donor Club)',
        bloodGroup: 'B+',
        phone: '+919877123456',
        distanceKm: 14.8,
        etaMinutes: 32,
        matchScore: 85,
        status: 'waiting',
        tier: 'Tier 2 Expansion'
      }
    ];

    setChain(prev => ({
      ...prev,
      activeDonorId: 'dn-ext-201',
      nodes: extendedNodes,
      failoverHistory: [
        `3-MINUTE TIMEOUT: No response from primary 5km radius donors.`,
        `AUTO-EXPAND SEARCH: Perimeter escalated from 5 km to 15 km.`,
        `AUTOMATED BROADCAST: Dispatched alerts to farther apheresis donors.`,
        `Active Contact: Dr. Pooja Naik (12.4 km) alerted with STAT priority.`,
        ...prev.failoverHistory
      ]
    }));
  };

  // ==============================
  // BACKUP DONOR ACCEPTS
  // ==============================

  const handleSimulateBackup1Accepts = () => {
    setChain(prev => {
      const updatedNodes: DonorChainNode[] =
        prev.nodes.map(node => {
          if (node.tier === 'Backup 1') {
            return {
              ...node,
              status: 'accepted'
            };
          }

          return node;
        });

      return {
        ...prev,
        nodes: updatedNodes,
        failoverHistory: [
          `Backup 1 accepted emergency transfusion mission.`,
          ...prev.failoverHistory
        ]
      };
    });

    onDonorStatusChange?.(
      'Backup 1',
      'accepted'
    );
  };

  // ==============================
  // RESET
  // ==============================

  const handleResetChain = () => {
    setChain(initialChain);
    setSearchRadiusKm(5);
    setIsRadiusExpanded(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 font-sans space-y-5">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">

        <div>

          <div className="flex items-center space-x-2">

            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <GitBranch className="w-5 h-5" />
            </span>

            <h3 className="font-bold text-base text-slate-900">
              {t('donorChainTitle')}
            </h3>

            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
              AUTO-FAILOVER ACTIVE
            </span>

            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px] flex items-center space-x-1">

              <Compass className="w-3 h-3" />

              <span>
                Radius: {searchRadiusKm} km
              </span>

            </span>

          </div>

          <p className="text-xs text-slate-500 mt-1">
            {t('donorChainDesc')}
          </p>

        </div>

        <div className="flex items-center space-x-2">

          <button
            type="button"
            onClick={handleSimulateNoOneAnswered}
            className="p-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Simulate "No One Answered"
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetChain}
            className="p-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Chain</span>
          </button>

        </div>

      </div>

      {/* =====================================
          LIVE SUPABASE DONORS
      ===================================== */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

        <div className="flex items-center justify-between mb-3">

          <div>

            <h4 className="font-bold text-sm text-slate-900">
              Live Donors from Supabase
            </h4>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Donor availability fetched from the MEDITECH database
            </p>

          </div>

          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold">
            {supabaseDonors.length} DONORS
          </span>

        </div>

        {donorsLoading && (
          <div className="text-sm text-slate-500 py-3">
            Loading donors...
          </div>
        )}

        {donorsError && (
          <div className="text-sm text-rose-600 py-3">
            Failed to load donors: {donorsError}
          </div>
        )}

        {!donorsLoading && !donorsError && (
          <div className="space-y-2">

            {supabaseDonors.map(donor => (

              <div
                key={donor.id}
                className="bg-white border border-slate-200 rounded-lg p-3"
              >

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="font-bold text-sm text-slate-900">
                        {donor.name}
                      </span>

                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                        {donor.blood_group}
                      </span>

                      {donor.is_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}

                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      Age: {donor.age}
                      {' • '}
                      {donor.distance_km} km away
                      {' • '}
                      Donations: {donor.donations_count}
                    </div>

                  </div>

                  <div>

                    {donor.is_available ? (

                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold">
                        AVAILABLE
                      </span>

                    ) : (

                      <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold">
                        UNAVAILABLE
                      </span>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* RADIUS EXPANSION */}

      {isRadiusExpanded && (

        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-3 text-xs">

          <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
            <Radio className="w-4 h-4" />
          </div>

          <div className="flex-1">

            <div className="font-bold text-amber-900">
              Automatic Perimeter Expansion Triggered
            </div>

            <p className="text-amber-800 text-[11px] mt-1">
              Primary 0–5 km donors did not respond.
              System automatically expanded the search radius
              to 15 km.
            </p>

          </div>

        </div>

      )}

      {/* =====================================
          DONOR CHAIN
      ===================================== */}

      <div className="space-y-3">

        {chain.nodes.map((node, index) => {

          const isPrimary = node.tier === 'Primary';
          const isActive = node.status === 'active';
          const isAccepted = node.status === 'accepted';
          const isDeclined = node.status === 'declined';
          const isWaiting = node.status === 'waiting';

          return (

            <React.Fragment key={node.donorId}>

              <div
                className={`
                  p-4 rounded-xl border transition-all
                  ${
                    isDeclined
                      ? 'bg-rose-50/40 border-rose-200 opacity-80'
                      : isAccepted
                      ? 'bg-emerald-50 border-emerald-300'
                      : isActive
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                      : 'bg-slate-50 border-slate-200'
                  }
                `}
              >

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div className="flex items-center space-x-3">

                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        font-bold text-xs shrink-0
                        ${
                          isDeclined
                            ? 'bg-rose-600 text-white'
                            : isAccepted
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    <div>

                      <div className="flex items-center space-x-2">

                        <span className="text-xs font-black text-slate-900">
                          {node.name}
                        </span>

                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold">
                          {node.tier}
                        </span>

                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-extrabold">
                          {node.bloodGroup}
                        </span>

                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5">

                        {node.distanceKm} km away
                        {' • '}
                        ETA: {node.etaMinutes} min
                        {' • '}
                        <span className="font-semibold text-emerald-700">
                          AI Match: {node.matchScore}%
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center space-x-2">

                    {isDeclined && (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded font-bold text-xs flex items-center space-x-1">
                        <UserX className="w-3.5 h-3.5" />
                        <span>Unavailable</span>
                      </span>
                    )}

                    {isAccepted && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Accepted & En-Route</span>
                      </span>
                    )}

                    {isActive && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Active Contact</span>
                      </span>
                    )}

                    {isWaiting && (
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded font-bold text-xs">
                        Auto-Standby
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDonorForMsg({
                          name: node.name,
                          bloodGroup: node.bloodGroup,
                          distanceKm: node.distanceKm,
                          phone: '+919822014490'
                        })
                      }
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    {isPrimary && isAccepted && (
                      <button
                        type="button"
                        onClick={handleSimulatePrimaryUnavailable}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        Simulate Unavailable
                      </button>
                    )}

                    {node.tier === 'Backup 1' && isActive && (
                      <button
                        type="button"
                        onClick={handleSimulateBackup1Accepts}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        Simulate Accepts
                      </button>
                    )}

                  </div>

                </div>

              </div>

              {index < chain.nodes.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-slate-400" />
                </div>
              )}

            </React.Fragment>

          );

        })}

      </div>

      {/* LOG */}

      <div className="bg-slate-900 rounded-xl p-4 text-slate-300 text-xs font-mono space-y-1.5">

        <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 mb-2">

          <Zap className="w-3.5 h-3.5" />

          <span>
            REAL-TIME FAILOVER CONTROLLER LOG
          </span>

        </div>

        {chain.failoverHistory.map((log, index) => (
          <div
            key={index}
            className="text-[11px] text-slate-300"
          >
            &gt; {log}
          </div>
        ))}

      </div>

      {/* MESSAGE MODAL */}

      {selectedDonorForMsg && (
        <RealMessagingModal
          donor={selectedDonorForMsg}
          onClose={() => setSelectedDonorForMsg(null)}
          onConfirmSent={() => setSelectedDonorForMsg(null)}
        />
      )}

    </div>
  );
};