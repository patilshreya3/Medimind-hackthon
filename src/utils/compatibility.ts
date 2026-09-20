import { 
  BloodGroup, 
  ComponentType, 
  UrgencyLevel, 
  MatchScoreBreakdown, 
  PriorityExplanation, 
  Donor,
  BloodBank
} from '../types';

/**
 * Real clinical blood & component compatibility matrix.
 * 
 * CRITICAL CLINICAL TRANSFUSION RULES:
 * 1. Red Blood Cells (PRBC / Whole Blood):
 *    - Recipient O: Universal RBC Recipient is AB+, Universal RBC Donor is O-.
 * 2. Platelets (SDP / RDP) & Plasma (FFP / Cryo):
 *    - Platelets are suspended in 200–300 mL of donor plasma containing isohemagglutinins (anti-A and anti-B antibodies).
 *    - Recipient AB: Universal Platelet/Plasma Recipient is O. BUT for AB recipients, donor plasma MUST NOT contain anti-A or anti-B!
 *      Giving O, A, or B platelets to an AB patient causes acute hemolytic destruction of the recipient's red blood cells.
 *      Therefore, AB recipients must ONLY receive AB platelets (or volume-reduced).
 *    - Recipient A: Can receive A (identical) and AB (no plasma antibodies). MUST NOT receive O or B platelets (anti-A destroys recipient RBCs).
 *    - Recipient B: Can receive B (identical) and AB (no plasma antibodies). MUST NOT receive O or A platelets (anti-B destroys recipient RBCs).
 *    - Recipient O: Can receive O (identical) and AB (universal safe plasma).
 *    - Rh Factor: RhD- recipients (especially females of childbearing potential) MUST receive RhD- platelets to prevent anti-D alloimmunization.
 */
export const COMPATIBILITY_RULES: Record<
  BloodGroup,
  {
    rbcCompatibleDonors: BloodGroup[];
    plasmaPlateletCompatibleDonors: BloodGroup[];
    canDonateRbcTo: BloodGroup[];
    canDonatePlasmaPlateletsTo: BloodGroup[];
    clinicalRationale: string;
  }
