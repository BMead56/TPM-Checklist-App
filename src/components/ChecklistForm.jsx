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

  // Filter lines based on selected line type (and department optionally)
  const filteredLines = lines.filter((line) =>
    selectedLineType && selectedDepartment
      ? line.lineTypeId === selectedLineType && line.departmentId === selectedDepartment
      : line.lineTypeId === selectedLineType
  );

  // Initial load of plants and line types
  useEffect(() => {
    fetchPlants().then(setPlants);
    fetchLineTypes().then(setLineTypes);
  }, []);

  // When plant changes, fetch departments and lines
  useEffect(() => {
    if (selectedPlant) {
      fetchDepartments(selectedPlant).then(setDepartments);
      fetchLines(selectedPlant).then(setLines);
      setSelectedDepartment('');
      setSelectedLineType('');
      setSelectedLine('');
    }
  }, [selectedPlant]);

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
        onChange={(e) => setSelectedPlant(e.target.value)}
        options={plants}
      />

      {departments.length > 0 && (
        <Dropdown
          label="Department"
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          options={departments}
        />
      )}

      {lineTypes.length > 0 && (
        <Dropdown
          label="Line Type"
          id="lineType"
          value={selectedLineType}
          onChange={(e) => setSelectedLineType(e.target.value)}
          options={lineTypes}
        />
      )}

      {selectedLineType && filteredLines.length > 0 && (
        <Dropdown
          label="Line"
          id="line"
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          options={filteredLines.map((line) => ({
            value: line.id,
            label: line.name,
          }))}
        />
      )}
    </div>
  );
}

export default ChecklistForm;
