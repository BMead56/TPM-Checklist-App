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

  useEffect(() => {
    fetchPlants().then(setPlants);
    fetchLineTypes().then(setLineTypes);
  }, []);

  useEffect(() => {
    if (selectedPlant) {
      fetchDepartments(selectedPlant).then(setDepartments);
      setSelectedDepartment('');
      setSelectedLineType('');
      setSelectedLine('');
      setLines([]);
    }
  }, [selectedPlant]);

  useEffect(() => {
      if (selectedPlant && onPlantSelected) {
        onPlantSelected(selectedPlant);
      }
    }, [selectedPlant, onPlantSelected]);
    
  useEffect(() => {
    if (selectedPlant && selectedDepartment && selectedLineType) {
      fetchLines(selectedPlant, selectedDepartment, selectedLineType).then(data => {
        console.log('Fetched lines:', data);
        setLines(data);
      });
      setSelectedLine('');
    }
  }, [selectedPlant, selectedDepartment, selectedLineType]);

  useEffect(() => {
    if (selectedLine) {
      onLineSelected(selectedLine);
    }
  }, [selectedLine, onLineSelected]);

  

  const filteredLines = lines;

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800">Checklist Form</h2>

      <Dropdown
        label="Plant"
        id="plant"
        value={selectedPlant}
        onChange={(e) => setSelectedPlant(e.target.value)}
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
