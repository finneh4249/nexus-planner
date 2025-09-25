"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type QuestionType = 'individual' | 'team';
type PartnerAnswer = 'A' | 'B' | 'C' | 'D';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  prompt: string;
  options: {
    key: PartnerAnswer;
    text: string;
  }[];
  insightText?: {
    aligned: string;
    different: string;
  };
}

interface QuizState {
  currentQuestion: number;
  currentPartner: 'A' | 'B' | 'both';
  answers: {
    [questionId: string]: {
      partnerA?: PartnerAnswer;
      partnerB?: PartnerAnswer;
      team?: PartnerAnswer;
    };
  };
  showReveal: boolean;
  isComplete: boolean;
}

const questions: Question[] = [
  {
    id: 'windfall',
    type: 'individual',
    title: 'The Windfall',
    prompt: 'A $5,000 bonus unexpectedly lands in your account. Your *first* personal instinct is to:',
    options: [
      { key: 'A', text: 'Pay off a big chunk of debt.' },
      { key: 'B', text: 'Put it towards our emergency fund.' },
      { key: 'C', text: 'Invest it for the long term.' },
      { key: 'D', text: 'Book that holiday we\'ve been talking about.' }
    ],
    insightText: {
      aligned: 'Great! You\'re both aligned on your instincts. This shows you have similar financial values.',
      different: 'This is a great starting point for a conversation. One of you is focused on security, the other on growth. Nexus will help you balance both.'
    }
  },
  {
    id: 'unexpected-bill',
    type: 'team',
    title: 'The Unexpected Bill',
    prompt: 'An unexpected $800 bill arrives, due this week. As a team, our most likely reaction is:',
    options: [
      { key: 'A', text: '"No problem, we\'ll pull it from our savings."' },
      { key: 'B', text: '"Okay, we\'ll need to cut back on spending this week to cover it."' },
      { key: 'C', text: '"We\'ll have to put it on the credit card for now."' },
      { key: 'D', text: '"This is stressful. We need to have a serious talk about our budget."' }
    ]
  },
  {
    id: 'primary-mission',
    type: 'individual',
    title: 'The Primary Mission',
    prompt: 'Right now, what do *you* believe is your household\'s #1 most important financial goal?',
    options: [
      { key: 'A', text: 'Getting out of debt.' },
      { key: 'B', text: 'Building an emergency fund.' },
      { key: 'C', text: 'Saving for a home.' },
      { key: 'D', text: 'Investing for the future.' }
    ],
    insightText: {
      aligned: 'Perfect, you\'re rowing in the same direction! Having aligned priorities is a huge advantage.',
      different: 'It looks like you have different priorities right now. Nexus will help you build a plan that can achieve both.'
    }
  },
  {
    id: 'motivation',
    type: 'team',
    title: 'The Motivation',
    prompt: 'When we think about building wealth, our biggest driver is:',
    options: [
      { key: 'A', text: '**Freedom:** The ability to choose our path in life.' },
      { key: 'B', text: '**Security:** Knowing we\'re protected from whatever happens.' },
      { key: 'C', text: '**Legacy:** Building something for our family\'s future.' },
      { key: 'D', text: '**Experiences:** Funding a life full of joy and travel.' }
    ]
  },
  {
    id: 'current-style',
    type: 'team',
    title: 'The Current Style',
    prompt: 'Honestly, our current financial decision-making style is best described as:',
    options: [
      { key: 'A', text: '**The CEO:** One of us takes the lead and manages the finances.' },
      { key: 'B', text: '**The Committee:** We try to discuss every major decision together.' },
      { key: 'C', text: '**The Improvisers:** We tend to make decisions as they come up.' }
    ]
  }
];

interface NexusCompassProps {
  onComplete?: (profile: any) => void;
  className?: string;
}

export default function NexusCompass({ onComplete, className }: NexusCompassProps) {
  const [quizState, setQuizState] = React.useState<QuizState>({
    currentQuestion: -1, // Start with welcome screen
    currentPartner: 'A',
    answers: {},
    showReveal: false,
    isComplete: false
  });

  const currentQuestion = quizState.currentQuestion >= 0 ? questions[quizState.currentQuestion] : null;
  const progress = quizState.currentQuestion >= 0 ? ((quizState.currentQuestion + 1) / questions.length) * 100 : 0;

  const handleStart = () => {
    setQuizState(prev => ({ ...prev, currentQuestion: 0 }));
  };

  const handleAnswer = (answer: PartnerAnswer) => {
    const question = questions[quizState.currentQuestion];
    
    if (question.type === 'individual') {
      const questionAnswers = quizState.answers[question.id] || {};
      
      if (quizState.currentPartner === 'A') {
        const newAnswers = {
          ...quizState.answers,
          [question.id]: { ...questionAnswers, partnerA: answer }
        };
        
        setQuizState(prev => ({
          ...prev,
          answers: newAnswers,
          currentPartner: 'B'
        }));
      } else {
        const newAnswers = {
          ...quizState.answers,
          [question.id]: { ...questionAnswers, partnerB: answer }
        };
        
        setQuizState(prev => ({
          ...prev,
          answers: newAnswers,
          showReveal: true
        }));
      }
    } else {
      // Team question
      const newAnswers = {
        ...quizState.answers,
        [question.id]: { team: answer }
      };
      
      setQuizState(prev => ({
        ...prev,
        answers: newAnswers
      }));
      
      // Move to next question after a brief pause
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestion >= questions.length - 1) {
      // Quiz complete
      const profile = generateProfile();
      setQuizState(prev => ({ ...prev, isComplete: true }));
      onComplete?.(profile);
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        currentPartner: 'A',
        showReveal: false
      }));
    }
  };

  const generateProfile = () => {
    // Simple profile generation based on answers
    const answers = quizState.answers;
    
    // Determine alignment level
    const individualQuestions = questions.filter(q => q.type === 'individual');
    const alignedCount = individualQuestions.filter(q => {
      const questionAnswers = answers[q.id];
      return questionAnswers?.partnerA === questionAnswers?.partnerB;
    }).length;
    
    const alignment = alignedCount / individualQuestions.length;
    
    // Determine coaching style based on answers
    let coachingStyle = 'BALANCED';
    if (answers['unexpected-bill']?.team === 'A') coachingStyle = 'ANALYTICAL';
    if (answers['current-style']?.team === 'B') coachingStyle = 'COLLABORATIVE';
    if (answers['motivation']?.team === 'A') coachingStyle = 'STRATEGIC';
    
    // Generate profile name
    const profileNames = [
      'The Aligned Architects',
      'Collaborative Pragmatists',
      'Strategic Builders',
      'Balanced Navigators',
      'Adaptive Partners'
    ];
    
    const profileName = profileNames[Math.floor(alignment * (profileNames.length - 1))];
    
    return {
      name: profileName,
      alignment: alignment,
      coachingStyle: coachingStyle,
      answers: answers
    };
  };

  const getPartnerName = (partner: 'A' | 'B') => partner === 'A' ? 'Partner 1' : 'Partner 2';

  const getInsightText = (question: Question) => {
    const questionAnswers = quizState.answers[question.id];
    if (!questionAnswers || !question.insightText) return '';
    
    const isAligned = questionAnswers.partnerA === questionAnswers.partnerB;
    return isAligned ? question.insightText.aligned : question.insightText.different;
  };

  // Welcome Screen
  if (quizState.currentQuestion === -1) {
    return (
      <Card className={cn("w-full max-w-3xl mx-auto shadow-2xl border-primary/30 bg-card/95 backdrop-blur", className)}>
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-20 h-20 mx-auto bg-accent rounded-full flex items-center justify-center text-accent-foreground text-3xl shadow-lg">
            🧭
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-foreground font-heading">
            LET'S FIND YOUR FINANCIAL NORTH
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome to Nexus. This is a quick, 5-question compass to understand how you work as a team.
            </p>
            <p className="text-lg text-muted-foreground">
              Answer together to calibrate a plan that's unique to you. <br />
              <strong>There are no right or wrong answers.</strong>
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icons.Growth className="w-4 h-4" />
                <span>5 questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icons.Stability className="w-4 h-4" />
                <span>3-5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icons.Rewards className="w-4 h-4" />
                <span>Better together</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStart}
              size="lg"
              className="text-lg px-8 py-6 animate-glow"
            >
              Let's Begin 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results Screen
  if (quizState.isComplete) {
    const profile = generateProfile();
    
    return (
      <Card className={cn("w-full max-w-4xl mx-auto shadow-2xl border-primary/30 bg-card/95 backdrop-blur", className)}>
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="text-6xl animate-bounce">🎉</div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground font-heading">
            YOUR COMPASS IS CALIBRATED!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Your Financial Dynamic
            </Badge>
            <h2 className="text-4xl font-bold text-accent drop-shadow-sm font-heading uppercase">{profile.name}</h2>
          </div>
          
          <Card className="bg-secondary/30">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold font-heading">YOUR PROFILE</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                You are a team that values collaboration and thoughtful decision-making. 
                You work best when you have clear information and can plan together. 
                Your main goal is to build a system that makes financial progress automatic and stress-free.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2 font-heading">YOUR NEXUS COACH IS SET TO:</h3>
                <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
                  {profile.coachingStyle}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Your coach will focus on providing clear guidance and collaborative recommendations 
                  that empower you to make the best decisions together.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2 font-heading">ALIGNMENT SCORE</h3>
                <div className="text-3xl font-bold text-accent mb-2 font-mono">
                  {Math.round(profile.alignment * 100)}%
                </div>
                <Progress value={profile.alignment * 100} className="mb-4" />
                <p className="text-sm text-muted-foreground">
                  You're {profile.alignment > 0.7 ? 'highly aligned' : profile.alignment > 0.4 ? 'moderately aligned' : 'uniquely complementary'} 
                  in your financial approach.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => onComplete?.(profile)}
              size="lg"
              className="text-lg px-8 py-6"
            >
              Let's Build Your Plan 🏗️
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question Screen
  if (!currentQuestion) return null;

  return (
    <Card className={cn("w-full max-w-3xl mx-auto shadow-2xl border-primary/30 bg-card/95 backdrop-blur", className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="font-mono">
            Question {quizState.currentQuestion + 1} of {questions.length}
          </Badge>
          <Progress value={progress} className="w-32 h-2" />
        </div>
        <CardTitle className="text-2xl font-bold text-center font-heading">
          {currentQuestion.title.toUpperCase()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {currentQuestion.type === 'individual' && !quizState.showReveal && (
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              {getPartnerName(quizState.currentPartner)}'s Turn
            </Badge>
          </div>
        )}
        
        {!quizState.showReveal ? (
          <div className="space-y-6">
            <p className="text-xl text-center leading-relaxed">
              {currentQuestion.prompt}
            </p>
            
            <div className="grid gap-4">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.key}
                  variant="outline"
                  size="lg"
                  onClick={() => handleAnswer(option.key)}
                  className="text-left p-6 h-auto hover:bg-primary/5 transition-smooth"
                >
                  <div className="flex items-start space-x-4">
                    <Badge variant="secondary" className="mt-1 flex-shrink-0 font-mono">
                      {option.key}
                    </Badge>
                    <span className="text-base leading-relaxed">
                      {option.text}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Reveal Screen for Individual Questions
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-semibold text-center mb-6 font-heading">
              {currentQuestion.id === 'windfall' ? "LET'S SEE WHERE YOU BOTH STAND." : "ARE YOU ROWING IN THE SAME DIRECTION?"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-chart-2/10">
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium mb-2 font-heading text-sm">{getPartnerName('A').toUpperCase()}</h4>
                  <Badge variant="outline" className="mb-2 font-mono">
                    {quizState.answers[currentQuestion.id]?.partnerA}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.options.find(opt => opt.key === quizState.answers[currentQuestion.id]?.partnerA)?.text}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-accent/10">
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium mb-2 font-heading text-sm">{getPartnerName('B').toUpperCase()}</h4>
                  <Badge variant="outline" className="mb-2 font-mono">
                    {quizState.answers[currentQuestion.id]?.partnerB}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.options.find(opt => opt.key === quizState.answers[currentQuestion.id]?.partnerB)?.text}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-secondary/20">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium text-secondary-foreground">
                  {getInsightText(currentQuestion)}
                </p>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button onClick={handleNext} size="lg" className="px-8">
                Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
