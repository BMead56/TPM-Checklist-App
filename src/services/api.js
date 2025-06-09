// src/services/api.js

export async function fetchPlants() {
  const res = await fetch(`/getPlants`);
  if (!res.ok) throw new Error('Failed to fetch plants');
  const data = await res.json();
  return data.map(p => ({
    value: p.id,   // or p.Plant if your backend uses that name
    label: p.name  // or p.PlantName
  }));
}

export async function fetchDepartments(plantId) {
  const res = await fetch(`/getDepartments?plantName=${plantId}`);
  if (!res.ok) throw new Error('Failed to fetch departments');
  const data = await res.json();
  return data.map(d => ({
    value: d.id,     // or d.Department
    label: d.name    // or d.DepartmentName
  }));
}

export async function fetchLineTypes() {
  const res = await fetch(`/getLineTypes`);
  if (!res.ok) throw new Error('Failed to fetch line types');
  const data = await res.json();
  return data.map(t => ({
    value: t.id,    // or t.TypeId
    label: t.name   // or t.TypeName
  }));
}

export async function fetchLines(plantId) {
  const res = await fetch(`/getLine?plantName=${plantId}`);
  if (!res.ok) throw new Error('Failed to fetch lines');
  const data = await res.json();
  return data.map(row => ({
    value: row.Line,          // dropdown value
    label: row.Line,          // dropdown label
    plantId: row.Plant,
    departmentId: row.departmentId,
    lineTypeId: row.lineTypeId
  }));
}

export async function fetchQuestions(lineId) {
  const res = await fetch(`/getQuestions?lineName=${lineId}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return await res.json();
}
