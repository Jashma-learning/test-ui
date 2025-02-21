"use client";

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import WelcomeScreen from '@/app/components/assessment/WelcomeScreen';

interface FormData {
  name: string;
  age: number;
  classLevel: number;
  board: string;
  preferred_language: string;
  subjects: string[];
}

const SUBJECTS = [
  { text: 'Math', value: 'math' },
  { text: 'Science', value: 'science' },
  { text: 'English', value: 'english_subject' },
  { text: 'History', value: 'history' },
  { text: 'Geography', value: 'geography' },
  { text: 'Computer Science', value: 'computer_science' }
];

interface CustomSelectProps {
  data: typeof SUBJECTS;
  value: string[];
  onChange: (values: string[]) => void;
}

function CustomSelect({ data, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSelectedSubjectsText = () => {
    if (value.length === 0) return 'Select subjects';
    const selectedSubjects = data
      .filter(item => value.includes(item.value))
      .map(item => item.text);
    
    if (selectedSubjects.length > 2) {
      return `${selectedSubjects.slice(0, 2).join(', ')} +${selectedSubjects.length - 2} more`;
    }
    return selectedSubjects.join(', ');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-left flex justify-between items-center"
      >
        <span className="truncate">{getSelectedSubjectsText()}</span>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#11131D] border border-[#3B82F6]/30 rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map((item) => (
            <label
              key={item.value}
              className="flex items-center space-x-3 p-3 hover:bg-[#1F2233] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(item.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...value, item.value]
                    : value.filter(v => v !== item.value);
                  onChange(newValue);
                }}
                className="w-4 h-4 rounded border-gray-600 text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <span className="text-gray-300">{item.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreTestStudentForm() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: 5,
    classLevel: 1,
    board: 'cbse',
    preferred_language: 'english',
    subjects: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).selectedOptions;
      const values = Array.from(options, (option) => option.value);
      setFormData({ ...formData, [name]: values });
    } else {
      const finalValue = name === 'age' || name === 'classLevel' 
        ? parseInt(value, 10) 
        : value;
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('pretest_submissions')
        .insert([{
          name: formData.name,
          age: formData.age,
          class_level: formData.classLevel,
          board: formData.board,
          preferred_language: formData.preferred_language,
          subjects: formData.subjects
        }]);

      if (error) throw error;
      
      setShowWelcome(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = () => {
    try {
      router.push('/test');
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to start test. Please try again.');
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStartTest} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4 sm:p-6 md:p-8">
      <form
        className="bg-[#1F2233]/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border border-[#3B82F6]/20"
        onSubmit={handleSubmit}
      >
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-transparent bg-clip-text">
            Student Pre-Test Form
          </h1>
          <p className="text-gray-400 text-sm">Please fill in your information below</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-gray-300">Age</label>
              <select 
                id="age"
                name="age" 
                value={formData.age.toString()} 
                onChange={handleChange} 
                className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
              >
                {[...Array(14)].map((_, i) => (
                  <option key={i} value={i + 5}>{i + 5} years</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="classLevel" className="block text-sm font-medium text-gray-300">Class Level</label>
              <select 
                id="classLevel"
                name="classLevel" 
                value={formData.classLevel.toString()} 
                onChange={handleChange} 
                className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Class {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="board" className="block text-sm font-medium text-gray-300">Education Board</label>
            <select 
              id="board"
              name="board" 
              value={formData.board} 
              onChange={handleChange} 
              className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
            >
              <option value="cbse">CBSE</option>
              <option value="icse">ICSE</option>
              <option value="state">State Board</option>
              <option value="ib">IB</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-300">Preferred Language</label>
            <select 
              id="preferred_language"
              name="preferred_language" 
              value={formData.preferred_language} 
              onChange={handleChange} 
              className="w-full p-3 bg-[#11131D]/70 text-white rounded-lg border border-[#3B82F6]/30 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Subjects</label>
            <CustomSelect
              data={SUBJECTS}
              value={formData.subjects}
              onChange={(values) => setFormData(prev => ({ ...prev, subjects: values }))}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg mt-6"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Form'
          )}
        </button>
      </form>
    </div>
  );
}
