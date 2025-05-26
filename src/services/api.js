// src/services/api.js

// Simulates network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data ---

const plants = [
  { id: 'HL110', name: 'HL110' },
  { id: 'HL112', name: 'HL112' },
  { id: 'RV150', name: 'RV150' },
];

const departments = [
  { id: 'WTC', plantId: 'HL110', name: 'WTC' },
  { id: 'Blackjacket', plantId: 'HL112', name: 'Blackjacket' },
  { id: 'Premise', plantId: 'HL112', name: 'Premise' },
  { id: 'OPGW', plantId: 'RV150', name: 'OPGW' }, // fixed 'plantID' typo
];

const lineTypes = [
  { id: 'Buffering', name: 'Buffering' },
  { id: 'Aramid', name: 'Aramid' },
  { id: 'Rewinding', name: 'Rewinding' },
  { id: 'Pipe', name: 'Pipe' },
  { id: 'Sheathing', name: 'Sheathing' },
];

const lines = [
  { id: 'BL01', departmentId: 'Premise', name: 'BL01', lineTypeId: 'Buffering' },
  { id: 'AL01', departmentId: 'OPGW', name: 'AL01', lineTypeId: 'Aramid' },
  { id: 'PL01', departmentId: 'OPGW', name: 'PL01', lineTypeId: 'Pipe' },
  { id: 'SL01', departmentId: 'OPGW', name: 'SL01', lineTypeId: 'Sheathing' },
  { id: 'RL01', departmentId: 'OPGW', name: 'RL01', lineTypeId: 'Rewinding' },
  { id: 'BL02', departmentId: 'Blackjacket', name: 'BL02', lineTypeId: 'Buffering' },
  { id: 'AL02', departmentId: 'Blackjacket', name: 'AL02', lineTypeId: 'Aramid' },
  { id: 'PL02', departmentId: 'Blackjacket', name: 'PL02', lineTypeId: 'Pipe' },
  { id: 'SL02', departmentId: 'Blackjacket', name: 'SL02', lineTypeId: 'Sheathing' },
  { id: 'RL02', departmentId: 'Blackjacket', name: 'RL02', lineTypeId: 'Rewinding' },
  { id: 'BL03', departmentId: 'WTC', name: 'BL03', lineTypeId: 'Buffering' },
  { id: 'AL03', departmentId: 'WTC', name: 'AL03', lineTypeId: 'Aramid' },
  { id: 'PL03', departmentId: 'WTC', name: 'PL03', lineTypeId: 'Pipe' },
  { id: 'SL03', departmentId: 'WTC', name: 'SL03', lineTypeId: 'Sheathing' },
  { id: 'RL03', departmentId: 'WTC', name: 'RL03', lineTypeId: 'Rewinding' },
];

const questions = [
  { id: 1, lineId: 'BL01', text: 'Is equipment clean?' },
  { id: 2, lineId: 'BL01', text: 'Is PPE being worn?' },
  { id: 3, lineId: 'PL01', text: 'Is the line clear?' }, // updated 'line2' to 'PL01' for a valid match
];

// --- Fake API Functions ---

export async function fetchPlants() {
  await delay();
  return plants;
}

export async function fetchDepartments(plantId) {
  await delay();
  return departments.filter(dept => dept.plantId === plantId);
}

export async function fetchLineTypes() {
  await delay();
  return lineTypes;
}

export async function fetchLines(departmentId) {
  await delay();
  return lines.filter(line => line.departmentId === departmentId);
}

export async function fetchQuestions(lineId) {
  await delay(300);
  return questions.filter(q => q.lineId === lineId);
}
