import React, { Component } from 'react'
import Header from '../component/Header/Header'
import AboutHero from '../component/AboutUsPage/AboutHero'
import CompanyIntroduction from '../component/AboutUsPage/CompanyIntroduction'
import Footer from '../component/Footer/Footer'
import Timeline from '../component/AboutUsPage/Timeline'
import StatsSection from '../component/AboutUsPage/StatsSection'
import SubFooter from '../component/Footer/SubFooter'

export default class AboutUsPage extends Component {
  render() {
    return (
      <>
        <Header backgroundColor="#0076F5" textcolor="#ffff" />
        <AboutHero />
        <CompanyIntroduction />
        <Timeline/>
        <StatsSection/>
        <SubFooter/>
        <Footer />
      </>
    )
  }
}
