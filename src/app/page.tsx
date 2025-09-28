"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ErrorBoundary from "~/components/ui/error-boundary";
import { useInterviewStore } from "~/lib/store";
import ResumeUpload from "~/components/widgets/ResumeUpload";
import InterviewChat from "~/components/widgets/InterviewChat";
import InterviewerDashboard from "~/components/widgets/InterviewerDashboard";
import CandidateDetailView from "~/components/widgets/CandidateDetailView";
import WelcomeBackModal from "~/components/widgets/WelcomeBackModal";
import type { CandidateInfo } from "~/types/interview";

type AppView = "upload" | "interview" | "dashboard" | "candidate-detail";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>("upload");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [activeTab, setActiveTab] = useState<"interviewee" | "interviewer">(
    "interviewee",
  );
  const [error, setError] = useState<string | null>(null);

  const {
    createSession,
    getCurrentSession,
    restoreSession,
    currentSessionId,
    sessions,
  } = useInterviewStore();

  // Check for existing incomplete session on mount
  useEffect(() => {
    const incompleteSessions = sessions.filter(
      (s) =>
        s.status === "in-progress" ||
        (s.status === "not-started" && s.answers.length === 0),
    );

    if (incompleteSessions.length > 0 && !currentSessionId) {
      const latestSession = incompleteSessions.sort(
        (a, b) =>
          new Date(b.startedAt || 0).getTime() -
          new Date(a.startedAt || 0).getTime(),
      )[0];

      if (latestSession) {
        setShowWelcomeBack(true);
      }
    }

    // If there's a current session, show the interview
    if (currentSessionId) {
      const session = getCurrentSession();
      if (session) {
        if (session.status === "completed") {
          setCurrentView("interview"); // Show completion screen
        } else if (
          session.status === "in-progress" ||
          session.status === "not-started"
        ) {
          setCurrentView("interview");
        }
      }
    }
  }, [sessions, currentSessionId, getCurrentSession]);

  const handleResumeDataExtracted = (candidateInfo: CandidateInfo) => {
    try {
      const sessionId = createSession(candidateInfo);
      setCurrentView("interview");
      setError(null);
      setActiveTab("interviewee");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create interview session",
      );
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  const handleViewCandidate = (sessionId: string) => {
    setSelectedCandidateId(sessionId);
    setCurrentView("candidate-detail");
  };

  const handleBackToDashboard = () => {
    setSelectedCandidateId(null);
    setCurrentView("dashboard");
  };

  const handleWelcomeBackContinue = () => {
    const incompleteSessions = sessions.filter(
      (s) =>
        s.status === "in-progress" ||
        (s.status === "not-started" && s.answers.length === 0),
    );

    if (incompleteSessions.length > 0) {
      const latestSession = incompleteSessions.sort(
        (a, b) =>
          new Date(b.startedAt || 0).getTime() -
          new Date(a.startedAt || 0).getTime(),
      )[0];

      if (latestSession) {
        restoreSession(latestSession.id);
        setCurrentView("interview");
        setActiveTab("interviewee");
      }
    }

    setShowWelcomeBack(false);
  };

  const handleWelcomeBackStartNew = () => {
    setShowWelcomeBack(false);
    setCurrentView("upload");
    setActiveTab("interviewee");
  };

  const handleTabChange = (tab: string) => {
    const newTab = tab as "interviewee" | "interviewer";
    setActiveTab(newTab);

    if (newTab === "interviewer") {
      setCurrentView("dashboard");
    } else {
      // Switch to interviewee tab
      const currentSession = getCurrentSession();
      if (currentSession) {
        setCurrentView("interview");
      } else {
        setCurrentView("upload");
      }
    }
  };

  const getWelcomeBackSession = () => {
    const incompleteSessions = sessions.filter(
      (s) =>
        s.status === "in-progress" ||
        (s.status === "not-started" && s.answers.length === 0),
    );

    if (incompleteSessions.length > 0) {
      return incompleteSessions.sort(
        (a, b) =>
          new Date(b.startedAt || 0).getTime() -
          new Date(a.startedAt || 0).getTime(),
      )[0];
    }

    return null;
  };

  const renderIntervieweeContent = () => {
    const currentSession = getCurrentSession();

    switch (currentView) {
      case "upload":
        return (
          <ErrorBoundary>
            <ResumeUpload
              onDataExtracted={handleResumeDataExtracted}
              onError={handleError}
            />
          </ErrorBoundary>
        );

      case "interview":
        if (!currentSession) {
          return (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                No active interview session
              </p>
              <button
                onClick={() => setCurrentView("upload")}
                className="text-primary hover:underline"
              >
                Start a new interview
              </button>
            </div>
          );
        }
        return <InterviewChat session={currentSession} />;

      default:
        return (
          <ErrorBoundary>
            <ResumeUpload
              onDataExtracted={handleResumeDataExtracted}
              onError={handleError}
            />
          </ErrorBoundary>
        );
    }
  };

  const renderInterviewerContent = () => {
    switch (currentView) {
      case "dashboard":
        return <InterviewerDashboard onViewCandidate={handleViewCandidate} />;

      case "candidate-detail":
        if (!selectedCandidateId) {
          return <InterviewerDashboard onViewCandidate={handleViewCandidate} />;
        }
        return (
          <CandidateDetailView
            sessionId={selectedCandidateId}
            onBack={handleBackToDashboard}
          />
        );

      default:
        return <InterviewerDashboard onViewCandidate={handleViewCandidate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Back Modal */}
      <WelcomeBackModal
        open={showWelcomeBack}
        session={getWelcomeBackSession() || null}
        onContinue={handleWelcomeBackContinue}
        onStartNew={handleWelcomeBackStartNew}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="px-6 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="interviewee"
                  className="flex items-center gap-2"
                >
                  <span>Interviewee</span>
                  {getCurrentSession() &&
                    getCurrentSession()!.status === "in-progress" && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </TabsTrigger>
                <TabsTrigger
                  value="interviewer"
                  className="flex items-center gap-2"
                >
                  <span>Interviewer</span>
                  {sessions.length > 0 && (
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                      {sessions.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent
            value="interviewee"
            className="mt-0 focus-visible:outline-none"
          >
            <div className="container mx-auto py-8">
              {renderIntervieweeContent()}
            </div>
          </TabsContent>

          <TabsContent
            value="interviewer"
            className="mt-0 focus-visible:outline-none"
          >
            {renderInterviewerContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
