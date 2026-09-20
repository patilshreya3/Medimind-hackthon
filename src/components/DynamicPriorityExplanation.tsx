import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  Calculator
} from 'lucide-react';
import { EmergencyRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DynamicPriorityExplanationProps {
  requests: EmergencyRequest[];
  onSelectRequest?: (id: string) => void;
}

export const DynamicPriorityExplanation: React.FC<DynamicPriorityExplanationProps> = ({
  requests,
  onSelectRequest,
}) => {
  const { t } = useLanguage();
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(requests[0]?.id || null);

  const sortedRequests = [...requests].sort((a, b) => (b.triageScore || 0) - (a.triageScore || 0));
  const topRequest = sortedRequests[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-rose-600 rounded text-white">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-white">
              Dynamic Emergency Priority Queue
            </h3>
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-mono font-bold border border-rose-500/30">
              ALGORITHMIC DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Dynamic prioritization based on: <span className="text-rose-400 font-semibold">Criticality + Time Remaining + Scarcity + Distance</span>
          </p>
        </div>

        {topRequest && (
          <div className="bg-rose-950/70 border border-rose-700/60 px-3 py-2 rounded-lg flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-rose-300 font-bold uppercase">
                #1 Active Emergency
              </div>
              <div className="text-xs font-black text-white">
                {topRequest.id} ({topRequest.bloodGroup} {topRequest.componentType})
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-black">
              🔴 {topRequest.triageScore}
            </span>
          </div>
        )}
      </div>

      {/* Priority Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
              <th className="p-3.5">Rank</th>
              <th className="p-3.5">Request ID</th>
              <th className="p-3.5">Hospital</th>
              <th className="p-3.5">Blood / Component</th>
              <th className="p-3.5">Time Remaining</th>
              <th className="p-3.5">Emergency Priority</th>
              <th className="p-3.5 text-right">Reasoning & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {sortedRequests.map((req, index) => {
              const isTop = index === 0;
              const isExpanded = expandedRequestId === req.id;
              const priority = req.priorityExplanation || {
                rank: index + 1,
                overallScore: req.triageScore,
                criticalityWeight: req.urgency === 'critical' ? 40 : 25,
                timeRemainingWeight: req.requiredWithinHours <= 1 ? 25 : 15,
                scarcityWeight: req.bloodGroup.includes('-') ? 20 : 10,
                distanceWeight: 13,
                explanationTitle: isTop ? 'CRITICAL CODE RED PRIORITY #1' : 'PRIORITY QUEUE',
                algorithmicReason: req.patientCondition,
              };

              return (
                <React.Fragment key={req.id}>
                  <tr className={`hover:bg-slate-50 transition cursor-pointer ${isTop ? 'bg-rose-50/40' : ''}`}
                      onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}>
                    <td className="p-3.5 font-bold">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                        index === 0 ? 'bg-rose-600 text-white' : index === 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {req.hospitalName}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded text-xs">
                        {req.bloodGroup}
                      </span>
                      <span className="ml-1.5 text-slate-600 font-medium">
                        {req.componentType} ({req.unitsRequired} Units)
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center text-rose-600 font-bold">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {req.requiredWithinHours < 1
                          ? `${Math.round(req.requiredWithinHours * 60)} min`
                          : `${req.requiredWithinHours} hrs`}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded text-xs font-black inline-flex items-center space-x-1 ${
                        priority.overallScore >= 90
                          ? 'bg-rose-600 text-white'
                          : priority.overallScore >= 70
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        <span>{priority.overallScore >= 90 ? '🔴' : priority.overallScore >= 70 ? '🟠' : '🟢'}</span>
                        <span>{priority.overallScore}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRequestId(isExpanded ? null : req.id);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{isTop ? 'Why is this #1?' : 'View Score Breakdown'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Algorithmic Breakdown Accordion */}
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="p-4 border-b border-slate-200">
                        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Calculator className="w-4 h-4 text-rose-600" />
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {isTop ? 'Why is this request #1?' : `Algorithmic Score Breakdown for ${req.id}`}
                                </h4>
                              </div>
                              <p className="text-slate-600 text-xs mt-1">
                                {priority.algorithmicReason}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] text-slate-500 font-semibold block">Total Priority Score</span>
                              <span className="text-2xl font-black text-rose-600">
                                {priority.overallScore} / 100
                              </span>
                            </div>
                          </div>

                          {/* 4-Part Formula Visual Bar */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200">
                              <span className="text-[10px] font-bold text-rose-700 uppercase">1. Patient Criticality</span>
                              <div className="text-lg font-black text-rose-900 mt-0.5">
                                +{priority.criticalityWeight} <span className="text-xs font-normal text-rose-600">/ 40 pts</span>
                              </div>
                              <p className="text-[10px] text-rose-800 mt-1">
                                {req.urgency === 'critical' ? 'Life-threatening active hemorrhage' : 'Standard scheduled procedure'}
                              </p>
                            </div>

                            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-700 uppercase">2. Time Remaining</span>
                              <div className="text-lg font-black text-amber-900 mt-0.5">
                                +{priority.timeRemainingWeight} <span className="text-xs font-normal text-amber-600">/ 25 pts</span>
                              </div>
                              <p className="text-[10px] text-amber-800 mt-1">
                                Required in {req.requiredWithinHours < 1 ? `${Math.round(req.requiredWithinHours * 60)} min` : `${req.requiredWithinHours} hrs`}
                              </p>
                            </div>

                            <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-200">
                              <span className="text-[10px] font-bold text-purple-700 uppercase">3. Blood Scarcity</span>
                              <div className="text-lg font-black text-purple-900 mt-0.5">
                                +{priority.scarcityWeight} <span className="text-xs font-normal text-purple-600">/ 20 pts</span>
                              </div>
                              <p className="text-[10px] text-purple-800 mt-1">
                                {req.bloodGroup} rarity + 5-day platelet shelf life
                              </p>
                            </div>

                            <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                              <span className="text-[10px] font-bold text-blue-700 uppercase">4. Distance & Logistics</span>
                              <div className="text-lg font-black text-blue-900 mt-0.5">
                                +{priority.distanceWeight} <span className="text-xs font-normal text-blue-600">/ 15 pts</span>
                              </div>
                              <p className="text-[10px] text-blue-800 mt-1">
                                Requires green-corridor ambulance transit
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => onSelectRequest?.(req.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                            >
                              <span>Track Live Transit & Donor Chain</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
