// src/services/api.js

// Simulates network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- Hard coded data ---


const departments = [
  { id: 'WTC', plantId: 'HL110', name: 'WTC' },
  { id: 'Blackjacket', plantId: 'HL112', name: 'Blackjacket' },
  { id: 'Premise', plantId: 'HL112', name: 'Premise' },
  { id: 'OPGW', plantId: 'RV150', name: 'OPGW' },
];

const lineTypes = [
  { id: 'Buffering', name: 'Buffering' },
  { id: 'Aramid', name: 'Aramid' },
  { id: 'Rewinding', name: 'Rewinding' },
  { id: 'Pipe', name: 'Pipe' },
  { id: 'Sheathing', name: 'Sheathing' },
];


// --- API Functions ---

export async function fetchPlants() {
  const res = await fetch('/getPlants');
  if (!res.ok) throw new Error('Failed to fetch plants');
  return await res.json();
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
  const res = await fetch(`/getQuestions?lineName=${lineId}`);
  if (!res.ok) { 
    throw new Error('Failed to fetch questions');
  }
  return await res.json();
}
