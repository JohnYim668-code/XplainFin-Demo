// Curriculum modules and lessons for the demo.
// You can expand this list with your own content anytime.
export const modules = [
  {
    id: "module-1",
    title: "Investing Basics",
    level: "Beginner",
    lessons: [
      {
        id: "lesson-1",
        title: "Why People Invest",
        description: "Understand goals like growth, income, and beating inflation."
      },
      {
        id: "lesson-2",
        title: "Risk vs Return",
        description: "Learn why higher potential returns usually come with higher risk."
      }
    ]
  },
  {
    id: "module-2",
    title: "Core Assets",
    level: "Intermediate",
    lessons: [
      {
        id: "lesson-3",
        title: "Stocks and ETFs",
        description: "Compare individual stocks and diversified exchange-traded funds."
      },
      {
        id: "lesson-4",
        title: "Bonds and Interest Rates",
        description: "See how bonds work and why interest rates affect their prices."
      }
    ]
  },
  {
    id: "module-3",
    title: "Advanced Strategy",
    level: "Advanced",
    lessons: [
      {
        id: "lesson-5",
        title: "Portfolio Allocation",
        description: "Build a balanced portfolio based on goals and time horizon."
      },
      {
        id: "lesson-6",
        title: "Behavioral Biases",
        description: "Spot common mistakes like FOMO, panic selling, and overconfidence."
      }
    ]
  }
];

// Quiz questions mapped to lesson IDs.
export const quizByLesson = {
  "lesson-1": [
    {
      id: "q-1",
      question: "What does inflation do to cash over time?",
      options: [
        "It increases purchasing power",
        "It decreases purchasing power",
        "It has no impact"
      ],
      correctAnswer: "It decreases purchasing power",
      explanation: "Inflation generally makes goods cost more over time."
    },
    {
      id: "q-2",
      question: "Which is a common reason to invest?",
      options: [
        "To guarantee no losses",
        "To grow money for future goals",
        "To avoid all market risk"
      ],
      correctAnswer: "To grow money for future goals",
      explanation: "Investing is often used to build wealth for long-term goals."
    }
  ],
  "lesson-2": [
    {
      id: "q-3",
      question: "Higher expected return usually means...",
      options: ["Lower risk", "Higher risk", "No risk"],
      correctAnswer: "Higher risk",
      explanation: "Risk and potential return are usually linked in markets."
    }
  ],
  "lesson-3": [
    {
      id: "q-4",
      question: "An ETF is usually best described as...",
      options: [
        "A single company stock",
        "A basket of assets traded on an exchange",
        "A fixed savings account"
      ],
      correctAnswer: "A basket of assets traded on an exchange",
      explanation: "ETFs usually provide diversification in one tradable product."
    }
  ],
  "lesson-4": [
    {
      id: "q-5",
      question: "When interest rates rise, existing bond prices often...",
      options: ["Rise", "Fall", "Stay exactly the same"],
      correctAnswer: "Fall",
      explanation: "New bonds pay more, so older lower-rate bonds become less valuable."
    }
  ],
  "lesson-5": [
    {
      id: "q-6",
      question: "Portfolio allocation means...",
      options: [
        "Picking one winning stock only",
        "Spreading investments across asset types",
        "Trading every day"
      ],
      correctAnswer: "Spreading investments across asset types",
      explanation: "Allocation balances risk and return using different asset classes."
    }
  ],
  "lesson-6": [
    {
      id: "q-7",
      question: "FOMO in investing can lead to...",
      options: [
        "Calm and objective decisions",
        "Buying assets after large hype-driven moves",
        "Perfect market timing"
      ],
      correctAnswer: "Buying assets after large hype-driven moves",
      explanation: "FOMO can drive emotional decisions instead of disciplined strategy."
    }
  ]
};