> = {
  'O-': {
    rbcCompatibleDonors: ['O-'],
    plasmaPlateletCompatibleDonors: ['O-', 'A-', 'B-', 'AB-'], // Must be Rh- to prevent anti-D alloimmunization
    canDonateRbcTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canDonatePlasmaPlateletsTo: ['O-', 'O+'],
    clinicalRationale: 'O- recipient red cells have no A/B antigens. Platelets must be Rh- to prevent anti-D alloimmunization.',
  },
  'O+': {
    rbcCompatibleDonors: ['O-', 'O+'],
    plasmaPlateletCompatibleDonors: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], // AB plasma has zero antibodies; identical O is first choice
    canDonateRbcTo: ['O+', 'A+', 'B+', 'AB+'],
    canDonatePlasmaPlateletsTo: ['O-', 'O+'],
    clinicalRationale: 'O+ recipients can accept identical O or antibody-safe AB/A/B platelets; Rh+ allows Rh- or Rh+ donors.',
  },
  'A-': {
    rbcCompatibleDonors: ['O-', 'A-'],
    plasmaPlateletCompatibleDonors: ['A-', 'AB-'], // ONLY A- and AB-! O and B are strictly prohibited due to anti-A antibodies hemolyzing patient RBCs
    canDonateRbcTo: ['A-', 'A+', 'AB-', 'AB+'],
    canDonatePlasmaPlateletsTo: ['A-', 'A+', 'O-', 'O+'],
    clinicalRationale: 'A- recipient MUST NOT receive O or B platelets: donor anti-A antibodies cause acute hemolysis of patient red cells.',
  },
  'A+': {
    rbcCompatibleDonors: ['O-', 'O+', 'A-', 'A+'],
    plasmaPlateletCompatibleDonors: ['A+', 'A-', 'AB+', 'AB-'], // A or AB only. Prohibit O and B!
    canDonateRbcTo: ['A+', 'AB+'],
    canDonatePlasmaPlateletsTo: ['A+', 'A-', 'O+', 'O-'],
    clinicalRationale: 'A+ recipient requires A or AB platelets. Giving O or B platelets introduces anti-A antibodies that attack recipient RBCs.',
  },
  'B-': {
    rbcCompatibleDonors: ['O-', 'B-'],
    plasmaPlateletCompatibleDonors: ['B-', 'AB-'], // ONLY B- and AB-! Prohibit O and A!
    canDonateRbcTo: ['B-', 'B+', 'AB-', 'AB+'],
    canDonatePlasmaPlateletsTo: ['B-', 'B+', 'O-', 'O+'],
    clinicalRationale: 'B- recipient MUST NOT receive O or A platelets: donor anti-B antibodies cause acute hemolytic reaction.',
  },
  'B+': {
    rbcCompatibleDonors: ['O-', 'O+', 'B-', 'B+'],
    plasmaPlateletCompatibleDonors: ['B+', 'B-', 'AB+', 'AB-'], // B or AB only. Prohibit O and A!
    canDonateRbcTo: ['B+', 'AB+'],
    canDonatePlasmaPlateletsTo: ['B+', 'B-', 'O+', 'O-'],
    clinicalRationale: 'B+ recipient requires B or AB platelets. Giving O or A platelets introduces anti-B antibodies.',
  },
  'AB-': {
    rbcCompatibleDonors: ['O-', 'A-', 'B-', 'AB-'],
    plasmaPlateletCompatibleDonors: ['AB-'], // Strictly AB- only! Any other group contains anti-A or anti-B that attacks AB red blood cells!
    canDonateRbcTo: ['AB-', 'AB+'],
    canDonatePlasmaPlateletsTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // AB is Universal Platelet/Plasma Donor!
    clinicalRationale: 'AB- recipient has both A and B antigens on red cells. Receiving O, A, or B platelets causes acute hemolysis! Must receive AB- only.',
  },
  'AB+': {
    rbcCompatibleDonors: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    plasmaPlateletCompatibleDonors: ['AB+', 'AB-'], // Strictly AB only!
    canDonateRbcTo: ['AB+'],
    canDonatePlasmaPlateletsTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Platelet/Plasma Donor!
    clinicalRationale: 'AB+ recipient red cells possess A and B antigens. Must receive AB platelets (zero isohemagglutinins in plasma) to avoid hemolytic transfusion reactions.',
  },
};

export function getCompatibleDonorGroups(
  recipientGroup: BloodGroup,
  component: ComponentType
): BloodGroup[] {
  const rules = COMPATIBILITY_RULES[recipientGroup];
  if (!rules) return [recipientGroup];

  if (component === 'platelets_sdp' || component === 'platelets_rdp' || component === 'ffp' || component === 'cryo') {
    return rules.plasmaPlateletCompatibleDonors;
  }
  return rules.rbcCompatibleDonors;
}

export function isDonorCompatible(
  recipientGroup: BloodGroup,
  donorGroup: BloodGroup,
  component: ComponentType
): boolean {
  const compatibleList = getCompatibleDonorGroups(recipientGroup, component);
  return compatibleList.includes(donorGroup);
}

/**
 * Detailed Clinical Safety Explanation for Platelet Compatibility
 */
