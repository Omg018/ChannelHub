
import Hero from '../components/hero'
import About from '../components/about'
import Footer from '../components/footer'

const Home = () => {
    return (
        <div className="bg-black min-h-screen">
     
            <Hero />
            <About />
            <Footer />
        </div>
    )
}

export default Home