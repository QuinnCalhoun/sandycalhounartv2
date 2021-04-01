import React from 'react'
import { Image, Grid, Segment } from 'semantic-ui-react'
import UpcomingCard from '../components/upcomingContent'


const Upcoming = () => {

    return (
        <Grid  stackable>
            <Grid.Column >
                <Segment style={{margin: '5% 25%'}} compact>
                    <UpcomingCard />
                </Segment>
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming