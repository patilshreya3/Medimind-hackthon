import React, { useState } from 'react';
import { 
  Radio, 
  MessageSquare, 
  PhoneCall, 
  Bell, 
  Send, 
  CheckCheck, 
  Clock, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { AlertLog, EmergencyRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MultiChannelAlertsProps {
  alerts: AlertLog[];
  activeRequest: EmergencyRequest;
  onSimulateDonorResponse: (donorName: string, status: 'accepted' | 'en_route') => void;
  onBroadcastNewAlert: (channel: 'sms' | 'whatsapp' | 'ivr_call' | 'in_app') => void;
}

export const MultiChannelAlerts: React.FC<MultiChannelAlertsProps> = ({
  alerts,
  activeRequest,
  onSimulateDonorResponse,
  onBroadcastNewAlert,
}) => {
  const { t } = useLanguage();
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');

  const filteredAlerts = selectedChannelFilter === 'all'
    ? alerts
    : alerts.filter(a => a.channel === selectedChannelFilter);

  const getChannelIcon = (channel: AlertLog['channel']) => {
    switch (channel) {
      case 'sms': return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'ivr_call': return <PhoneCall className="w-4 h-4 text-rose-500" />;
      case 'in_app': return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
                Multi-Channel Alert Dispatch Hub
              </span>
              <span className="text-xs text-slate-400">
                Active Protocol: <span className="text-slate-200 font-mono">CODE-RED-RAPID-ALERT</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
              {t('alertBroadcastTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {t('alertBroadcastSub')}
            </p>
          </div>

          {/* Broadcast triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onBroadcastNewAlert('whatsapp')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Blast WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => onBroadcastNewAlert('ivr_call')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Trigger Flash IVR</span>
            </button>
          </div>
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          {/* SMS */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                {t('channelSms')}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Sent</span>
            </div>
            <div className="text-lg font-extrabold text-white">
              Telecom DLT High Priority
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Lat: &lt; 2.1s avg delivery
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 text-green-400 mr-1" />
                {t('channelWhatsapp')}
              </span>
              <span className="text-[10px] text-green-400 font-bold">Active API</span>
            </div>
            <div className="text-lg font-extrabold text-white">
              Interactive 1-Tap RSVP
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Instant Google Maps link
            </div>
          </div>

          {/* IVR */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <PhoneCall className="w-3.5 h-3.5 text-rose-400 mr-1" />
                {t('channelIvr')}
              </span>
              <span className="text-[10px] text-rose-400 font-bold">Urgent Wakeup</span>
            </div>
            <div className="text-lg font-extrabold text-white">
              Emergency Phone Ring
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Automated bilingual speech
            </div>
          </div>

          {/* In-App */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center">
                <Bell className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                {t('channelInApp')}
              </span>
              <span className="text-[10px] text-indigo-400 font-bold">Encrypted</span>
            </div>
            <div className="text-lg font-extrabold text-white">
              Hospital Staff Mesh
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Direct blood bank alerts
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Response Simulator & Live Dispatch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Donor Response Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('simulateResponseTitle')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t('simulateAcceptDesc')} for request <span className="font-mono font-bold text-slate-800">{activeRequest.id}</span>:
            </p>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                id="simulate-donor-accept-btn"
                onClick={() => onSimulateDonorResponse('Vikramaditya Sharma (O- Universal Donor)', 'accepted')}
                className="w-full text-left p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    ✓ {t('simulateDonorAccept')}
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Donor: Vikramaditya
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Updates status to "Donor Confirmed - Preparing to donate at Blood Bank".
                </p>
              </button>

              <button
                type="button"
                id="simulate-donor-enroute-btn"
                onClick={() => onSimulateDonorResponse('Dr. Priya Mukherjee (AB+ Donor)', 'en_route')}
                className="w-full text-left p-3 rounded-lg border border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800">
                    🚗 {t('simulateDonorEnRoute')}
                  </span>
                  <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Donor: Dr. Priya
                  </span>
                </div>
                <p className="text-[11px] text-sky-700 mt-1">
                  Updates status to "Donor En Route - ETA 15 mins to Blood Bank".
                </p>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
            <div className="flex items-center space-x-2 text-xs text-slate-700">
              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-medium text-[11px]">
                Compliant with National Blood Transfusion Council (NBTC) rapid donor privacy protocols.
              </span>
            </div>
          </div>
        </div>

        {/* Live Broadcast Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('broadcastFeed')} ({filteredAlerts.length})
              </h3>
            </div>

            {/* Channel filter tabs */}
            <div className="flex space-x-1">
              {['all', 'whatsapp', 'sms', 'ivr_call'].map((channel) => (
                <button
                  key={channel}
                  onClick={() => setSelectedChannelFilter(channel)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition ${
                    selectedChannelFilter === channel
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {channel.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* List of alerts */}
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                      {getChannelIcon(alert.channel)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          {alert.recipientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {alert.destination}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono bg-slate-50 p-2 rounded border border-slate-200/60">
                        {alert.messagePreview}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      alert.status === 'acknowledged' ? 'bg-sky-100 text-sky-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-0.5" />
                      {alert.sentAt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