export function getPlateletSafetyRationale(
  recipientGroup: BloodGroup,
  donorGroup: BloodGroup
): { isSafe: boolean; warningMessage: string; recommendation: string } {
  const isCompatible = isDonorCompatible(recipientGroup, donorGroup, 'platelets_sdp');
  
  if (recipientGroup === donorGroup) {
    return {
      isSafe: true,
      warningMessage: 'ABO & Rh Identical — Highest Transfusion Safety',
      recommendation: 'Optimal primary match. Maximizes platelet count increment (CCI) with zero risk of hemolytic reaction.',
    };
  }

  if (donorGroup.startsWith('AB')) {
    return {
      isSafe: true,
      warningMessage: 'Type AB Plasma Safe Alternative (Zero anti-A / anti-B antibodies in plasma)',
      recommendation: 'AB donor plasma contains no isohemagglutinins to destroy recipient red blood cells. Approved safe alternative.',
    };
  }

  if (!isCompatible) {
    return {
      isSafe: false,
      warningMessage: `⚠️ CONTRAINDICATED IN HOSPITAL: Transfusing ${donorGroup} platelets into ${recipientGroup} patient carries severe risk of Acute Hemolytic Transfusion Reaction!`,
      recommendation: `Donor plasma contains antibodies against recipient red blood cell antigens. In a real hospital, this could destroy recipient RBCs and cause kidney failure. Switch to identical ${recipientGroup} or AB donor.`,
    };
  }

  return {
    isSafe: true,
    warningMessage: 'Clinically acceptable alternative with low-titer antibody clearance.',
    recommendation: 'Monitor post-transfusion vitals as standard medical protocol.',
  };
}

/**
 * 4. 🩸 Donor Rest Period Check:
 * "Did you give blood recently? Then you need to rest first."
 * - Whole Blood / PRBC: 90 days minimum rest between donations
 * - Platelets (Apheresis SDP): 14 days minimum rest
 */
export interface DonorRestStatus {
  isEligible: boolean;
  daysSinceLastDonation: number;
  minRestDaysRequired: number;
  daysRemainingToRest: number;
  nextEligibleDate: string;
  statusBadge: 'eligible' | 'resting' | 'overdue';
  explanationText: string;
}

