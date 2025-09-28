'use client';

import React from 'react';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import type { InterviewSession } from '~/types/interview';

interface WelcomeBackModalProps {
  open: boolean;
  session: InterviewSession | null;
  onContinue: () => void;
  onStartNew: () => void;
}

export default function WelcomeBackModal({
  open,
  session,
  onContinue,
  onStartNew
}: WelcomeBackModalProps) {
  if (!session) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    return Math.round((session.currentQuestionIndex / session.questions.length) * 100);
  };

  const getCurrentQuestionDifficulty = () => {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    return currentQuestion?.difficulty || 'Unknown';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Welcome Back!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              We found an unfinished interview session for <strong>{session.candidateInfo.name}</strong>.
            </p>
          </div>

          {/* Session Progress */}
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {session.currentQuestionIndex}/{session.questions.length} questions
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {getProgressPercentage()}% Complete
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">{formatDate(session.startedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Answers Submitted</p>
                <p className="font-medium">{session.answers.length}</p>
              </div>
            </div>

            {/* Current Question Info */}
            {session.status === 'in-progress' && session.currentQuestionIndex < session.questions.length && (
              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-2">Next Question:</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Question {session.currentQuestionIndex + 1}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(getCurrentQuestionDifficulty())}`}>
                    {getCurrentQuestionDifficulty()}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{session.questions[session.currentQuestionIndex]?.timeLimit}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {session.status === 'in-progress' ? (
              <Button onClick={onContinue} className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue Interview
              </Button>
            ) : (
              <Button onClick={onContinue} className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                View Results
              </Button>
            )}

            <Button
              onClick={onStartNew}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Start New Interview
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your progress is automatically saved and will be restored when you return.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
