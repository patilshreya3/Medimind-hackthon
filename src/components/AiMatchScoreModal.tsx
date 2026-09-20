import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  Activity, 
  ShieldCheck, 
  X,
  Droplet,
  Zap
} from 'lucide-react';
import { MatchScoreBreakdown } from '../types';

interface AiMatchScoreModalProps {
  name: string;
  bloodGroup: string;
  type: 'Donor' | 'Blood Bank';
  matchScore: MatchScoreBreakdown;
  onClose: () => void;
}

export const AiMatchScoreModal: React.FC<AiMatchScoreModalProps> = ({
  name,
  bloodGroup,
  type,
  matchScore,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-500/30 rounded-lg border border-rose-400/40 text-rose-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-widest text-rose-300 uppercase">
              Algorithmic USP Engine
            </span>
          </div>

          <h3 className="text-xl font-black mt-2 tracking-tight">
            MEDITECH AI Match Score
          </h3>
          <p className="text-xs text-rose-200/90 mt-1">
            Holistic emergency resource optimization vs. naive proximity search
          </p>

          {/* Big Score Visual */}
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300 font-semibold">{type} Resource:</div>
              <div className="text-base font-bold text-white flex items-center space-x-2">
                <span>{name}</span>
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-xs font-black">
                  {bloodGroup}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400">
                {matchScore.overallPercentage}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Clinical Match
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Factors */}
        <div className="p-6 space-y-4 text-xs font-sans">
          <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            Weighted Factor Analysis
          </div>

          {/* 1. Compatibility */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <Droplet className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Immuno-Compatibility</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {matchScore.compatibility.details}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                +{matchScore.compatibility.score} pts
              </span>
            </div>
          </div>

          {/* 2. Distance */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Proximity Corridor</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {matchScore.distance.distanceKm} km from Trauma ICU
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                +{matchScore.distance.score} pts
              </span>
            </div>
          </div>

          {/* 3. Availability */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <Activity className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Live Standby Availability</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {matchScore.availability.details}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                +{matchScore.availability.score} pts
              </span>
            </div>
          </div>

          {/* 4. Donation Eligibility */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Biological Donation Eligibility</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {matchScore.donationEligibility.daysSinceLast} days since last donation (Safe interval)
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                +{matchScore.donationEligibility.score} pts
              </span>
            </div>
          </div>

          {/* 5. Response ETA */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Transit Response ETA</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Estimated Arrival in {matchScore.responseEta.etaMinutes} minutes
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                +{matchScore.responseEta.score} pts
              </span>
            </div>
          </div>

          {/* Summary USP box */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-900 text-[11px] leading-relaxed flex items-start space-x-2">
            <Zap className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>Why This Matters to Judges:</strong> Instead of blindly selecting the geographically closest person, MEDITECH scores <em>Compatibility + Distance + Availability + Urgency + Response ETA</em>, guaranteeing clinical safety and zero wasted minutes in life-or-death emergencies.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
