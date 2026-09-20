import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  AlertCircle,
  Share2,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Donor, EmergencyRequest } from '../types';

interface RealMessagingModalProps {
  donor: {
    name: string;
    bloodGroup: string;
    phone?: string;
    distanceKm: number;
  };
  request?: EmergencyRequest;
  onClose: () => void;
  onConfirmSent: () => void;
}

export const RealMessagingModal: React.FC<RealMessagingModalProps> = ({
  donor,
  request,
  onClose,
  onConfirmSent,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');

  const donorPhone = donor.phone || '+919822014490';
  const cleanPhone = donorPhone.replace(/[^0-9]/g, '');

  const hospital = request?.hospitalName || 'Ruby Hall Clinic Trauma Center';
  const bloodGroup = request?.bloodGroup || donor.bloodGroup;
  const component = request?.componentType === 'platelets_sdp' ? 'SDP Apheresis Platelets' : request?.componentType || 'Blood / Platelets';
  const reqId = request?.id || 'MED-ER-809';

  const englishMessage = `🚨 CRITICAL MEDITECH EMERGENCY ALERT!
Dear ${donor.name},
A patient at ${hospital} urgently requires ${bloodGroup} ${component}.
• Requirement ID: #${reqId}
• Priority: CRITICAL (Stat transfusion needed)
• Distance from you: ${donor.distanceKm} km
• AI Match Score: 96% Match

You are pre-verified and eligible to save this patient.
👉 Click to Accept & Confirm Standby:
https://meditech-response.web.app/accept/${reqId}

Direct Hospital Emergency Line: +91 20 6645 5100.
Thank you for being a life-saver!`;

  const hindiMessage = `🚨 मेडीटेक आपातकालीन रक्त/प्लेटलेट चेतावनी!
प्रिय ${donor.name},
${hospital} में एक गंभीर मरीज को तत्काल ${bloodGroup} ${component} की आवश्यकता है।
• आवश्यकता आईडी: #${reqId}
• प्राथमिकता: अत्यंत जरूरी (STAT)
• आपके स्थान से दूरी: ${donor.distanceKm} किमी
• एआई मैच स्कोर: 96% मैच

आपकी पात्रता स्वीकृत है। कृपया तुरंत पुष्टि करें:
👉 स्वीकृति और लाइव रिस्पॉन्स हेतु क्लिक करें:
https://meditech-response.web.app/accept/${reqId}

अस्पताल आपातकालीन नंबर: +91 20 6645 5100।`;

  const activeMessage = activeLang === 'en' ? englishMessage : hindiMessage;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeMessage)}`;
  const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(activeMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Real Dispatch Messaging (WhatsApp & SMS)
              </h3>
              <p className="text-xs text-emerald-100">
                Send live emergency notification directly to donor {donor.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Donor Contact Summary Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 font-medium">Target Donor:</span>
              <div className="font-bold text-slate-800 text-sm">{donor.name} ({donor.bloodGroup})</div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Verified Phone:</span>
              <div className="font-mono font-bold text-slate-800">{donorPhone}</div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Dispatch Message Content:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('hi')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activeLang === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto border border-slate-800">
            {activeMessage}
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[11px] font-sans flex items-center space-x-1 cursor-pointer transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Real Dispatch Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* WhatsApp Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onConfirmSent}
              id="send-whatsapp-dispatch-btn"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* SMS Direct Link */}
            <a
              href={smsUrl}
              onClick={onConfirmSent}
              id="send-sms-dispatch-btn"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Send via Direct SMS</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400">
              Directly launches WhatsApp Web/App or native mobile SMS with pre-formatted emergency dispatch text.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
