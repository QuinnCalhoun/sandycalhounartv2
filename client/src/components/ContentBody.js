import React from 'react'
import { Container } from 'semantic-ui-react'
import { Route } from 'react-router-dom'
import { Landing, About, Art, Upcoming, Contact } from '../pages/index'

const ContentBody = () => {
    return (
        <Container fluid>
            <Route exact path='/' component={Landing} />
            <Route exact path='/about' component={About} />
            <Route exact path='/artworks' component={Art} />
            <Route exact path='/upcoming' component={Upcoming} />
            <Route exact path='/contact' component={Contact} />
        </Container>
    )
}

export default ContentBody