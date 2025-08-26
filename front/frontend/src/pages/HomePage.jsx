import { Navbar, SubmissionForm, PositiveContent, FactCheckList, Footer } from '../components';
import HomePageCarousel from '../components/HomePageCarousel';

const HomePage = () => {
  return (
    <>
      <Navbar />
      
      {/* Full-screen Carousel Hero Section */}
      <section className="w-full h-screen">
        <HomePageCarousel />
      </section>
      
      <div className="container mx-auto px-4 py-8">

        <main className="space-y-16">
          <section id="submit">
            <SubmissionForm />
          </section>
          
          <section id="haiti-unveiled">
            <PositiveContent />
          </section>
          
          <section id="fact-checks">
            <FactCheckList />
          </section>
        </main>
      </div>
      
      <Footer />
    </>
  )
}

export default HomePage;