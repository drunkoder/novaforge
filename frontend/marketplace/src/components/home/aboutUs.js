import React from 'react';
import '../../scss/aboutUs.scss';
import aboutUs from '../../assets/images/homepage/aboutUs.mp4';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import member1 from '../../assets/images/homepage/member1.png'
import member2 from '../../assets/images/homepage/member2.png'
import member3 from '../../assets/images/homepage/member3.png'
import member4 from '../../assets/images/homepage/member4.png'


const teamMembers = [
  {
      name: "Devinder Singh",
      position: "Team Member",
      image: member1,
      bio: "Devinder is Team Member the of Nova Dynamics, leading the company with a visionary approach to asteroid mining and space resource utilization. With over two decades of experience in technology and aerospace, he has propelled Nova Dynamics to the forefront of space innovation. Under his leadership, the company has established mining operations across multiple celestial bodies and is pioneering sustainable extraction technologies."
  },
  {
      name: "Truptesh Vasava",
      position: "Team Member",
      image: member2,
      bio: "Truptesh Vasava is Team Memeber of the Nova Dynamics, focusing on asteroid mining and space resource utilization. With over 20 years of experience in technology and aerospace, Truptesh leads the company in pioneering sustainable space extraction technologies."
  },
  {
      name: "Shilpa",
      position: "Team Member",
      image: member3,
      bio: "Shilpa is Team Member of Nova Dynamics, specializing in asteroid mining and space resource utilization. With over 20 years of experience in technology and aerospace, Shilpa plays a crucial role in advancing the company's sustainable space extraction technologies."
  },
  {
    name: "Sheila Mae Tabay",
    position: "Team Member",
    image: member4,
    bio: "Sheila is Team Member of Nova Dynamics, focusing on asteroid mining and space resource utilization. With over 20 years of experience in technology and aerospace, Sheila leads the company in pioneering sustainable space extraction technologies."
}
  // Add more team members as needed
];

const AboutUs = () => {

  
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: false, 
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
};
  return (
    <div name="about-us" className="about-us-container">
      <h2><strong>About Nova Dynamics</strong></h2>
      <div className="card">
        <div className="content">
          <div className="text-content">
            <h3>About Us</h3>
            <p>
              Welcome to Nova Dynamics, a pioneering force in the frontier of asteroid mining and
              space resource utilization. We are dedicated to transforming the way humanity
              interacts with the cosmos, turning what was once science fiction into a vibrant,
              reality-driven enterprise.
            </p>

            <h3>Our Journey</h3>
            <p>
              Founded with a vision to explore and harness the untapped potential of space, Nova
              Dynamics has quickly established itself as a leader in the asteroid mining industry.
              With mining operations spanning almost every celestial body in our solar system, we
              are committed to unlocking the immense value of space resources. Our team of
              world-class scientists, engineers, and space enthusiasts work tirelessly to develop
              innovative technologies that make space mining not only feasible but also economically
              viable.
            </p>

            <h3>What We Do</h3>
            <p>
              At Nova Dynamics, we specialize in the extraction, selling, and buying of rare raw
              materials from asteroids. Our advanced mining techniques allow us to harvest precious
              metals and minerals that are becoming scarce on Earth, ensuring a sustainable supply
              of these critical resources for future generations.
            </p>

            <h3>Expanding Horizons</h3>
            <p>
              Our ambitions extend far beyond mining. We are at the forefront of developing
              space-based services that will shape the future of humanity's presence in space:
            </p>
            <ul>
              <li>
                <span className="bold">Space tourism:</span> Offering unique and breathtaking space
                tourism experiences, allowing individuals to witness the wonders of the cosmos
                first-hand.
              </li>
              <li>
                <span className="bold">Satellite Services:</span> Providing cutting-edge satellite
                services that enhance global communications, weather forecasting, and scientific
                research.
              </li>
              <li>
                <span className="bold">Space Manufacturing:</span> Utilizing microgravity
                environments to create high-quality products, such as pharmaceuticals and advanced
                materials, that are not possible to manufacture on Earth.
              </li>
              <li>
                <span className="bold">Space-based Solar Power:</span> Developing solar power
                stations in space to harness the sun's energy and transmit it back to Earth,
                providing a clean and virtually limitless energy source.
              </li>
              <li>
                <span className="bold">Lunar and Martian Bases:</span> Establishing sustainable
                human habitats on the Moon and Mars, paving the way for long-term space colonization
                and exploration.
              </li>
            </ul>
            <p>
              Continuously innovating and exploring new avenues to expand our impact and reach in
              the space industry.
            </p>
          </div>
          <div className="video-content">
            <video src={aboutUs} autoPlay loop muted controls={false} />
          </div>
        </div>

        <div className="our-team-container">
            <h2>Meet Our Team</h2>
            <Slider {...settings}>
                {teamMembers.map((member) => (  
                    <div className="team-member" key={member.name}>
                        <img src={member.image} alt={member.name} />
                        <h3>{member.name}</h3> 
                        <p className="position">{member.position}</p>
                        <p className="bio">{member.bio}</p>
                    </div>
                ))}
            </Slider>
        </div>
      </div>
    </div>
  )
}

export default AboutUs;
