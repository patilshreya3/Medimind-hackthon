import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  MapPin, 
  Clock, 
  Hospital, 
  QrCode, 
  X,
  Heart,
  Droplet,
  ShieldCheck
} from 'lucide-react';
import { EmergencyRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface OneTapDonorResponseModalProps {
  request: EmergencyRequest;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export const OneTapDonorResponseModal: React.FC<OneTapDonorResponseModalProps> = ({
  request,
  onAccept,
  onDecline,
  onClose,
}) => {
  const { t } = useLanguage();
  const [acceptedState, setAcceptedState] = useState<boolean>(false);

  const handleHelpClick = () => {
    setAcceptedState(true);
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      {/* Smartphone Frame Wrapper */}
      <div className="bg-slate-900 p-3 rounded-[36px] shadow-2xl border-4 border-slate-700 max-w-sm w-full relative">
        {/* Close Modal X */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 cursor-pointer shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Phone Notch */}
        <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
          <div className="w-8 h-1.5 bg-slate-700 rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className="bg-slate-100 rounded-[28px] overflow-hidden min-h-[520px] flex flex-col justify-between text-slate-900">
          {/* Top Lockscreen Notification Banner */}
          <div className="bg-rose-600 text-white p-4 pt-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-200">
              <span className="flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>MEDITECH FLASH SOS</span>
              </span>
              <span>Just now</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              🚨 Emergency Transfusion Alert
            </h3>
            <p className="text-xs text-rose-100 mt-0.5">
              Urgent request for your verified blood profile
            </p>
          </div>

          {/* Body Card */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            {!acceptedState ? (
              <>
                {/* Essential Info Grid */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Blood Required
                      </span>
                      <div className="text-2xl font-black text-rose-600">
                        {request.bloodGroup}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {request.componentType}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Distance & ETA
                      </span>
                      <div className="text-base font-black text-slate-900 flex items-center justify-end space-x-1">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        <span>2.1 km</span>
                      </div>
                      <div className="text-xs font-bold text-rose-600 flex items-center justify-end space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Within 20 min</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-700">
                    <Hospital className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-semibold truncate">{request.hospitalName}</span>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] text-rose-900 leading-snug">
                  <strong>One-Tap Action:</strong> No forms to fill. Tapping <em>I CAN HELP</em> immediately verifies your standby readiness and broadcasts your transit status to the ICU.
                </div>

                {/* Two Big Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleHelpClick}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm tracking-wide shadow-md transition cursor-pointer flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>[ I CAN HELP ]</span>
                  </button>

                  <button
                    onClick={() => {
                      onDecline();
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>[ NOT AVAILABLE ]</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success / En-Route State */
              <div className="space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="text-center">
                  <h4 className="text-base font-black text-slate-900">
                    Transfusion Response Confirmed!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    The medical team at {request.hospitalName} has been notified that you are on your way.
                  </p>
                </div>

                {/* Navigation Card */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Donation Center Destination:</span>
                    <span className="text-emerald-700 font-extrabold">2.1 km away</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Sassoon Blood Bank / Ruby Trauma Gate 2
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition mt-2 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Start Turn-by-Turn Navigation</span>
                  </a>
                </div>

                {/* Priority Donor QR Pass */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <strong className="text-slate-900 block">Express Security QR Pass</strong>
                    Show this pass at hospital gate for instant emergency vehicle parking & priority triage clearance.
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Mobile View
                </button>
              </div>
            )}
          </div>

          {/* Home bar */}
          <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto my-2"></div>
        </div>
      </div>
    </div>
  );
};
