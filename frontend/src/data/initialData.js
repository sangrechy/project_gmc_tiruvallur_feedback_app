// Realistic sample data for GMC Thiruvallur Student Council Portal
// Used for local interactive demo mode and initial seeding

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Clinical Postings Schedule Revision - Final Year MBBS",
    category: "IMPORTANT",
    categoryType: "important",
    date: "2026-10-30",
    expiryDate: "2026-11-15",
    pinned: true,
    description: "The revised clinical rotation roster for Medicine and Surgery postings effective from November 3rd has been approved by the Dean's office. All CRRIs and final year students are requested to report to the respective department heads by 8:00 AM."
  },
  {
    id: "ann-2",
    title: "Central Library Extended Hours During University Exam Prep",
    category: "ACADEMIC",
    categoryType: "academic",
    date: "2026-10-28",
    expiryDate: "2026-12-01",
    pinned: true,
    description: "Following representations by the Student Council, the Central Library reading halls will remain open until 11:30 PM on weekdays and 9:00 PM on Sundays throughout November and December."
  },
  {
    id: "ann-3",
    title: "Hostel Water Purifier Maintenance & Cleanliness Drive",
    category: "HOSTEL",
    categoryType: "hostel",
    date: "2026-10-25",
    expiryDate: "2026-11-10",
    pinned: false,
    description: "Quarterly filter replacement and UV sterilizer servicing for Boys and Girls Hostels (Blocks A, B, & C) will be conducted this Saturday. Clean drinking water tanks will also be descaled."
  },
  {
    id: "ann-4",
    title: "Inter-College Medical Quiz & Symposium Registration",
    category: "EVENTS",
    categoryType: "events",
    date: "2026-10-22",
    expiryDate: "2026-11-20",
    pinned: false,
    description: "Registrations are now open for 'PULSE 2026', the annual state-level inter-collegiate medical quiz and clinical case presentation competition hosted at GMC Auditorium."
  }
];

export const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "PULSE 2026 - State Level Clinical Symposium",
    category: "Academic / Symposium",
    date: "14 November 2026",
    time: "09:00 AM - 04:30 PM",
    venue: "Main Medical Auditorium, GMC Thiruvallur",
    description: "Annual medical conference featuring clinical case presentation, clinico-pathological conference (CPC), and rapid-fire spotters for undergraduate medical students.",
    registrationUrl: "https://forms.gle/sampleGMCEventPulse",
    isUpcoming: true
  },
  {
    id: "evt-2",
    title: "Annual Sports Meet - AURA 2026",
    category: "Sports & Fitness",
    date: "22 November 2026",
    time: "07:00 AM - 06:00 PM",
    venue: "College Sports Ground",
    description: "Inter-batch cricket, football, volleyball, badminton, and track athletics events. Trophies for overall batch championship and best athlete.",
    registrationUrl: "https://forms.gle/sampleGMCAuraSports",
    isUpcoming: true
  },
  {
    id: "evt-3",
    title: "World Health Day Community Screening Camp",
    category: "Community Outreach",
    date: "05 December 2026",
    time: "08:30 AM - 02:00 PM",
    venue: "Primary Health Centre, Poondi",
    description: "Voluntary community health camp by GMC medical interns and faculty providing free NCD screening, anemia checkups, and hygiene awareness.",
    registrationUrl: "#",
    isUpcoming: true
  },
  {
    id: "evt-4",
    title: "Fresher's Welcome & White Coat Ceremony 2026",
    category: "Institutional Ceremony",
    date: "15 September 2026",
    time: "10:00 AM",
    venue: "Main Auditorium",
    description: "Induction and ceremonial White Coat distribution for incoming MBBS Batch of 2026 with Hippocratic Oath recitation.",
    registrationUrl: "",
    isUpcoming: false
  }
];

export const INITIAL_POLLS = [
  {
    id: "poll-1",
    question: "Which event would you prefer for the upcoming Council Week?",
    options: [
      { text: "Cultural Fest & Music Night", votes: 142 },
      { text: "Technical / Clinical Symposium", votes: 98 },
      { text: "Inter-Batch Sports Tournament", votes: 116 }
    ],
    totalVotes: 356,
    closingDate: "2026-11-10",
    status: "active",
    userVoted: null
  },
  {
    id: "poll-2",
    question: "Preferred timing for evening Central Library air-conditioning:",
    options: [
      { text: "04:00 PM - 09:00 PM", votes: 85 },
      { text: "06:00 PM - 11:30 PM", votes: 215 },
      { text: "Full night during study holidays", votes: 164 }
    ],
    totalVotes: 464,
    closingDate: "2026-11-05",
    status: "active",
    userVoted: null
  },
  {
    id: "poll-3",
    question: "Canteen Menu Revision: Choice of Wednesday Special Lunch",
    options: [
      { text: "South Indian Special Meals", votes: 180 },
      { text: "Vegetable / Egg Fried Rice with Paneer", votes: 140 },
      { text: "Variety Rice (Lemon, Curd, Tomato)", votes: 65 }
    ],
    totalVotes: 385,
    closingDate: "2026-10-15",
    status: "closed",
    userVoted: null
  }
];

