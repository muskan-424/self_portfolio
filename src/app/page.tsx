import { ChatAssistant } from "@/components/ChatAssistant";
import { GitHubSection } from "@/components/GitHubSection";
import { Nav } from "@/components/Nav";
import {
  About,
  AssistantCallout,
  Contact,
  Education,
  Experience,
  Footer,
  Hero,
  Projects,
  Skills,
} from "@/components/Sections";

// Statically rendered; the GitHub section is regenerated in the background at most once an hour.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <AssistantCallout />
        <GitHubSection />
        <Education />
        <Contact />
      </main>
      <Footer />
      <ChatAssistant />
    </>
  );
}
