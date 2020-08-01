import React from 'react'
import { Image, Grid } from 'semantic-ui-react'
const Upcoming = () => {

    return (
        <Grid stackable columns='2'>
            <Grid.Column>
                <Image
                    as='a'
                    href='https://www.appliedcontemporary.com/current-exhibiiton'
                    src={require('../assets/pics/appcon.jpg')}
                    alt='Applied Contemporary in Oakland' />
            </Grid.Column>
        </Grid>
    )
}

export default Upcoming