export const INITIAL_FEEDBACK = [
  {
    id: "fb-101",
    trackingId: "GMC-FB-9402",
    category: "Academics",
    content: "The microphone in Lecture Hall 3 is producing high-pitch feedback distortion, making it difficult to hear the Pharmacology lectures from the back rows.",
    containsPII: false,
    status: "Received",
    createdAt: "2026-10-29T14:20:00Z",
    aiAnalysis: {
      category: "Academics",
      sentiment: "Negative",
      urgency: "Medium",
      summary: "Microphone malfunction in Lecture Hall 3 affecting lecture audibility."
    }
  },
  {
    id: "fb-102",
    trackingId: "GMC-FB-9388",
    category: "Transport",
    content: "Requesting the council to coordinate with the college bus transport committee for an additional evening return bus at 6:30 PM for students attending late clinical duties.",
    containsPII: false,
    status: "Reviewing",
    createdAt: "2026-10-28T09:15:00Z",
    aiAnalysis: {
      category: "Transport",
      sentiment: "Neutral",
      urgency: "Medium",
      summary: "Request for extended evening bus schedule at 6:30 PM for clinical batches."
    }
  },
  {
    id: "fb-103",
    trackingId: "GMC-FB-9250",
    category: "Canteen & Mess",
    content: "The water cooler in the second-floor canteen has been repaired today. Thank you for the quick council follow-up!",
    containsPII: false,
    status: "Resolved",
    createdAt: "2026-10-27T12:00:00Z",
    aiAnalysis: {
      category: "Canteen & Mess",
      sentiment: "Positive",
      urgency: "Low",
      summary: "Acknowledgment of resolved canteen water cooler issue."
    }
  },
  {
    id: "fb-104",
    trackingId: "GMC-FB-9112",
    category: "Hostel & Facilities",
    content: "Regarding the noise complaint submitted yesterday about room 214 - my name is Dr. Ramesh and student roll 42. (This feedback declared identifying information).",
    containsPII: true,
    status: "Reviewing",
    createdAt: "2026-10-26T18:45:00Z",
    aiAnalysis: null // Bypassed because containsPII is true!
  }
];

export const INITIAL_CHATS = [
  {
    id: "chat-1",
    sessionId: "GMC-X7K92",
    status: "active",
    createdAt: "2026-10-30T10:00:00Z",
    lastActivity: "2026-10-30T18:15:00Z",
    messages: [
      { id: "m-1", sender: "council", text: "Hello! Welcome to GMC Student Council temporary chat. How can we help you today?", timestamp: "10:00 AM" },
      { id: "m-2", sender: "student", text: "Hi, I wanted to inquire if the sports room equipment issue has been resolved for evening practice?", timestamp: "10:02 AM" },
      { id: "m-3", sender: "council", text: "Yes! The sports secretary received the new badminton and volleyball gear yesterday. You can collect the key from the council office.", timestamp: "10:05 AM" }
    ]
  },
  {
    id: "chat-2",
    sessionId: "GMC-B4T81",
    status: "active",
    createdAt: "2026-10-30T16:20:00Z",
    lastActivity: "2026-10-30T17:40:00Z",
    messages: [
      { id: "m-201", sender: "council", text: "Hello! Welcome to GMC Student Council temporary chat. How can we help you?", timestamp: "04:20 PM" },
      { id: "m-202", sender: "student", text: "Is there any update on the anatomy histology slide replacements?", timestamp: "04:25 PM" }
    ]
  }
];

export const COUNCIL_ADMINS = [
  {
    id: "admin-1",
    name: "Dr. K. Vignesh (President)",
    email: "president.council@gmcthiruvallur.ac.in",
    role: "President",
    status: "Active"
  },
  {
    id: "admin-2",
    name: "S. Priya (General Secretary)",
    email: "gensec.council@gmcthiruvallur.ac.in",
    role: "General Secretary",
    status: "Active"
  },
  {
    id: "admin-3",
    name: "M. Aravind (Academic & Grievance Sec.)",
    email: "academic.council@gmcthiruvallur.ac.in",
    role: "Academic Secretary",
    status: "Active"
  }
];
