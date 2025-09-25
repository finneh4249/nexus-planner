// Demo data to showcase Nexus capabilities
export const demoData = {
  sampleIncomes: [
    { label: "Average household", value: 6000 },
    { label: "Starting couple", value: 4500 },
    { label: "Established couple", value: 8500 },
    { label: "High earners", value: 12000 }
  ],
  
  sampleEssentials: [
    { 
      label: "Tight budget", 
      value: 3800,
      breakdown: "Rent: $1800, Food: $600, Utilities: $200, Transportation: $400, Insurance: $300, Phone: $150, Minimum debt payments: $350"
    },
    { 
      label: "Moderate expenses", 
      value: 4200,
      breakdown: "Rent: $2000, Food: $700, Utilities: $250, Transportation: $450, Insurance: $350, Phone: $200, Minimum debt payments: $250"
    },
    { 
      label: "Comfortable living", 
      value: 5500,
      breakdown: "Mortgage: $2500, Food: $800, Utilities: $300, Transportation: $600, Insurance: $400, Phone: $250, Minimum debt payments: $650"
    }
  ],

  motivationalQuotes: [
    "Every dollar we manage together is a step toward our dreams.",
    "Small actions today create the freedom we want tomorrow.",
    "We're not just budgeting - we're building our future together.",
    "Financial teamwork makes the dream work.",
    "Together, we turn our money into opportunities.",
    "Our budget isn't a restriction - it's our roadmap to freedom."
  ],

  weeklySpendingIdeas: [
    { category: "Date Night", amount: 75, description: "Dinner out or fun activity together" },
    { category: "Hobbies", amount: 50, description: "Individual interests and creative pursuits" },
    { category: "Social", amount: 60, description: "Hanging out with friends and family" },
    { category: "Treats", amount: 40, description: "Coffee, snacks, small indulgences" },
    { category: "Entertainment", amount: 45, description: "Movies, games, subscriptions" },
    { category: "Spontaneous", amount: 35, description: "Unexpected opportunities and impulses" }
  ],

  challenges: [
    {
      title: "Coffee Shop Challenge",
      description: "Make coffee at home for 5 days",
      reward: 25,
      xp: 10
    },
    {
      title: "Meal Prep Masters",
      description: "Cook dinner together 3 times this week", 
      reward: 40,
      xp: 15
    },
    {
      title: "No-Spend Day",
      description: "Go one full day without spending on non-essentials",
      reward: 0, // The reward is keeping the money
      xp: 20
    },
    {
      title: "Bulk Shopping Bonus",
      description: "Buy groceries in bulk to save on per-unit costs",
      reward: 30,
      xp: 10
    }
  ]
};

export const getRandomQuote = () => {
  return demoData.motivationalQuotes[Math.floor(Math.random() * demoData.motivationalQuotes.length)];
};

export const getRandomChallenge = () => {
  return demoData.challenges[Math.floor(Math.random() * demoData.challenges.length)];
};
