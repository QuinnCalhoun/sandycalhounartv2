import { Container } from 'semantic-ui-react'
import { Route, Routes } from 'react-router-dom'
import { Landing, About, Art, Upcoming, Contact, Resume } from '../pages/index'

const ContentBody = () => {
  return (
    <Container fluid>
      <Routes>
        <Route exact path='/' element={<Landing />} />
        <Route exact path='/about' element={<About />} />
        <Route exact path='/resume' element={<Resume />} />
        <Route exact path='/artworks' element={<Art />} />
        <Route exact path='/upcoming' element={<Upcoming />} />
        <Route exact path='/contact' element={<Contact />} />
      </Routes>
    </Container>
  )
}

export default ContentBody