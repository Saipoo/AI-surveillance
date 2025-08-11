export interface Student {
  id: string;
  name: string;
  usn: string;
  semester: string;
  faceImage: string;
}

export type EmergencyType = 'Fall Detected' | 'SOS Hand Sign' | 'Chest Pain';

export type EmergencyLog = {
  Date: string;
  Time: string;
  'Type of Emergency': EmergencyType;
  'Suggested Treatment': string;
};

export type MaskStatus = 'Worn' | 'Not Worn' | 'Unknown';

export const handSigns = [
    'Help', 
    'SOS', 
    'Distress',
    'OK',
    'Thumbs Up',
    'Stop',
    'Point',
    'Silence',
    'Come Here',
    'Go Away',
    'I am Hurt',
    'Need Water'
] as const;

export type HandSign = typeof handSigns[number];

export const handSignDetails: Record<HandSign, { description: string, image?: string, hint?: string }> = {
    'Help': { description: "Thumb tucked under four fingers.", image: "https://placehold.co/150x150.png", hint: "help sign" },
    'SOS': { description: "Three fingers (S), fist (O), three fingers (S).", image: "https://placehold.co/150x150.png", hint: "SOS sign" },
    'Distress': { description: "Waving both arms over your head.", image: "https://placehold.co/150x150.png", hint: "person waving" },
    'OK': { description: "Thumb and index finger form a circle.", image: "https://placehold.co/150x150.png", hint: "OK sign" },
    'Thumbs Up': { description: "Standard thumbs-up gesture.", image: "https://placehold.co/150x150.png", hint: "thumbs up" },
    'Stop': { description: "Palm facing forward, fingers up.", image: "https://placehold.co/150x150.png", hint: "stop sign" },
    'Point': { description: "Index finger pointing at something.", image: "https://placehold.co/150x150.png", hint: "pointing finger" },
    'Silence': { description: "Index finger held to the lips.", image: "https://placehold.co/150x150.png", hint: "silence gesture" },
    'Come Here': { description: "Index finger curling towards you.", image: "https://placehold.co/150x150.png", hint: "beckoning hand" },
    'Go Away': { description: "Hand waving away from the body.", image: "https://placehold.co/150x150.png", hint: "waving goodbye" },
    'I am Hurt': { description: "Hand clutched to chest or stomach.", image: "https://placehold.co/150x150.png", hint: "person clutching chest" },
    'Need Water': { description: "Hand to mouth in a 'C' shape.", image: "https://placehold.co/150x150.png", hint: "drinking gesture" },
};
