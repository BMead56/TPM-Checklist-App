// src/services/api.js

const BASE_URL = import.meta.env.VITE_LOCAL_HOST;
//const BASE_URL = 'http://localhost:3000';
//const BASE_URL = import.meta.env.VITE_LOCAL_HOST;
// Adjust this to your backend URL

export async function fetchPlants() {
  const res = await fetch(`${BASE_URL}/api/tpm/getPlants`);
  if (!res.ok) throw new Error('Failed to fetch plants');
  const data = await res.json();
  return data.map(p => ({
    value: p.value || p.Plant || p.id, 
    label: p.label || p.PlantName || p.name || p.id
  }));
}

export async function fetchDepartments(plantId) {
  const res = await fetch(`${BASE_URL}/api/tpm/getDepartments?plantName=${plantId}`);
  if (!res.ok) throw new Error('Failed to fetch departments');
  const data = await res.json();
  return data.map(d => ({
    value: d.value || d.BU || d.id,
    label: d.label || d.BU || d.name || d.id
  }));
}

export async function fetchLineTypes() {
  const res = await fetch(`${BASE_URL}/api/tpm/getLineTypes`);
  if (!res.ok) throw new Error('Failed to fetch line types');
  const data = await res.json();
  return data.map(t => ({
    value: t.value || t.Type || t.id,
    label: t.label || t.Type || t.name || t.id
  }));
}

export async function fetchLines(plantId, department, lineType) {
  const res = await fetch(`${BASE_URL}/api/tpm/getLine?plantName=${plantId}&department=${department}&lineType=${lineType}`);
  if (!res.ok) throw new Error('Failed to fetch lines');

  const data = await res.json();

  return data;
}


export async function fetchQuestions(lineId) {
  const res = await fetch(`${BASE_URL}/api/tpm/getQuestions?lineName=${lineId}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return await res.json();
}

export async function fetchNameByBadge(badge) {
  const res = await fetch(`${BASE_URL}/api/tpm/getNameByBadge/${badge}`);
  if (!res.ok) throw new Error('Failed to fetch name');
  return await res.json();
}

export async function submitResponses(formattedResponses) {
  const res = await fetch(`${BASE_URL}/api/tpm/submitResponses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formattedResponses),
  });
  if (!res.ok) throw new Error('Failed to submit');
  return await res.json();
}
