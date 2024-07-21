import React from 'react'
import Home from '../../../components/home/Home'
import Header from '../../../components/homeHeader/header'
import AboutUs from '../../../components/home/aboutUs'
import ContactUs from '../../../components/home/contactUs'

const Homepage = () => {
  return (
    <div>
      <Header />
        <Home />
        <AboutUs />
        <ContactUs />
    </div>
  )
}

export default Homepage