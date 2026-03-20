import { useState, useEffect } from 'react';
import { BookOpen, FileText, Layers, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChapterSidebar from './ChapterSidebar';
import DiagramViewer from './DiagramViewer';
import FlashcardSection from './FlashcardSection';
import QuizSection from './QuizSection';
import './NoteViewer.css'; // ✅ Updated CSS import

const NoteViewer= ({ data }) => {
  const [activeSection, setActiveSection] = useState('notes');
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 200) {
          const sectionId = section.getAttribute('data-section');
          if (sectionId) setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="notes-container-2">
      <ChapterSidebar
        chapters={data.output.courseOutline}
        activeChapter={activeChapter}
        onChapterClick={setActiveChapter}
        activeSection={activeSection}
        onSectionClick={setActiveSection}
      />

      <main className="notes-content-2">
        <header className="notes-header-2">
          <div className="header-gradient-2">
            <div className="header-content-note-2">
              <h1 className="course-title-2">{data.subject}</h1>
            </div>
          </div>
        </header>

        <section data-section="chapters" className="content-section-note-2 chapters-section-2">
          <div className="section-header-note-2">
            <BookOpen className="section-icon-2" />
            <h2>Course Outline</h2>
          </div>
          <div className="chapters-grid-2">
            {data.output.courseOutline.map((chapter, index) => (
              <div
                key={index}
                className={`chapter-card-2 ${activeChapter === index ? 'active' : ''}`}
                onClick={() => setActiveChapter(index)}
              >
                <div className="chapter-number-2">
                  <span>{index + 1}</span>
                </div>
                <p className="chapter-title-2">{chapter}</p>
                {activeChapter === index && (
                  <CheckCircle className="chapter-check-2" size={20} />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="content-wrapper-note-2">
          <section data-section="notes" className="content-section-note-2 notes-section-2">
            <div className="section-header-note-2">
              <FileText className="section-icon-2" />
              <h2>Course Notes</h2>
            </div>
            <div className="markdown-content-2">
              <ReactMarkdown>{data.output.notes}</ReactMarkdown>
            </div>
          </section>

          <div className="section-divider-2" />

          <section data-section="diagram" className="content-section-note-2 diagram-section-2">
            <div className="section-header-note-2">
              <Layers className="section-icon-2" />
              <h2>Visual Diagram</h2>
            </div>
            <DiagramViewer diagram={data.output.diagram} />
          </section>

          <div className="section-divider-2" />

          <section data-section="flashcards" className="content-section-note-2">
            <div className="section-header-note-2">
              <Layers className="section-icon-2" />
              <h2>Flashcards</h2>
            </div>
            <FlashcardSection flashcards={data.output.flashcards} />
          </section>

          <div className="section-divider-2" />

          <section data-section="quiz" className="content-section-note-2">
             <div className="section-header-note-2">
              <Layers className="section-icon-2" />
              <h2>Quiz</h2>
            </div>
            <QuizSection quiz={data.output.quiz} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default NoteViewer;
