import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ModalProvider } from './context/ModalContext';

// Pages
import Home from './pages/Home';
import Demarrer from './pages/Demarrer';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Confidentialite from './pages/Confidentialite';
import Impressum from './pages/Impressum';
import Templates from './pages/Templates';
import ScrollToTop from '../components/ScrollToTop';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <ModalProvider>
                <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black antialiased">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/demarrer" element={<Demarrer />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/projets" element={<Projects />} />
                        <Route path="/confidentialite" element={<Confidentialite />} />
                        <Route path="/impressum" element={<Impressum />} />
                        <Route path="/templates" element={<Templates />} />
                    </Routes>
                    <WhatsAppButton />
                    <Footer />
                </div>
            </ModalProvider>
        </Router>
    );
}

export default App;
