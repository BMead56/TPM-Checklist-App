import React, { useEffect, useState } from 'react';
import Dropdown from './Dropdown';
import {
  fetchPlants,
  fetchDepartments,
  fetchLines,
  fetchLineTypes
} from '../services/api';

function ChecklistForm({ onLineSelected }) {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineTypes, setLineTypes] = useState([]);

  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLineType, setSelectedLineType] = useState('');
  const [selectedLine, setSelectedLine] = useState('');

  const filteredLines = lines.filter(
    line =>
      line.departmentId === selectedDepartment &&
      line.lineTypeId === selectedLineType
  );

  // Load initial plant and line type options
  useEffect(() => {
    fetchPlants().then(setPlants);
    console.log('Fetching plant types...');
    fetchLineTypes().then(setLineTypes);
    console.log('Fetching line types...');
  }, []);

  // When plant changes, reset downstream selections and load departments
  useEffect(() => {
    if (selectedPlant) {
      fetchDepartments(selectedPlant).then(setDepartments);
      setSelectedDepartment('');
      setSelectedLine('');
      setLines([]);
    }
  }, [selectedPlant]);

  // When department changes, fetch related lines
  useEffect(() => {
    if (selectedDepartment) {
      fetchLines(selectedDepartment).then(setLines);
      setSelectedLine('');
    }
  }, [selectedDepartment]);

  // Notify parent when a line is selected
  useEffect(() => {
    if (selectedLine) {
      onLineSelected(selectedLine);
    }
  }, [selectedLine, onLineSelected]);

  return (
    <div>
      <h2>Checklist Form</h2>

      <Dropdown
        label="Plant"
        id="plant"
        value={selectedPlant}
        onChange={e => setSelectedPlant(e.target.value)}
        options={plants}
      />

      {departments.length > 0 && (
        <Dropdown
          label="Department"
          id="department"
          value={selectedDepartment}
          onChange={e => setSelectedDepartment(e.target.value)}
          options={departments}
        />
      )}

      {lineTypes.length > 0 && (
        <Dropdown
          label="Line Type"
          id="lineType"
          value={selectedLineType}
          onChange={e => setSelectedLineType(e.target.value)}
          options={lineTypes}
        />
      )}

      {selectedDepartment && selectedLineType && filteredLines.length > 0 && (
        <Dropdown
          label="Line"
          id="line"
          value={selectedLine}
          onChange={e => setSelectedLine(e.target.value)}
          options={filteredLines}
        />
      )}
    </div>
  );
}

export default ChecklistForm;
