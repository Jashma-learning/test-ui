'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COGNITIVE_DOMAINS } from '../utils/cognitiveTypes';

export default function TestPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [subType, setSubType] = useState('');
  const [difficulty, setDifficulty] = useState('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4">
      <div className="bg-[#1F2233]/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Cognitive Assessment</h1>
        
        <div className="space-y-4">
          {/* Cognitive Domain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cognitive Domain
            </label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setSubType('');
              }}
              className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg"
            >
              <option value="">Select Domain</option>
              {Object.entries(COGNITIVE_DOMAINS).map(([key, value]) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-type Selection */}
          {domain && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Specific Ability
              </label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg"
              >
                <option value="">Select Ability Type</option>
                {COGNITIVE_DOMAINS[domain].types.map((type: { id: string; name: string; description: string; testTypes: string[] }) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            onClick={() => {/* Handle start test */}}
            disabled={!domain || !subType || !difficulty}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
} 