export const COGNITIVE_DOMAINS = {
  // 1. Memory
  memory: {
    types: [
      {
        id: 'working_memory',
        name: 'Working Memory',
        description: 'Ability to hold and manipulate information temporarily',
        testTypes: ['sequence_recall', 'digit_span', 'pattern_memory']
      },
      {
        id: 'visual_memory',
        name: 'Visual Memory',
        description: 'Ability to remember visual patterns and images',
        testTypes: ['pattern_recognition', 'image_recall', 'spatial_memory']
      }
    ]
  },

  // 2. Attention
  attention: {
    types: [
      {
        id: 'sustained_attention',
        name: 'Sustained Attention',
        description: 'Ability to maintain focus over time',
        testTypes: ['continuous_performance', 'vigilance_task']
      },
      {
        id: 'selective_attention',
        name: 'Selective Attention',
        description: 'Ability to focus on relevant stimuli while ignoring distractions',
        testTypes: ['visual_search', 'stroop_test']
      }
    ]
  },

  // 3. Processing Speed
  processingSpeed: {
    types: [
      {
        id: 'reaction_time',
        name: 'Reaction Time',
        description: 'Speed of responding to simple stimuli',
        testTypes: ['simple_reaction', 'choice_reaction']
      },
      {
        id: 'processing_efficiency',
        name: 'Processing Efficiency',
        description: 'Speed and accuracy of cognitive operations',
        testTypes: ['symbol_search', 'coding_task']
      }
    ]
  },

  // 4. Executive Function
  executiveFunction: {
    types: [
      {
        id: 'problem_solving',
        name: 'Problem Solving',
        description: 'Ability to find solutions to complex problems',
        testTypes: ['pattern_completion', 'logical_reasoning']
      },
      {
        id: 'cognitive_flexibility',
        name: 'Cognitive Flexibility',
        description: 'Ability to switch between different concepts',
        testTypes: ['task_switching', 'set_shifting']
      }
    ]
  }
};

// Test difficulty levels
export const DIFFICULTY_LEVELS = {
  easy: {
    timeLimit: 30, // seconds
    complexity: 'basic',
    adaptiveThreshold: 0.7
  },
  medium: {
    timeLimit: 45,
    complexity: 'intermediate',
    adaptiveThreshold: 0.75
  },
  hard: {
    timeLimit: 60,
    complexity: 'advanced',
    adaptiveThreshold: 0.8
  }
};

// Scoring weights
export const SCORING_WEIGHTS = {
  accuracy: 0.6,
  speed: 0.2,
  consistency: 0.2
}; 