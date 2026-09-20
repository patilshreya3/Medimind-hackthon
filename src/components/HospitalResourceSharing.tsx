import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  X,
  Truck,
  Droplet
} from 'lucide-react';
import { HospitalTransfer, BloodGroup, ComponentType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HospitalResourceSharingProps {
  transfers: HospitalTransfer[];
  onCreateTransfer: (transfer: HospitalTransfer) => void;
}

export const HospitalResourceSharing: React.FC<HospitalResourceSharingProps> = ({
  transfers,
  onCreateTransfer,
}) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [requester, setRequester] = useState('Ruby Hall Clinic Trauma ICU');
  const [donorHospital, setDonorHospital] = useState('Jehangir Multi-Speciality Hospital');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [component, setComponent] = useState<ComponentType>('prbc');
  const [units, setUnits] = useState(4);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransfer: HospitalTransfer = {
      id: `H2H-${Math.floor(1000 + Math.random() * 9000)}`,
      requesterHospital: requester,
      donorHospital: donorHospital,
      bloodGroup: bloodGroup,
      component: component,
      units: units,
      distanceKm: 1.6,
      etaMinutes: 8,
      status: 'in_transit',
      verificationCode: `H2H-AUTH-${Math.floor(100 + Math.random() * 900)}`,
    };
    onCreateTransfer(newTransfer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {t('h2hTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('h2hDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate H2H Transfer</span>
          </button>
        </div>
      </div>

      {/* Active Inter-Hospital Transfers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transfers.map((tr) => (
          <div
            key={tr.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-mono text-xs font-black text-slate-700">
                {tr.id}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-xs flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5" />
                <span className="uppercase">{tr.status.replace('_', ' ')}</span>
              </span>
            </div>

            {/* From Hospital -> To Hospital Route */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Lending Hospital (Source):</span>
                <strong className="text-slate-900">{tr.donorHospital}</strong>
              </div>
              <div className="flex items-center justify-center my-1">
                <div className="h-px bg-slate-300 w-full relative flex items-center justify-center">
                  <span className="bg-white px-2 py-0.5 text-[10px] text-blue-600 font-bold rounded-full border border-blue-200 shadow-2xs">
                    {tr.distanceKm} km • {tr.etaMinutes} min transit
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Requesting ICU (Destination):</span>
                <strong className="text-rose-700">{tr.requesterHospital}</strong>
              </div>
            </div>

            {/* Blood Specification */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-rose-600 text-white font-black rounded-md">
                  {tr.bloodGroup}
                </span>
                <div>
                  <div className="font-bold text-slate-900">{tr.units} Units Required</div>
                  <div className="text-[11px] text-slate-500">{tr.component}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">Auth Code</span>
                <span className="font-mono text-xs font-bold text-indigo-700">{tr.verificationCode}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Network Effect Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950 text-xs flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Network Multiplier:</strong> In traditional setups, if Blood Bank inventory is depleted, hospitals must wait hours for new donors. The MEDITECH H2H Exchange unlocks <em>surplus inventories</em> residing in nearby private and government hospitals within a 5 km cluster, fulfilling requests in under 15 minutes.
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Initiate Inter-Hospital Blood Transfer
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Requesting Hospital (ICU Bedside)
                </label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lending Partner Hospital (Source)
                </label>
                <input
                  type="text"
                  value={donorHospital}
                  onChange={(e) => setDonorHospital(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                  </input>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Broadcast Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
