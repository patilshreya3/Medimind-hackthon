import React, { useState } from 'react';
import { 
  Layers, 
  Droplet, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  Info,
  Sparkles
} from 'lucide-react';
import { BloodGroup, ComponentType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { COMPATIBILITY_RULES, getCompatibleDonorGroups } from '../utils/compatibility';

export const CompatibilityMatrixModal: React.FC = () => {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('B+');
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('platelets_sdp');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const compatibleDonors = getCompatibleDonorGroups(selectedGroup, selectedComponent);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {t('compatTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('compatSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Selection Engine */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Interactive Compatibility Matcher
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Select Recipient Blood Group */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. Select Recipient Blood Group
            </label>
            <div className="grid grid-cols-4 gap-2">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2.5 rounded-lg text-sm font-extrabold border transition cursor-pointer ${
                    selectedGroup === bg
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Component Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              2. Select Component Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'platelets_sdp', label: 'Platelets (SDP / Apheresis)' },
                { id: 'prbc', label: 'PRBC (Packed Red Blood Cells)' },
                { id: 'whole_blood', label: 'Whole Blood (WB)' },
                { id: 'ffp', label: 'Fresh Frozen Plasma (FFP)' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedComponent(c.id as ComponentType)}
                  className={`p-2 rounded-lg text-xs font-semibold text-left border transition cursor-pointer ${
                    selectedComponent === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Match Result Banner */}
        <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Matching Algorithm Output
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                For Recipient <span className="text-rose-600 font-extrabold">{selectedGroup}</span> requiring <span className="underline">{selectedComponent}</span>:
              </h4>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">
                Compatible Donors:
              </span>
              <div className="flex flex-wrap gap-1">
                {compatibleDonors.map((bg) => (
                  <span
                    key={bg}
                    className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-black rounded shadow-2xs"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              {selectedComponent.includes('platelet') || selectedComponent === 'ffp' ? (
                <div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs mb-2">
                    <strong className="font-black text-rose-700">⚠️ Critical Clinical Transfusion Rule (Platelets vs RBCs):</strong> Platelet units contain 200–300 mL of plasma with donor antibodies. 
                    Unlike red blood cells where Type O is universal donor, in platelets <strong>Type O plasma contains anti-A and anti-B antibodies</strong>. 
                    If Type O platelets are transfused into an A, B, or AB recipient, the infused donor antibodies can rapidly attack and destroy the patient's red blood cells (Acute Hemolytic Transfusion Reaction)!
                    Therefore, <strong>Type AB is the universal platelet donor</strong> (zero plasma antibodies), and AB patients must receive AB platelets only.
                  </div>
                  <span>
                    <strong className="text-slate-800">Current Transfusion Guideline for {selectedGroup} Platelets:</strong> {COMPATIBILITY_RULES[selectedGroup].clinicalRationale}
                  </span>
                </div>
              ) : (
                <span>
                  <strong className="text-slate-800">Red Blood Cell (PRBC/WB) Rule:</strong> Group <strong>O-</strong> lacks A, B, and Rh antigens on red cell membranes, making it the <em>Universal Red Cell Donor</em> for acute life-threatening trauma before antibody cross-matching is complete. Group <strong>AB+</strong> is the <em>Universal Red Cell Recipient</em>.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Transfusion Matrix Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Complete Scientific Compatibility Reference Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold">
                <th className="p-3 border border-slate-200">Patient / Recipient</th>
                <th className="p-3 border border-slate-200">Red Blood Cells (PRBC/WB) Donors</th>
                <th className="p-3 border border-slate-200">Platelets (SDP/RDP) & Plasma Donors</th>
                <th className="p-3 border border-slate-200">Clinical Emergency Note</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-800 divide-y divide-slate-200">
              {bloodGroups.map((bg) => {
                const rules = COMPATIBILITY_RULES[bg];
                return (
                  <tr key={bg} className={bg === selectedGroup ? 'bg-rose-50/60 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="p-3 border border-slate-200 font-bold text-rose-600">
                      {bg}
                    </td>
                    <td className="p-3 border border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {rules.rbcCompatibleDonors.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 border border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {rules.plasmaPlateletCompatibleDonors.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[11px] font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-500 text-[11px]">
                      {bg === 'O-' && 'Universal RBC Donor • High scarcity emergency reserve.'}
                      {bg === 'O+' && 'Most common group • High volume demand in trauma.'}
                      {bg === 'AB+' && 'Universal RBC Recipient • Universal Platelet/Plasma Donor.'}
                      {bg === 'AB-' && 'Rare recipient • AB platelets optimal for pediatric cases.'}
                      {bg.includes('A') && 'Standard major/minor crossmatch required.'}
                      {bg.includes('B') && 'High prevalence in Northern & Western India.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
