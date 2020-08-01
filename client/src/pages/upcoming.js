import React from 'react' 
import { Container, Image } from 'semantic-ui-react'
const Upcoming = () => {
 
    return (
        <Container>
            <Image as='a' href='https://www.appliedcontemporary.com/current-exhibiiton' src={require('../assets/pics/appliedcontemp.jpeg')} style={{maxWidth: '350px'}} alt='Applied Contemporary in Oakland' />
        </Container>
    )
}

export default Upcoming