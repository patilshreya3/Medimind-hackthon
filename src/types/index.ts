export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type ComponentType = 
  | 'whole_blood'
  | 'platelets_sdp'    // Single Donor Platelets
  | 'platelets_rdp'    // Random Donor Platelets
  | 'prbc'             // Packed Red Blood Cells
  | 'ffp'              // Fresh Frozen Plasma
  | 'cryo';            // Cryoprecipitate

export type UrgencyLevel = 'critical' | 'urgent' | 'planned';

export type RequestStatus = 
  | 'triage'
  | 'searching'
  | 'matched'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'transfused';

export interface MatchScoreBreakdown {
  overallPercentage: number; // e.g. 94%
  compatibility: { passed: boolean; score: number; details: string };
  distance: { passed: boolean; distanceKm: number; score: number };
  availability: { passed: boolean; score: number; details: string };
  donationEligibility: { passed: boolean; daysSinceLast: number; score: number };
  responseEta: { etaMinutes: number; score: number };
}

export interface DonorChainNode {
  tier: 'Primary' | 'Backup 1' | 'Backup 2' | 'Tier 2 Expansion' | 'Backup 3';
  donorId: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  distanceKm: number;
  matchScore: number;
  status: 'active' | 'waiting' | 'accepted' | 'declined' | 'en_route' | 'timeout';
  etaMinutes: number;
}

export interface DonorChain {
  requestId: string;
  activeDonorId: string | null;
  nodes: DonorChainNode[];
  failoverHistory: string[];
}

export interface PriorityExplanation {
  rank: number;
  overallScore: number; // e.g. 98
  criticalityWeight: number; // e.g. 40
  timeRemainingWeight: number; // e.g. 25
  scarcityWeight: number; // e.g. 20
  distanceWeight: number; // e.g. 15
  explanationTitle: string;
  algorithmicReason: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientCondition: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalDepartment: string;
  hospitalContact: string;
  hospitalCoordinates: [number, number]; // [lat, lng]
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  unitsRequired: number;
  urgency: UrgencyLevel;
  requiredWithinHours: number;
  createdAt: string;
  status: RequestStatus;
  triageScore: number; // 0 - 100
  priorityExplanation?: PriorityExplanation;
  donorChain?: DonorChain;
  privacyMasked: boolean;
  hospitalVerificationId: string;
  matchedSourceType?: 'blood_bank' | 'donor' | 'hospital_transfer';
  matchedSourceName?: string;
  matchedDistanceKm?: number;
  coldChainTemp?: number; // degrees Celsius
  transitEstimatedArrival?: string;
  transitCurrentLocation?: string;
  transitProgressPercent?: number; // 0 - 100
  deliveryTimestamp?: string;
  doctorNotes?: string;
  notifiedCount?: {
    donors: number;
    bloodBanks: number;
  };
}

export interface BloodBank {
  id: string;
  name: string;
  hindiName: string;
  type: 'Government Apex' | 'Red Cross' | 'Charitable' | 'Private Multi-Specialty';
  address: string;
  city: string;
  contact: string;
  licenseNumber: string;
  distanceKm: number;
  coordinates: [number, number];
  is24x7: boolean;
  coldChainCertified: boolean;
  lastUpdatedMinutesAgo: number;
  inventory: Record<BloodGroup, Record<ComponentType, number>>;
  matchScore?: MatchScoreBreakdown;
  isSimulatedOffline?: boolean; // For What-If Simulator
}

export interface Donor {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  bloodGroup: BloodGroup;
  eligibleComponents: ComponentType[];
  phone: string;
  distanceKm: number;
  coordinates: [number, number];
  isAvailable: boolean;
  lastDonationDate: string; // YYYY-MM-DD
  donationsCount: number;
  isVerified: boolean;
  responseStatus: 'pending' | 'accepted' | 'declined' | 'en_route';
  responseEtaMinutes?: number;
  matchScore?: MatchScoreBreakdown;
}

export interface AlertLog {
  id: string;
  requestId: string;
  channel: 'sms' | 'whatsapp' | 'ivr_call' | 'in_app';
  recipientType: 'Donor' | 'Blood Bank' | 'Hospital Coordinator';
  recipientName: string;
  destination: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'acknowledged' | 'accepted' | 'declined';
  messagePreview: string;
}

export interface TransitTelemetry {
  requestId: string;
  carrierType: 'Specialized Blood Courier Ambulance' | 'Emergency Medical Drone' | 'Rapid Transit Bike';
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  coldChainTempCelsius: number;
  tempStatus: 'optimal' | 'warning' | 'critical';
  targetTempRange: string;
  batteryLevel: number;
  currentSpeedKmh: number;
  distanceRemainingKm: number;
  etaMinutes: number;
  routeCheckpoints: {
    name: string;
    completed: boolean;
    timestamp?: string;
  }[];
}

// 3. Heatmap Zone Data
export interface HeatmapZone {
  id: string;
  name: string;
  hindiName: string;
  demandLevel: 'high' | 'medium' | 'low';
  color: string;
  activeRequestsCount: number;
  bloodBanksCount: number;
  verifiedDonorsCount: number;
  criticalShortages: BloodGroup[];
  coordinates: [number, number];
  radiusKm: number;
}

// 4. Shortage Prediction
export interface ShortagePrediction {
  id: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  currentStock: number;
  avgEmergencyDemand: number;
  predictedShortage: number;
  predictedTimeframe: string; // e.g. "Next 6 Hours"
  riskLevel: 'critical' | 'high' | 'moderate';
  verifiedDonorsToAlert: number;
  isPreAlertSent: boolean;
}

// 5. AI Emergency Coordinator Message
export interface AICoordinatorMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  triagedCard?: {
    urgency: UrgencyLevel;
    bloodGroup: BloodGroup;
    component: ComponentType;
    compatibleBanksFound: number;
    eligibleDonorsFound: number;
    nearestResourceDistance: string;
    estimatedResponseEta: string;
    recommendedAction: string;
  };
}

// 9. Hospital to Hospital Transfer Request
export interface HospitalTransfer {
  id: string;
  requesterHospital: string;
  donorHospital: string;
  bloodGroup: BloodGroup;
  component: ComponentType;
  units: number;
  distanceKm: number;
  etaMinutes: number;
  status: 'requested' | 'approved' | 'in_transit' | 'received';
  verificationCode: string;
}

// 10. Mass Casualty Event
export interface MassCasualtyEvent {
  isActive: boolean;
  eventName: string;
  incidentLocation: string;
  patientsCount: number;
  activatedAt?: string;
  aggregateRequirements: {
    bloodGroup: BloodGroup;
    unitsRequired: number;
    unitsFulfilled: number;
  }[];
  plateletsRequired: number;
  plateletsFulfilled: number;
  participatingHospitals: string[];
  notifiedDonorsCount: number;
}
