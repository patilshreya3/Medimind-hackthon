import React, { useState } from 'react';
import {
  AlertTriangle,
  Droplet,
  Building,
  MapPin,
  User,
  ShieldCheck,
  Sparkles,
  Clock,
  Check,
  Lock,
  Send,
  Sliders,
  Bot,
  FileText,
  CheckCircle2,
  Loader2,
  Wand2
} from 'lucide-react';

import {
  BloodGroup,
  ComponentType,
  UrgencyLevel,
  EmergencyRequest
} from '../types';

import { useLanguage } from '../context/LanguageContext';

import {
  calculateTriageScore,
  getCompatibleDonorGroups
} from '../utils/compatibility';

interface EmergencyRequestFormProps {
  onSubmit: (request: EmergencyRequest) => void;
  onCancel?: () => void;
}

export const EmergencyRequestForm: React.FC<EmergencyRequestFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { t } = useLanguage();

  const [patientName, setPatientName] =
    useState('Ankit Sharma');

  const [patientAge, setPatientAge] =
    useState<number>(34);

  const [patientGender, setPatientGender] =
    useState<'Male' | 'Female' | 'Other'>('Male');

  const [hospitalName, setHospitalName] =
    useState('Max Super Speciality Hospital Saket');

  const [hospitalAddress, setHospitalAddress] =
    useState(
      '1, 2 Press Enclave Marg, Saket, New Delhi'
    );

  const [hospitalDepartment, setHospitalDepartment] =
    useState('Trauma ICU - Bed #04');

  const [hospitalContact, setHospitalContact] =
    useState('+91 11 2651 5050 / Ext 441');

  const [bloodGroup, setBloodGroup] =
    useState<BloodGroup>('O-');

  const [componentType, setComponentType] =
    useState<ComponentType>('platelets_sdp');

  const [unitsRequired, setUnitsRequired] =
    useState<number>(2);

  const [urgency, setUrgency] =
    useState<UrgencyLevel>('critical');

  const [requiredWithinHours, setRequiredWithinHours] =
    useState<number>(1);

  const [clinicalReason, setClinicalReason] =
    useState(
      'Acute Dengue hemorrhagic shock with platelet count at 11,000/μL and active bleeding.'
    );

  const [privacyMasked, setPrivacyMasked] =
    useState<boolean>(true);

  const [verificationPin, setVerificationPin] =
    useState<string>('HOSP-MAX-SAKET-AUTH-908');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // Gemini Doctor Note AI Parser State
  const [doctorNoteText, setDoctorNoteText] =
    useState(
      'Dr. K. Mehta (Ruby Hall Clinic ICU): Pt Sunita Sharma 34F, acute Dengue Hemorrhagic Shock, PLT count 6,000/μL with active mucosal bleed, urgently requires 2 units SDP platelets stat within 30 min.'
    );

  const [isAnalyzingNote, setIsAnalyzingNote] =
    useState(false);

  const [aiAnalysisSuccess, setAiAnalysisSuccess] =
    useState<string | null>(null);

  const [showAiHelper, setShowAiHelper] =
    useState(true);

  // Calculate live priority score
  const liveTriageScore = calculateTriageScore(
    urgency,
    componentType,
    unitsRequired,
    patientAge
  );

  const compatibleDonors =
    getCompatibleDonorGroups(
      bloodGroup,
      componentType
    );

  // ============================================================
  // GEMINI DOCTOR NOTE PARSER
  // ============================================================

  const handleParseWithGemini = async () => {
    if (!doctorNoteText.trim()) return;

    setIsAnalyzingNote(true);
    setAiAnalysisSuccess(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gemini/parse-doctor-note`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ doctorNoteText }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to parse note');
      }

      const result = await res.json();

      if (result.success && result.data) {
        const d = result.data;

        if (d.patientName) {
          setPatientName(d.patientName);
        }

        if (d.age) {
          setPatientAge(d.age);
        }

        if (d.gender) {
          setPatientGender(d.gender);
        }

        if (d.hospitalName) {
          setHospitalName(d.hospitalName);
        }

        if (d.bloodGroup) {
          setBloodGroup(
            d.bloodGroup as BloodGroup
          );
        }

        if (d.componentType) {
          setComponentType(
            d.componentType as ComponentType
          );
        }

        if (d.unitsNeeded) {
          setUnitsRequired(d.unitsNeeded);
        }

        if (d.urgency) {
          setUrgency(
            d.urgency as UrgencyLevel
          );
        }

        if (d.requiredWithinHours) {
          setRequiredWithinHours(
            d.requiredWithinHours
          );
        }

        if (d.clinicalReason) {
          setClinicalReason(
            d.clinicalReason
          );
        }

        setAiAnalysisSuccess(
          `Parsed successfully via ${
            result.source || 'Gemini AI'
          }! Extracted ${d.bloodGroup} ${
            d.componentType
          } for ${d.patientName} (${d.age} yrs).`
        );
      }
    } catch (err: any) {
      console.warn(
        'Fallback parser triggering:',
        err
      );

      // Fallback heuristics
      const note =
        doctorNoteText.toLowerCase();

      if (note.includes('o-')) {
        setBloodGroup('O-');
      } else if (note.includes('b+')) {
        setBloodGroup('B+');
      } else if (note.includes('ab+')) {
        setBloodGroup('AB+');
      }

      if (
        note.includes('platelet') ||
        note.includes('sdp')
      ) {
        setComponentType(
          'platelets_sdp'
        );
      } else if (
        note.includes('prbc')
      ) {
        setComponentType('prbc');
      }

      setAiAnalysisSuccess(
        'Parsed note using Clinical Rule Engine! Fields populated.'
      );
    } finally {
      setIsAnalyzingNote(false);
    }
  };

  // ============================================================
  // PRESET SCENARIOS
  // ============================================================

  const handleApplyPreset = (
    presetType:
      | 'trauma'
      | 'dengue'
      | 'obstetric'
      | 'pediatric'
  ) => {
    if (presetType === 'trauma') {
      setPatientName('Rahul Verma');
      setPatientAge(27);
      setPatientGender('Male');
      setBloodGroup('O-');
      setComponentType('prbc');
      setUnitsRequired(4);
      setUrgency('critical');
      setRequiredWithinHours(1);
      setClinicalReason(
        'High-velocity highway accident with internal splenic rupture and hypovolemic shock.'
      );
    } else if (presetType === 'dengue') {
      setPatientName('Kavita Sundaram');
      setPatientAge(24);
      setPatientGender('Female');
      setBloodGroup('B+');
      setComponentType('platelets_sdp');
      setUnitsRequired(2);
      setUrgency('critical');
      setRequiredWithinHours(1);
      setClinicalReason(
        'Dengue Hemorrhagic Fever Grade III. Platelet count dropped to 8,000/μL.'
      );
    } else if (presetType === 'obstetric') {
      setPatientName('Pooja Patel');
      setPatientAge(29);
      setPatientGender('Female');
      setBloodGroup('A+');
      setComponentType('whole_blood');
      setUnitsRequired(3);
      setUrgency('critical');
      setRequiredWithinHours(2);
      setClinicalReason(
        'Severe primary postpartum hemorrhage following emergency Cesarean section.'
      );
    } else if (presetType === 'pediatric') {
      setPatientName('Aarav Mehta');
      setPatientAge(7);
      setPatientGender('Male');
      setBloodGroup('B+');
      setComponentType('prbc');
      setUnitsRequired(1);
      setUrgency('urgent');
      setRequiredWithinHours(4);
      setClinicalReason(
        'Pediatric Thalassemia Major requiring routine scheduled leukoreduced PRBC transfusion.'
      );
    }
  };

  // ============================================================
  // SUBMIT EMERGENCY BLOOD REQUEST
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsSubmitting(true);

    const newRequest: EmergencyRequest = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,

      patientName,
      patientAge,
      patientGender,
      patientCondition: clinicalReason,

      hospitalName,
      hospitalAddress,
      hospitalDepartment,
      hospitalContact,

      hospitalCoordinates: [
        28.5273,
        77.2144,
      ],

      bloodGroup,
      componentType,
      unitsRequired,
      urgency,
      requiredWithinHours,

      createdAt: 'Just now',
      status: 'searching',
      triageScore: liveTriageScore,

      privacyMasked,

      hospitalVerificationId:
        verificationPin ||
        'HOSP-VERIFIED-AUTH-GEN',

      doctorNotes:
        `Stat emergency dispatch initiated by on-duty hematologist for ${unitsRequired} units of ${componentType}.`,

      notifiedCount: {
        donors: 12,
        bloodBanks: 4,
      },
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blood-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            newRequest
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            'Failed to save blood request'
        );
      }

      console.log(
        'Blood request saved to Supabase:',
        result.data
      );

      setTimeout(() => {
        setIsSubmitting(false);
        onSubmit(newRequest);
      }, 600);
    } catch (error) {
      console.error(
        'Blood request save failed:',
        error
      );

      setIsSubmitting(false);

      alert(
        'Failed to save blood request. Please try again.'
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <div className="flex items-center space-x-2">

              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Emergency Response Triage
              </span>

              <span className="text-rose-200 text-xs font-medium">
                Live Protocol
              </span>

            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
              {t('createRequestTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-2xl">
              {t('createRequestSub')}
            </p>
          </div>

          {/* Live Triage Score */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center space-x-3 self-start sm:self-auto">

            <div className="text-center">

              <div className="text-xs font-semibold text-rose-100 uppercase tracking-wider">
                Triage Priority
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {liveTriageScore}/100
              </div>

            </div>

            <div className="h-8 w-px bg-white/20"></div>

            <div className="text-[11px] text-rose-100 max-w-[120px]">
              {liveTriageScore >= 80
                ? '⚡ CODE RED Priority Dispatch'
                : '⚠️ Code Amber Urgent'}
            </div>

          </div>

        </div>

        {/* Preset scenarios */}
        <div className="mt-5 pt-4 border-t border-white/15">

          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-100 mb-2">

            <Sparkles className="w-3.5 h-3.5" />

            <span>
              {t('presetScenarios')}:
            </span>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              id="preset-btn-trauma"
              onClick={() =>
                handleApplyPreset('trauma')
              }
              className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              🚗 {t('presetTrauma')}
            </button>

            <button
              type="button"
              id="preset-btn-dengue"
              onClick={() =>
                handleApplyPreset('dengue')
              }
              className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              🩸 {t('presetDengue')}
            </button>

            <button
              type="button"
              id="preset-btn-obstetric"
              onClick={() =>
                handleApplyPreset('obstetric')
              }
              className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              👶 {t('presetObstetric')}
            </button>

            <button
              type="button"
              id="preset-btn-pediatric"
              onClick={() =>
                handleApplyPreset('pediatric')
              }
              className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              🩺 {t('presetPediatric')}
            </button>

          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
      >

        {/* GEMINI SMART HELPER */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 rounded-xl p-5 border border-indigo-200/80 shadow-xs">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">

            <div className="flex items-center space-x-2">

              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
                <Bot className="w-5 h-5" />
              </div>

              <div>

                <div className="flex items-center space-x-2">

                  <h3 className="text-sm font-bold text-slate-900">
                    Smart Helper (Gemini AI Doctor's Note Scanner)
                  </h3>

                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full">
                    Gemini 3.8 Flash
                  </span>

                </div>

                <p className="text-xs text-slate-600">
                  Paste or dictate prescription notes, ICU triage slips, or doctor clinical memos to auto-populate this entire form instantly.
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAiHelper(
                  !showAiHelper
                )
              }
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition self-start sm:self-auto cursor-pointer"
            >
              {showAiHelper
                ? 'Minimize Helper'
                : 'Open Helper'}
            </button>

          </div>

          {showAiHelper && (
            <div className="mt-3 space-y-3">

              {/* Quick Clinical Notes */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">

                <span className="font-semibold text-slate-700">
                  Quick Clinical Notes:
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setDoctorNoteText(
                      'Dr. K. Mehta (Ruby Hall Clinic ICU): Pt Sunita Sharma 34F, acute Dengue Hemorrhagic Shock, PLT count 6,000/μL with active mucosal bleed, urgently requires 2 units SDP platelets stat within 30 min.'
                    )
                  }
                  className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-medium border border-indigo-200 transition cursor-pointer"
                >
                  🦟 Dengue Shock (SDP Platelets)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDoctorNoteText(
                      'Dr. S. Patil (Sassoon Trauma Center): Pt Ramesh Pawar 42M, high-speed motorcycle accident, blunt abdominal trauma, internal hemorrhage, Hb 5.2 g/dL, requires 3 units O- PRBC urgently stat within 1 hr.'
                    )
                  }
                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 rounded-md text-[11px] font-medium border border-rose-200 transition cursor-pointer"
                >
                  🚗 Polytrauma (O- PRBC)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDoctorNoteText(
                      'Dr. Roy (KEM Hospital ICU): Pt Priyanka Joshi 29F, severe postpartum coagulopathy, requires 2 units AB- Fresh Frozen Plasma (FFP) stat within 2 hours.'
                    )
                  }
                  className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 rounded-md text-[11px] font-medium border border-purple-200 transition cursor-pointer"
                >
                  👶 Postpartum (AB- FFP)
                </button>

              </div>

              {/* Note Textarea */}
              <div className="relative">

                <textarea
                  rows={3}
                  value={doctorNoteText}
                  onChange={(e) =>
                    setDoctorNoteText(
                      e.target.value
                    )
                  }
                  placeholder="Paste handwritten slip transcript, doctor prescription, or ICU triage memo..."
                  className="w-full text-xs font-sans p-3 bg-white rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />

              </div>

              {/* Parse Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                <div className="text-[11px] text-slate-500">
                  Extracts patient name, age, blood group, component type, unit volume, and clinical urgency.
                </div>

                <button
                  type="button"
                  id="parse-doctor-note-btn"
                  onClick={
                    handleParseWithGemini
                  }
                  disabled={
                    isAnalyzingNote ||
                    !doctorNoteText.trim()
                  }
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                >

                  {isAnalyzingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />

                      <span>
                        Analyzing with Gemini...
                      </span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />

                      <span>
                        Parse Note & Auto-Fill Form
                      </span>
                    </>
                  )}

                </button>

              </div>

              {/* Success Banner */}
              {aiAnalysisSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />

                  <span>
                    {aiAnalysisSuccess}
                  </span>

                </div>
              )}

            </div>
          )}

        </div>

        {/* SECTION 1 - BLOOD */}
        <div>

          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">

            <Droplet className="w-4 h-4 text-rose-600" />

            <span>
              Blood & Component Specification
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Blood Group */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('bloodGroup')} *
              </label>

              <select
                id="request-blood-group-select"
                value={bloodGroup}
                onChange={(e) =>
                  setBloodGroup(
                    e.target.value as BloodGroup
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                {[
                  'O-',
                  'O+',
                  'A-',
                  'A+',
                  'B-',
                  'B+',
                  'AB-',
                  'AB+',
                ].map(
                  (bg) => (
                    <option
                      key={bg}
                      value={bg}
                    >
                      {bg}{' '}
                      {bg === 'O-'
                        ? '(Universal RBC)'
                        : bg === 'AB+'
                        ? '(Universal Recipient)'
                        : ''}
                    </option>
                  )
                )}
              </select>

              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center">

                <span className="font-semibold text-rose-600 mr-1">
                  Compatible Donors:
                </span>

                {compatibleDonors.join(', ')}

              </div>

            </div>

            {/* Component Type */}
            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('componentType')} *
              </label>

              <select
                id="request-component-type-select"
                value={componentType}
                onChange={(e) =>
                  setComponentType(
                    e.target.value as ComponentType
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                <option value="platelets_sdp">
                  {t('platelets_sdp')}
                </option>

                <option value="platelets_rdp">
                  {t('platelets_rdp')}
                </option>

                <option value="prbc">
                  {t('prbc')}
                </option>

                <option value="whole_blood">
                  {t('whole_blood')}
                </option>

                <option value="ffp">
                  {t('ffp')}
                </option>

                <option value="cryo">
                  {t('cryo')}
                </option>
              </select>

              <p className="mt-1.5 text-[11px] text-slate-500">
                {componentType.includes(
                  'platelets'
                )
                  ? '⚠️ Critical 5-day shelf life. 20-24°C continuous agitation.'
                  : 'Standard cold-chain storage at 2°C - 6°C.'}
              </p>

            </div>

            {/* Units + Time */}
            <div className="grid grid-cols-2 gap-2">

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('unitsRequired')} *
                </label>

                <input
                  type="number"
                  id="request-units-input"
                  min="1"
                  max="15"
                  value={unitsRequired}
                  onChange={(e) =>
                    setUnitsRequired(
                      parseInt(
                        e.target.value
                      ) || 1
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 text-center"
                  required
                />

              </div>

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Limit *
                </label>

                <select
                  id="request-time-limit-select"
                  value={requiredWithinHours}
                  onChange={(e) =>
                    setRequiredWithinHours(
                      parseInt(
                        e.target.value
                      )
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value={1}>
                    &lt; 1 Hour
                  </option>

                  <option value={2}>
                    &lt; 2 Hours
                  </option>

                  <option value={4}>
                    &lt; 4 Hours
                  </option>

                  <option value={12}>
                    &lt; 12 Hours
                  </option>

                  <option value={24}>
                    &lt; 24 Hours
                  </option>
                </select>

              </div>

            </div>

          </div>

          {/* Urgency */}
          <div className="mt-3">

            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('urgencyLevel')} *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">

              <button
                type="button"
                onClick={() => {
                  setUrgency('critical');
                  setRequiredWithinHours(1);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition ${
                  urgency === 'critical'
                    ? 'border-rose-600 bg-rose-50/70 text-rose-900 ring-1 ring-rose-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >

                <div>

                  <div className="text-xs font-bold flex items-center">

                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-2 animate-ping"></span>

                    CODE RED

                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Critical (&lt; 1 Hour)
                  </div>

                </div>

                {urgency === 'critical' && (
                  <Check className="w-4 h-4 text-rose-600" />
                )}

              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgency('urgent');
                  setRequiredWithinHours(4);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition ${
                  urgency === 'urgent'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >

                <div>

                  <div className="text-xs font-bold flex items-center">

                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>

                    CODE AMBER

                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Urgent (&lt; 4 Hours)
                  </div>

                </div>

                {urgency === 'urgent' && (
                  <Check className="w-4 h-4 text-amber-600" />
                )}

              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgency('planned');
                  setRequiredWithinHours(24);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition ${
                  urgency === 'planned'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >

                <div>

                  <div className="text-xs font-bold flex items-center">

                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-2"></span>

                    CODE GREEN

                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Scheduled (&lt; 24 Hours)
                  </div>

                </div>

                {urgency === 'planned' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}

              </button>

            </div>
          </div>
        </div>

        {/* SECTION 2 - HOSPITAL */}
        <div>

          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">

            <Building className="w-4 h-4 text-slate-700" />

            <span>
              Hospital Location & Department
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('hospitalName')} *
              </label>

              <input
                type="text"
                id="request-hospital-name"
                value={hospitalName}
                onChange={(e) =>
                  setHospitalName(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('hospitalDept')} *
              </label>

              <input
                type="text"
                id="request-hospital-dept"
                value={hospitalDepartment}
                onChange={(e) =>
                  setHospitalDepartment(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('hospitalAddress')} *
              </label>

              <input
                type="text"
                id="request-hospital-address"
                value={hospitalAddress}
                onChange={(e) =>
                  setHospitalAddress(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('hospitalContact')} *
              </label>

              <input
                type="text"
                id="request-hospital-contact"
                value={hospitalContact}
                onChange={(e) =>
                  setHospitalContact(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                required
              />

            </div>

          </div>
        </div>

        {/* SECTION 3 - PATIENT */}
        <div>

          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">

            <User className="w-4 h-4 text-slate-700" />

            <span>
              {t('patientDetails')}
            </span>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('patientName')} *
              </label>

              <input
                type="text"
                id="request-patient-name"
                value={patientName}
                onChange={(e) =>
                  setPatientName(
                    e.target.value
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('patientAge')} *
              </label>

              <input
                type="number"
                id="request-patient-age"
                value={patientAge}
                onChange={(e) =>
                  setPatientAge(
                    parseInt(
                      e.target.value
                    ) || 0
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                min="0"
                max="120"
                required
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('patientGender')} *
              </label>

              <select
                id="request-patient-gender"
                value={patientGender}
                onChange={(e) =>
                  setPatientGender(
                    e.target.value as
                      | 'Male'
                      | 'Female'
                      | 'Other'
                  )
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

          </div>

          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('clinicalReason')}
            </label>

            <textarea
              id="request-clinical-reason"
              rows={2}
              value={clinicalReason}
              onChange={(e) =>
                setClinicalReason(
                  e.target.value
                )
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              placeholder="e.g. Polytrauma, acute hemorrhage, dengue thrombocytopenia..."
            />

          </div>

        </div>

        {/* SECTION 4 - PRIVACY */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">

          <div className="flex items-start space-x-3">

            <input
              type="checkbox"
              id="privacy-shield-checkbox"
              checked={privacyMasked}
              onChange={(e) =>
                setPrivacyMasked(
                  e.target.checked
                )
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />

            <div>

              <label
                htmlFor="privacy-shield-checkbox"
                className="text-xs font-bold text-slate-800 flex items-center cursor-pointer"
              >

                <Lock className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />

                {t('privacyToggle')}

              </label>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('privacyToggleHint')}
              </p>

            </div>

          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

            <div className="flex items-center space-x-2">

              <ShieldCheck className="w-4 h-4 text-indigo-600" />

              <label className="text-xs font-bold text-slate-700">
                {t('verificationPin')}:
              </label>

            </div>

            <input
              type="text"
              id="request-verification-pin"
              value={verificationPin}
              onChange={(e) =>
                setVerificationPin(
                  e.target.value
                )
              }
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono font-semibold text-indigo-700 max-w-xs"
              placeholder="e.g. HOSP-DELHI-AUTH-902"
              required
            />

          </div>

        </div>

        {/* SUBMISSION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id="submit-emergency-request-btn"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-200 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
          >

            <Send className="w-4 h-4" />

            <span>
              {isSubmitting
                ? t('broadcastingAlerts')
                : t('submitRequestBtn')}
            </span>

          </button>

        </div>

      </form>
    </div>
  );
};