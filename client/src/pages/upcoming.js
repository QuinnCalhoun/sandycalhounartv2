import React from 'react'
import { Image, Grid, Segment } from 'semantic-ui-react'
const Upcoming = () => {

    return (
        <Grid  stackable>
            <Grid.Column >
                <Segment style={{margin: '5% 25%'}} compact>
                    Check back for upcoming shows
                </Segment>
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming