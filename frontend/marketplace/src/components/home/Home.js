import React from 'react'
import '../../scss/homepage.scss' 
import { Element, scroller } from 'react-scroll'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import history from '../../assets/images/homepage/history.mp4'
import exploration from '../../assets/images/phases/exploration.jpg'
import expansion from '../../assets/images/phases/expansion.jpg'
import extaction from '../../assets/images/phases/extraction.jpg'
import processing from '../../assets/images/phases/processing.jpg'
import transpotation from '../../assets/images/phases/transportation.jpg'
import utilization from '../../assets/images/phases/utilization.webp'
import economics from '../../assets/images/homepage/economics.mp4'

import { logo } from 'src/assets/brand/logo'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'

function HeroSection() {
  const handleGetStarted = () => {
    scroller.scrollTo('mission', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
    })
  }

  return (
    <div name="home" className="hero-section">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
      >
        <h2><strong>Unlock the Potential of Asteroid Mining</strong></h2>
        <p>Explore, extract, and profit from the resources of the cosmos.</p>
        <motion.button
          className="cta-button"
          onClick={handleGetStarted}
          whileHover={{ scale: 1.8 }}
          whileTap={{ scale: 0.9 }}
        >
         <strong> GET START</strong>
        </motion.button>
      </motion.div>
    </div>
  )
}

function Mission() {
  const controls = useAnimation()
  const { ref, inView } = useInView({ triggerOnce: true })

  if (inView) {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 1 },
    })
  }

  return (
    <Element name="mission" className="mission-section">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={controls}>
        <h2>OUR MISSION</h2>
        <p>
          As resource depletion on Earth becomes more tangible, the idea of extracting valuable
          elements from asteroids and returning these to Earth for profit, or using space-based
          resources to build solar power satellites and space habitats, becomes more attractive and
          potentially more achievable." <br />
          <br />
          At Nova Dynamics, we are driven by this mission. We believe that the future of humanity
          lies in the stars, and we are committed to making this future a reality. Through our
          efforts, we aim to secure a sustainable and prosperous future for all, both on Earth and
          beyond.
          <br />
          <br />
           <Link to="conteact-us">Join us </Link>as we journey into the cosmos, unlocking new potentials and redefining what is
          possible. Welcome to Nova Dynamics, where the future is within our reach.
          <br />
          <br />
        </p>
      </motion.div>
    </Element>
  )
}

function Phases() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enables automatic sliding
    autoplaySpeed: 3000, // Time interval between slides in milliseconds
  }

  return (
    <>
      <Element name="phases" className="phases-section">
        <div>
          <h2>Our RoadMap</h2>
        </div>
        <Slider {...settings}>
          <div className="phase">
            <h3>Phase 1: Exploration</h3>
            <img src={exploration} />

            <p>
              In this phase, scientists use telescopes and space probes to conduct detailed surveys
              of asteroids, assessing their size, composition, and location. The goal is to identify
              asteroids with valuable resources that are feasible for mining. Advanced technology
              such as spectrometers and cameras helps in analyzing the asteroid surfaces. The
              outcome is a list of viable asteroids ready for the next phase of the mining process.
            </p>
          </div>
          <div className="phase">
            <h3>Phase 2: Extraction</h3>
            <img src={extaction} />

            <p>
              {' '}
              <br />
              Advanced robotics are deployed to the selected asteroids to extract valuable
              materials. Automated drills, scoops, and other mining tools break apart and collect
              the resources while minimizing environmental impact. The robots are controlled
              remotely from Earth or nearby spacecraft. This phase concludes with the collection of
              raw materials, prepared for transportation.
            </p>
          </div>
          <div className="phase">
            <h3>Phase 3: Transportation</h3>
            <img src={transpotation} />

            <p>
              {' '}
              <br />
              The extracted materials are transported back to Earth or to an orbital processing
              facility using specially designed spacecraft. These spacecraft are optimized for
              handling the weight and volume of the materials while ensuring cost-effective and safe
              transport. Propulsion systems and safety measures are crucial for this journey. The
              phase ends with the delivery of raw materials to the next stage.
            </p>
          </div>
          <div className="phase">
            <h3>Phase 4: Processing</h3>
            <img src={processing} />

            <p>
              {' '}
              <br />
              Refining and processing the raw materials into usable forms occur in this phase,
              either in space or on Earth. Advanced technologies separate valuable minerals from the
              ore and purify them to industrial standards. The decision to process in space or on
              Earth depends on factors such as cost and infrastructure. The result is refined
              materials ready for industrial application.
            </p>
          </div>
          <div className="phase">
            <h3>Phase 5: Utilization</h3>
            <img src={utilization} />

            <p>
              {' '}
              <br />
              Processed materials are utilized in various industries, including construction,
              manufacturing, and energy production. These resources support the building of
              infrastructure, production of goods, and creation of energy technologies. Applications
              extend to space habitats and satellites, promoting economic growth and technological
              advancement. The phase concludes with the materials being integrated into the
              industrial supply chain.
            </p>
          </div>
          <div className="phase">
            <h3>Phase 6: Expansion</h3>
            <img src={expansion} />

            <p>
              {' '}
              <br />
              Operations expand beyond initial targets to include other asteroids and celestial
              bodies, establishing permanent bases. These bases support continuous mining operations
              and may eventually host human colonies. The focus is on developing sustainable
              infrastructure for long-term presence in space. This phase aims to ensure a steady
              resource supply and facilitate human expansion into the solar system.
            </p>
          </div>
        </Slider>
      </Element>
    </>
  )
}

function Economics() {
  const controls = useAnimation()
  const { ref, inView } = useInView({ triggerOnce: true })

  if (inView) {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 1.5 },
    })
  }

  return (
    <>
      <Element name="economics" className="economics-section">
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={controls}>
          <h2>The History of Asteroid Mining</h2>
          <video src={history} autoPlay loop muted controls={false} />
          <p>
           
            Asteroid mining refers to the theoretical extraction of resources and materials from
            asteroids and other minor planets, including near-Earth objects. <br />
            <br />
            Before 1970, the idea of asteroid mining was primarily confined to science fiction.
            Stories like ‘Worlds of If’, ‘Scavengers in Space’, and ‘Miners in the Sky’ depicted the
            imagined risks, motivations, and exciting experiences associated with mining asteroids.
            {/* <br /> */}
            {/* <br /> */}
            Simultaneously, many academic researchers speculated about the potential profits from
            asteroid mining, though they lacked the necessary technology to seriously pursue it.
            <br />
            <br />
            However, the successful moon landing in 1969 sparked significant scientific interest in
            human space activities beyond Earth’s orbit. Throughout the following decade, academic
            interest in asteroid mining grew.
            {/* <br />
            <br /> */}
            Following these lunar advancements, serious academic consideration focused on mining
            asteroids closer to Earth than the main asteroid belt. The Apollo and Amor asteroid
            groups were particularly targeted due to their proximity to Earth and the belief that
            they were rich in raw materials.
            <br />
            <br />
            Despite the interest, the space science community acknowledged the limited knowledge
            {/* about asteroids and advocated for a cautious and systematic approach to asteroid mining.
            <br />
            <br /> */}
            Academic curiosity persisted into the 1980s, with continued promise in the Apollo and
            Amor asteroid groups. By the decade's end, however, interest shifted to Mars' moons,
            Phobos and Deimos.
            <br />
            <br />
            Space research organizations like NASA began exploring how to process materials in space
            and utilize the gathered resources.
            <br />
            <br />
            In the 1990s, the theoretical landscape evolved further, with new motivations for
            asteroid mining emerging, mainly due to environmental concerns about overconsumption of
            Earth's natural resources and harnessing solar energy in space.
            {/* <br />
            <br /> */}
            During this period, NASA investigated which materials in asteroids, such as free metals,
            volatiles, and bulk dirt, could be valuable for extraction.
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </p>

          <h2>ECONOMICS OF THE STARS</h2>
          <video src={economics} autoPlay loop muted controls={false} />
          <p>
            The rapid depletion of Earth's resources continues to pose a significant economic
            challenge, as our seemingly unlimited needs clash with the limited and fast-dwindling
            supply of materials. 
            {/* <br /> */}
            {/* <br /> */}
            Given Earth's finite resources, the abundant ore found in asteroids offers a tantalizing
            solution: space mining. This prospect could potentially provide nearly unlimited
            resources, alleviating the looming issue of material scarcity.
            <br />
            <br />
            Asteroid mining's most noticeable impact would likely be on the global economy. Renowned
            astrophysicist Neil DeGrasse Tyson suggests that the first trillionaire will emerge from
            asteroid mining, highlighting the immense wealth this industry could generate.
            {/* <br />
            <br /> */}
            Additionally, advancing this technology could pave the way for a future space economy,
            including galactic tourism and human settlement.
            <br />
            <br />
            However, some experts argue that asteroid mining might devastate the global raw
            materials market, currently valued at around USD 660 billion. They claim that the influx
            of materials worth quintillions of dollars could flood the market, rapidly devaluing
            global raw materials.
            <br />
            <br />
            While this scenario remains speculative, the world's leading minds continue to study
            asteroids, hoping that one day, asteroid mining will become a transformative reality.
            <br />
            <br />
          </p>
        </motion.div>
      </Element>
    </>
  )
}

function Home() {
  return (
    <div className="App">
      <div className="stars"></div>
      <div className="stars"></div>
      <HeroSection />
      <Mission />
      <Phases />
      <Economics />
    </div>
  )
}

export default Home
