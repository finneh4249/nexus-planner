import { cn } from "@/lib/utils";

export const celebrateSuccess = () => {
  // Create confetti effect
  const confetti = Array.from({ length: 50 }, (_, i) => {
    const confettiElement = document.createElement('div');
    confettiElement.innerHTML = ['🎉', '⭐', '✨', '🌟'][i % 4];
    confettiElement.style.position = 'fixed';
    confettiElement.style.left = Math.random() * 100 + '%';
    confettiElement.style.top = '-10px';
    confettiElement.style.fontSize = '20px';
    confettiElement.style.pointerEvents = 'none';
    confettiElement.style.zIndex = '9999';
    confettiElement.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
    
    document.body.appendChild(confettiElement);
    
    setTimeout(() => {
      document.body.removeChild(confettiElement);
    }, 4000);
  });

  // Add CSS for falling animation if it doesn't exist
  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

export const pulseElement = (elementId: string, duration: number = 1000) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('animate-pulse');
    setTimeout(() => {
      element.classList.remove('animate-pulse');
    }, duration);
  }
};

export const animationClasses = {
  fadeIn: "animate-in fade-in duration-500",
  slideIn: "animate-in slide-in-from-bottom duration-500",
  scaleIn: "animate-in zoom-in duration-300",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  celebration: "animate-in zoom-in duration-300 animate-out zoom-out duration-300",
  glow: "shadow-lg shadow-accent/50 animate-pulse",
  success: "transition-all duration-300 hover:scale-105",
};

export const feedbackMessages = {
  budgetCreated: [
    "Amazing! We've taken the first step together! 🌱",
    "Great teamwork! Our budget is ready to work for us! ⭐",
    "Fantastic! We're building our financial future together! 🎯"
  ],
  spendingTracked: [
    "Nice work tracking that! Every entry matters! ✨",
    "Great job staying on top of our spending! 📊",
    "Excellent! We're building a complete picture together! 👏"
  ],
  goalAchieved: [
    "We did it! Another milestone reached together! 🎉",
    "Incredible teamwork! We're unstoppable! 🚀",
    "Way to go! Our dedication is paying off! 🏆"
  ],
  encouragement: [
    "We're making progress every day! Keep going! 💪",
    "Small steps lead to big victories! We've got this! 🌟",
    "Every action we take builds our success! Amazing! ⭐"
  ]
};

export const getRandomMessage = (category: keyof typeof feedbackMessages): string => {
  const messages = feedbackMessages[category];
  return messages[Math.floor(Math.random() * messages.length)];
};
