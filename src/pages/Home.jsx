import About from '../components/About.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import Bioimpedance from '../components/Bioimpedance.jsx';
import Footer from '../components/Footer.jsx';
import Gallery from '../components/Gallery.jsx';
import Hero from '../components/Hero.jsx';
import Navbar from '../components/Navbar.jsx';
import Services from '../components/Services.jsx';
import Testimonials from '../components/Testimonials.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Bioimpedance />
        <Services />
        <Testimonials />
        <Gallery />
        <AppointmentForm />
      </main>
      <Footer />
    </>
  );
}
