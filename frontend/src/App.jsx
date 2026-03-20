import "./App.css";
import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./pages/Dashboard";
import StudyMaterialDetail from "./pages/StudyMaterialDetail";
import InputForm from "./components/InputForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts"; // ✅ adjust if path differs
import { CreditsProvider } from "./context/CreditsContext";
import Index from "./pages/Index";
import Home from "./components/Home";
import { ThemeProvider } from "./context/ThemeContext";
import ChatpdfDashboard from "./Chatpdf/ChatpdfDashboard";
function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="app">
      <Header scrollY={scrollY} />
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}

function App() {

  return (
    <>

      <AuthProvider>
        <ThemeProvider>
          <CreditsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/getstarted" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inputform" element={<InputForm />} />
                {/* ✅ make sure this param name matches useParams in StudyMaterialDetail */}
                <Route path="/study-material/:materialId" element={<StudyMaterialDetail />} />
                <Route path="/course/:materialId" element={<Index />} />
                <Route path="/chat-with-pdf" element={<ChatpdfDashboard />} />
              </Routes>
            </BrowserRouter>
          </CreditsProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
