import React, { Component } from 'react'
import Header from '../component/Header/Header'
import Footer from '../component/Footer/Footer'
import SubFooter from '../component/Footer/SubFooter'
import ContactHero from '../component/ContactUsPage/ContactHero'
import ContactForm from '../component/ContactUsPage/ContactForm'

export default class ContactUsPage extends Component {
    render() {
        return (
            <>
                <Header backgroundColor="#0076F5" textcolor="#ffff" />
                <ContactHero />
                <ContactForm />
                <SubFooter />
                <Footer />
            </>
        )
    }
}