export function checkDonorRestPeriod(
  lastDonationDateStr: string,
  component: ComponentType = 'whole_blood'
): DonorRestStatus {
  const lastDate = new Date(lastDonationDateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isPlatelet = component.includes('platelet');
  const minRestDays = isPlatelet ? 14 : 90;
  const isEligible = daysSince >= minRestDays;
  const daysRemaining = Math.max(0, minRestDays - daysSince);

  const nextEligibleDateObj = new Date(lastDate.getTime() + minRestDays * 24 * 60 * 60 * 1000);
  const nextEligibleDate = nextEligibleDateObj.toISOString().split('T')[0];

  let statusBadge: 'eligible' | 'resting' | 'overdue' = isEligible ? 'eligible' : 'resting';
  if (daysSince > 180) statusBadge = 'overdue';

  let explanationText = '';
  if (!isEligible) {
    explanationText = `Needs rest: Last donated ${daysSince} days ago. Mandatory recovery interval is ${minRestDays} days (${daysRemaining} days remaining until ${nextEligibleDate}).`;
  } else {
    explanationText = `Eligible: ${daysSince} days since last donation (Mandatory ${minRestDays} days rest period fulfilled). Safe to donate.`;
  }

  return {
    isEligible,
    daysSinceLastDonation: daysSince,
    minRestDaysRequired: minRestDays,
    daysRemainingToRest: daysRemaining,
    nextEligibleDate,
    statusBadge,
    explanationText,
  };
}

/**
 * 5. ⏳ Component Expiry & Shelf-Life Tracker
 * Warns medical staff when blood or platelets near expiration (FEFO: First Expired, First Out)
 */
export interface ComponentExpiryInfo {
  hoursRemaining: number;
  shelfLifeDaysTotal: number;
  storageCondition: string;
  expiryUrgency: 'critical_expiring_soon' | 'moderate' | 'safe' | 'expired';
  warningMessage: string;
  actionRecommendation: string;
}

export function getComponentExpiryDetails(
  component: ComponentType,
  collectedHoursAgo: number = 48
): ComponentExpiryInfo {
  let shelfLifeDays = 35;
  let storageCondition = '2°C–6°C Refrigerator';

  if (component === 'platelets_sdp' || component === 'platelets_rdp') {
    shelfLifeDays = 5; // 5 days only!
    storageCondition = '20°C–24°C Agitator Incubator (5-day strict expiry)';
  } else if (component === 'ffp' || component === 'cryo') {
    shelfLifeDays = 365;
    storageCondition = '-18°C or colder Deep Freezer';
  }

  const totalShelfLifeHours = shelfLifeDays * 24;
  const hoursRemaining = Math.max(0, totalShelfLifeHours - collectedHoursAgo);

  let expiryUrgency: ComponentExpiryInfo['expiryUrgency'] = 'safe';
  let warningMessage = 'Stable Shelf-Life';
  let actionRecommendation = 'Standard inventory rotation';

  if (hoursRemaining <= 0) {
    expiryUrgency = 'expired';
    warningMessage = '⛔ EXPIRED UNIT — DO NOT TRANSFUSE';
    actionRecommendation = 'Quarantine unit immediately for disposal audit';
  } else if (hoursRemaining <= 24) {
    expiryUrgency = 'critical_expiring_soon';
    warningMessage = `⚠️ CRITICAL EXPIRY: Only ${hoursRemaining}h remaining! Use immediately to prevent medical wastage.`;
    actionRecommendation = 'Prioritize for immediate dispatch to nearest trauma / emergency surgery';
  } else if (hoursRemaining <= 48) {
    expiryUrgency = 'moderate';
    warningMessage = `🟡 EXPIRING SOON: ${Math.round(hoursRemaining / 24)} days remaining.`;
    actionRecommendation = 'Recommended for scheduled surgical procedures';
  }

  return {
    hoursRemaining,
    shelfLifeDaysTotal: shelfLifeDays,
    storageCondition,
    expiryUrgency,
    warningMessage,
    actionRecommendation,
  };
}

/**
 * 1. 🧠 AI Emergency Match Score — Main USP
 * Calculates a multi-factor percentage (Compatibility + Distance + Availability + Eligibility + Response ETA)
 */
export function calculateAIMatchScore(
  recipientGroup: BloodGroup,
  component: ComponentType,
  urgency: UrgencyLevel,
  donor: {
    bloodGroup: BloodGroup;
    distanceKm: number;
    isAvailable: boolean;
    lastDonationDate: string;
    responseEtaMinutes?: number;
    eligibleComponents: ComponentType[];
  }
): MatchScoreBreakdown {
  const isCompatible = isDonorCompatible(recipientGroup, donor.bloodGroup, component);
  const isExactMatch = recipientGroup === donor.bloodGroup;

  // Compatibility (30 max)
  let compatScore = 0;
  let compatText = 'Incompatible Blood Profile';
  if (isExactMatch) {
    compatScore = 30;
    compatText = 'Exact 100% ABO & Rh Match';
  } else if (isCompatible) {
    compatScore = 26;
    compatText = 'Immunologically Compatible Alternative';
  }

  // Distance (25 max)
  let distScore = 5;
  if (donor.distanceKm <= 2.5) distScore = 25;
  else if (donor.distanceKm <= 5.0) distScore = 20;
  else if (donor.distanceKm <= 10.0) distScore = 15;
  else if (donor.distanceKm <= 18.0) distScore = 10;

  // Availability (20 max)
  const availScore = donor.isAvailable ? 20 : 0;
  const availText = donor.isAvailable ? 'Immediate Standby Verified' : 'Currently Unavailable';

  // Donation Eligibility & Mandatory Rest Period (15 max)
  const restStatus = checkDonorRestPeriod(donor.lastDonationDate, component);
  const isEligible = restStatus.isEligible && donor.eligibleComponents.includes(component);
  const eligScore = isEligible ? 15 : 0;
  const daysDiff = restStatus.daysSinceLastDonation;

  // Response ETA (10 max)
  const eta = donor.responseEtaMinutes || Math.round(donor.distanceKm * 3.5 + 4);
  let etaScore = 4;
  if (eta <= 10) etaScore = 10;
  else if (eta <= 20) etaScore = 8;
  else if (eta <= 35) etaScore = 6;

  const total = isCompatible ? (compatScore + distScore + availScore + eligScore + etaScore) : 15;

  return {
    overallPercentage: Math.min(99, Math.max(10, total)),
    compatibility: { passed: isCompatible, score: compatScore, details: compatText },
    distance: { passed: donor.distanceKm <= 10, distanceKm: donor.distanceKm, score: distScore },
    availability: { passed: donor.isAvailable, score: availScore, details: availText },
    donationEligibility: { passed: isEligible, daysSinceLast: daysDiff, score: eligScore },
    responseEta: { etaMinutes: eta, score: etaScore },
  };
}

/**
 * 2. 🚦 Dynamic Emergency Priority Score & "Why is this request #1?" Algorithmic Engine
 * Priority = Criticality (40) + Time Remaining (25) + Scarcity (20) + Distance/Logistics (15)
 */
export function calculateDynamicPriorityScore(
  urgency: UrgencyLevel,
  component: ComponentType,
  bloodGroup: BloodGroup,
  unitsRequired: number,
  requiredWithinHours: number,
  patientAge: number,
  nearestDistanceKm: number
): PriorityExplanation {
  // Criticality weight (max 40)
  let criticality = 20;
  if (urgency === 'critical') criticality = 40;
  else if (urgency === 'urgent') criticality = 28;

  // Time remaining weight (max 25)
  let timeWeight = 5;
  if (requiredWithinHours <= 0.5) timeWeight = 25;
  else if (requiredWithinHours <= 1.0) timeWeight = 22;
  else if (requiredWithinHours <= 2.0) timeWeight = 18;
  else if (requiredWithinHours <= 4.0) timeWeight = 12;

  // Scarcity weight (max 20) - O-, AB-, Platelets SDP are highest scarcity
  let scarcity = 8;
  if (bloodGroup === 'O-' || bloodGroup === 'AB-') scarcity += 7;
  if (component === 'platelets_sdp') scarcity += 5; // Platelets expire in 5 days!

  // Distance / Logistics difficulty weight (max 15)
  let distanceWeight = 10;
  if (nearestDistanceKm > 8) distanceWeight = 15; // Harder logistics = needs higher priority dispatch

  // Vulnerability boost
  if (patientAge <= 12 || patientAge >= 65) {
    criticality = Math.min(40, criticality + 3);
  }

  const overall = Math.min(99, Math.max(15, criticality + timeWeight + scarcity + distanceWeight));

  let explanationTitle = 'Standard Clinical Queue';
  let algorithmicReason = 'Scheduled transfusion with stable vitals.';

  if (overall >= 90) {
    explanationTitle = 'CRITICAL CODE RED PRIORITY #1';
    algorithmicReason = `Patient condition requires urgent transfusion within ${Math.round(requiredWithinHours * 60)} min. High-scarcity ${bloodGroup} ${component} requires green-corridor ambulance transit.`;
  } else if (overall >= 70) {
    explanationTitle = 'CODE AMBER URGENT PRIORITY';
    algorithmicReason = `Required within ${requiredWithinHours} hours. Active donor matching underway.`;
  }

  return {
    rank: overall >= 90 ? 1 : overall >= 75 ? 2 : 3,
    overallScore: overall,
    criticalityWeight: criticality,
    timeRemainingWeight: timeWeight,
    scarcityWeight: scarcity,
    distanceWeight: distanceWeight,
    explanationTitle,
    algorithmicReason,
  };
}

export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function calculateTriageScore(
  urgency: UrgencyLevel,
  component: ComponentType,
  unitsRequired: number,
  patientAge: number
): number {
  return calculateDynamicPriorityScore(urgency, component, 'O-', unitsRequired, urgency === 'critical' ? 0.8 : 3, patientAge, 3.2).overallScore;
}
