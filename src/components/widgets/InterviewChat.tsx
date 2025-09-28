"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Send, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { useInterviewStore } from "~/lib/store";
import type { InterviewSession, Question } from "~/types/interview";

interface InterviewChatProps {
  session: InterviewSession;
}

export default function InterviewChat({ session }: InterviewChatProps) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { submitAnswer, moveToNextQuestion, updateSession } =
    useInterviewStore();

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion =
    session.currentQuestionIndex === session.questions.length - 1;
  const hasStarted = session.status === "in-progress";

  // Initialize timer when component mounts or question changes
  useEffect(() => {
    if (hasStarted && currentQuestion) {
      const savedTimeRemaining = session.timeRemaining;
      const initialTime = savedTimeRemaining ?? currentQuestion.timeLimit;

      setTimeRemaining(initialTime);
      setIsTimerActive(true);

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerActive(false);
            handleTimeUp();
            return 0;
          }

          const newTime = prev - 1;
          // Save time remaining to store
          updateSession(session.id, { timeRemaining: newTime });
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.currentQuestionIndex, hasStarted, currentQuestion?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTimeUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!currentQuestion) return;

    // Auto-submit current answer (even if empty)
    const answer = {
      questionId: currentQuestion.id,
      text: currentAnswer.trim() || "(No answer provided - time expired)",
      timeSpent: currentQuestion.timeLimit,
      isTimedOut: true,
      timestamp: new Date(),
    };

    submitAnswer(session.id, answer);
    setCurrentAnswer("");
    moveToNextQuestion(session.id);
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !currentQuestion) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const timeSpent = currentQuestion.timeLimit - (timeRemaining || 0);
    const answer = {
      questionId: currentQuestion.id,
      text: currentAnswer.trim(),
      timeSpent,
      isTimedOut: false,
      timestamp: new Date(),
    };

    submitAnswer(session.id, answer);
    setCurrentAnswer("");
    setIsTimerActive(false);
    moveToNextQuestion(session.id);
  };

  const handleStartInterview = () => {
    updateSession(session.id, {
      status: "in-progress",
      startedAt: new Date(),
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (session.status === "completed") {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Interview Completed!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the technical interview.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Final Score:</span>
              <span className="text-2xl font-bold text-primary">
                {session.score}/180
              </span>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Summary:</h4>
              <p className="text-sm text-muted-foreground">{session.summary}</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Interview Statistics:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Questions Answered:
                  </span>
                  <span className="ml-2 font-medium">
                    {session.answers.length}/6
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time Outs:</span>
                  <span className="ml-2 font-medium">
                    {session.answers.filter((a) => a.isTimedOut).length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to Start Your Interview?
          </h2>
          <p className="text-muted-foreground mb-6">
            You're about to begin a technical interview with 6 questions
            covering React and Node.js development.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Interview Structure:</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="text-green-600 font-semibold">2 Easy</div>
                  <div className="text-xs text-muted-foreground">20s each</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <div className="text-yellow-600 font-semibold">2 Medium</div>
                  <div className="text-xs text-muted-foreground">60s each</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <div className="text-red-600 font-semibold">2 Hard</div>
                  <div className="text-xs text-muted-foreground">120s each</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-medium">Interview Rules:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Questions will be presented one at a time</li>
                <li>• Each question has a time limit based on difficulty</li>
                <li>
                  • When time runs out, your current answer will be
                  automatically submitted
                </li>
                <li>
                  • You can submit your answer early by clicking "Submit Answer"
                </li>
                <li>• Your progress is automatically saved</li>
              </ul>
            </div>

            <Button onClick={handleStartInterview} className="w-full" size="lg">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {session.currentQuestionIndex + 1} of{" "}
            {session.questions.length}
          </span>
          <span>
            {Math.round(
              (session.currentQuestionIndex / session.questions.length) * 100,
            )}
            % Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(session.currentQuestionIndex / session.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Timer */}
      {timeRemaining !== null && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Time Remaining:</span>
              </div>
              <div
                className={`text-xl font-bold ${timeRemaining <= 10 ? "text-red-500" : "text-primary"}`}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {session.currentQuestionIndex + 1}
            </CardTitle>
            {currentQuestion && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}
              >
                {currentQuestion.difficulty}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion && (
            <p className="text-base leading-relaxed">{currentQuestion.text}</p>
          )}

          <div>
            <label htmlFor="answer" className="block text-sm font-medium mb-2">
              Your Answer:
            </label>
            <Textarea
              ref={textareaRef}
              id="answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[120px]"
              disabled={!isTimerActive}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {currentAnswer.length} characters
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || !isTimerActive}
                className="flex items-center gap-2"
              >
                {isLastQuestion ? (
                  <>
                    Complete Interview <CheckCircle className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Submit Answer <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Answers (if any) */}
      {session.answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.answers.map((answer, index) => {
              const question = session.questions.find(
                (q) => q.id === answer.questionId,
              );
              return (
                <div
                  key={answer.questionId}
                  className="text-sm border-l-2 border-gray-200 pl-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      Q{index + 1}: {question?.difficulty}
                    </span>
                    <span className="text-muted-foreground">
                      {answer.isTimedOut ? "Timed Out" : `${answer.timeSpent}s`}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {answer.text.substring(0, 100)}
                    {answer.text.length > 100 ? "..." : ""}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
