import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import IntervieweeWidget from "~/components/widgets/interviewee";
import InterviewerWidget from "~/components/widgets/interviewer";

export default function HomePage() {
  return (
    <main className="">
      <Tabs defaultValue="interviewee" className="w-7xl mx-auto">
        <TabsList className="w-full justify-center mt-2 mx-3">
          <TabsTrigger value="interviewee">Interviewee</TabsTrigger>
          <TabsTrigger value="interviewer">Interviewer</TabsTrigger>
        </TabsList>
        <TabsContent value="interviewee">
          <IntervieweeWidget />
        </TabsContent>
        <TabsContent value="interviewer">
          <InterviewerWidget />
        </TabsContent>
      </Tabs>
    </main>
  );
}
