import React from 'react'
import { Image, Grid, Segment } from 'semantic-ui-react'
const Upcoming = () => {

    return (
        <Grid  stackable>
            <Grid.Column >
                <Segment style={{margin: '5% 25%'}} compact>
                    <Image src={require('../assets/pics/Crocker.jpg')} />
                </Segment>
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming