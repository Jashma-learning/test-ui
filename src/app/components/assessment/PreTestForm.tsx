'use client';

import { useState } from 'react';
import { DifficultySettings } from '@/app/types/difficulty';

interface UserProfile {
  age: number;
  education: string;
  language: string;
  previousExperience: boolean;
  computerUsage: 'low' | 'medium' | 'high';
  medicalConditions: string[];
  preferredHand: 'left' | 'right';
  visionAids: boolean;
  sleepQuality: number;
}

export function PreTestForm({ onComplete }: { onComplete: (settings: DifficultySettings) => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    age: 0,
    education: '',
    language: '',
    previousExperience: false,
    computerUsage: 'medium',
    medicalConditions: [],
    preferredHand: 'right',
    visionAids: false,
    sleepQuality: 3
  });

  const calculateDifficulty = (profile: UserProfile): DifficultySettings => {
    // Base difficulty adjusted by age
    let baseDifficulty = profile.age < 12 ? 1 : 
                        profile.age < 18 ? 2 : 
                        profile.age < 60 ? 3 : 2;

    // Adjust for computer experience
    const experienceModifier = {
      low: -0.5,
      medium: 0,
      high: 0.5
    }[profile.computerUsage];

    // Adjust for medical conditions
    const medicalModifier = profile.medicalConditions.length * -0.2;

    return {
      memoryTestDifficulty: Math.max(1, Math.min(5, baseDifficulty + experienceModifier)),
      attentionTestDifficulty: Math.max(1, Math.min(5, baseDifficulty + experienceModifier)),
      processingTestDifficulty: Math.max(1, Math.min(5, baseDifficulty + experienceModifier + medicalModifier)),
      executiveTestDifficulty: Math.max(1, Math.min(5, baseDifficulty + experienceModifier)),
      timeAllowed: profile.age < 12 ? 450 : 300, // seconds
      breakInterval: profile.age < 12 ? 600 : 900 // seconds
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = calculateDifficulty(profile);
    onComplete(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Pre-Test Assessment</h2>
        
        {/* Age Input */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Age</label>
          <input
            type="number"
            value={profile.age}
            onChange={e => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        {/* Education Level */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Education Level</label>
          <select 
            value={profile.education}
            onChange={e => setProfile(prev => ({ ...prev, education: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
          >
            <option value="">Select Level</option>
            <option value="primary">Primary School</option>
            <option value="secondary">Secondary School</option>
            <option value="higher">Higher Education</option>
          </select>
        </div>

        {/* Computer Usage */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Computer Experience</label>
          <select
            value={profile.computerUsage}
            onChange={e => setProfile(prev => ({ 
              ...prev, 
              computerUsage: e.target.value as UserProfile['computerUsage'] 
            }))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          >
            <option value="low">Less than 1 hour per day</option>
            <option value="medium">1-3 hours per day</option>
            <option value="high">More than 3 hours per day</option>
          </select>
        </div>

        {/* Medical Conditions */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Medical Conditions (if any)</label>
          <div className="space-y-2">
            {['ADHD', 'Dyslexia', 'Visual Impairment', 'Other'].map(condition => (
              <label key={condition} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.medicalConditions.includes(condition)}
                  onChange={e => {
                    setProfile(prev => ({
                      ...prev,
                      medicalConditions: e.target.checked
                        ? [...prev.medicalConditions, condition]
                        : prev.medicalConditions.filter(c => c !== condition)
                    }));
                  }}
                  className="mr-2"
                />
                <span className="text-gray-300">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Assessment
        </button>
      </div>
    </form>
  );
} 