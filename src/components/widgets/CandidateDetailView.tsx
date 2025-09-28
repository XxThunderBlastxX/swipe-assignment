'use client';

import React from 'react';
import { ArrowLeft, Calendar, Clock, Award, User, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useInterviewStore } from '~/lib/store';
import type { InterviewSession } from '~/types/interview';

interface CandidateDetailViewProps {
  sessionId: string;
  onBack: () => void;
}

export default function CandidateDetailView({ sessionId, onBack }: CandidateDetailViewProps) {
  const { sessions } = useInterviewStore();
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Session not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateTotalTime = () => {
    return session.answers.reduce((total, answer) => total + answer.timeSpent, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.candidateInfo.name}</h1>
            <p className="text-muted-foreground">Interview Details</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(session.status)}`}>
          {session.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{session.candidateInfo.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{session.candidateInfo.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{session.candidateInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Started At</p>
                  <p className="font-medium">{formatDate(session.startedAt)}</p>
                </div>
              </div>

              {session.completedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed At</p>
                    <p className="font-medium">{formatDate(session.completedAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-medium">{formatDuration(calculateTotalTime())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          {session.status === 'completed' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(session.score || 0)}`}>
                    {session.score}/180
                  </div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{session.answers.length}</div>
                    <p className="text-xs text-muted-foreground">Questions Answered</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">
                      {session.answers.filter(a => a.isTimedOut).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Time Outs</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">AI Summary:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {session.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Questions and Answers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Questions & Answers ({session.answers.length}/{session.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.answers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No answers submitted yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {session.answers.map((answer, index) => {
                    const question = session.questions.find(q => q.id === answer.questionId);
                    if (!question) return null;

                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">Question {index + 1}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {question.timeLimit}s limit
                              </span>
                            </div>
                            <p className="text-sm mb-4">{question.text}</p>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Answer:</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(answer.timeSpent)}</span>
                              {answer.isTimedOut && (
                                <span className="text-red-500 font-medium">(Timed Out)</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {answer.text}
                          </p>
                        </div>

                        {/* Simple scoring display */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Submitted: {new Date(answer.timestamp).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            {answer.isTimedOut ? (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Incomplete
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Remaining Questions */}
              {session.status === 'in-progress' && session.currentQuestionIndex < session.questions.length && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-medium mb-4 text-muted-foreground">
                    Remaining Questions ({session.questions.length - session.currentQuestionIndex})
                  </h4>
                  <div className="space-y-3">
                    {session.questions.slice(session.currentQuestionIndex).map((question, index) => (
                      <div key={question.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-md">
                        <span className="text-sm font-medium">
                          Q{session.currentQuestionIndex + index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {question.timeLimit}s
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-auto">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
