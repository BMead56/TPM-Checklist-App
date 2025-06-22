import React, { useEffect, useState } from 'react';
import Dropdown from './Dropdown';
import {
  fetchPlants,
  fetchDepartments,
  fetchLines,
  fetchLineTypes
} from '../services/api';

function ChecklistForm({ onLineSelected, onPlantSelected }) {
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineTypes, setLineTypes] = useState([]);

  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLineType, setSelectedLineType] = useState('');
  const [selectedLine, setSelectedLine] = useState('');

  // Load plants and line types initially
  useEffect(() => {
    fetchPlants().then(setPlants);
    fetchLineTypes().then(setLineTypes);
  }, []);

  // When plant changes, fetch departments and reset dropdowns
  useEffect(() => {
    if (selectedPlant) {
      fetchDepartments(selectedPlant).then(setDepartments);
      setSelectedDepartment('');
      setSelectedLineType('');
      setSelectedLine('');
      setLines([]);
    }
  }, [selectedPlant]);

  // When all filters are selected, fetch lines
  useEffect(() => {
    if (selectedPlant && selectedDepartment && selectedLineType) {
      fetchLines(selectedPlant, selectedDepartment, selectedLineType).then(data => {
        console.log('Fetched lines:', data);
        setLines(data);
      });
      setSelectedLine('');
    }
  }, [selectedPlant, selectedDepartment, selectedLineType]);

  // Notify parent when a line is selected
  useEffect(() => {
    if (selectedLine) {
      onLineSelected(selectedLine);
    }
  }, [selectedLine, onLineSelected]);

  const filteredLines = lines;

  return (
    <div>
      <h2>Checklist Form</h2>

      <Dropdown
        label="Plant"
        id="plant"
        value={selectedPlant}
        onChange={(e) => {
          const plant = e.target.value;
          setSelectedPlant(plant);
          if (onPlantSelected) onPlantSelected(plant);
        }}
        options={plants}
      />

      {Array.isArray(departments) && departments.length > 0 && (
        <Dropdown
          label="Department"
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          options={departments}
        />
      )}

      {Array.isArray(lineTypes) && lineTypes.length > 0 && (
        <Dropdown
          label="Line Type"
          id="lineType"
          value={selectedLineType}
          onChange={(e) => setSelectedLineType(e.target.value)}
          options={lineTypes}
        />
      )}

      {Array.isArray(filteredLines) && filteredLines.length > 0 && (
        <Dropdown
          label="Line"
          id="line"
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          options={filteredLines}
        />
      )}
    </div>
  );
}

export default ChecklistForm;
