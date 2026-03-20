import { BookOpen, FileText, Layers, Brain, Award, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './ChapterSidebar.css';

const ChapterSidebar = ({
  chapters,
  activeChapter,
  onChapterClick,
  activeSection,
  onSectionClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: 'notes', label: 'Course Notes', icon: FileText },
    { id: 'diagram', label: 'Visual Diagram', icon: Layers },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSectionClick(sectionId);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <BookOpen className="sidebar-logo" />
          <h2>Course Navigation</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Sections</h3>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChapterSidebar;