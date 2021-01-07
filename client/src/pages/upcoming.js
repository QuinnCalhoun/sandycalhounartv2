import React from 'react'
import { Image, Grid, Segment } from 'semantic-ui-react'
const Upcoming = () => {

    return (
        <Grid  stackable>
            <Grid.Column >
                <Segment as='a'  href='https://www.bluelinearts.org/crocker-kingsley-2021-2' style={{margin: 'auto'}}  compact>
                    <Image style={{maxHeight: '500px'}} src={require('../assets/pics/Crocker.jpg')} />
                </Segment>
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming