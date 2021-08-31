import { Image, Grid, Segment, Header, Divider, Button } from 'semantic-ui-react'
import UpcomingCard from '../components/upcomingContent'
import { Storytime } from '../assets/pics/index'


const Upcoming = () => {

    return (
        <Grid stackable columns={3}>
            <Grid.Row>
                <Header size='large' content={'Upcoming Shows and Exhibitions'} />
            </Grid.Row>
            <Grid.Column >
                <Segment attached='top'>
                    <Header>Storytime - Opening from 3pm - 5pm,<br /> September 25th</Header>
                    <Divider />
                    <Image src={Storytime} />
                </Segment>
                <Segment attached='bottom'>
                    Showing in Alpha Fired Arts, <a href='https://www.google.com/maps/place/4675+Aldona+Ln,+Sacramento,+CA+95841/data=!4m2!3m1!1s0x809ad9316c971b43:0xceba24a434745f5?sa=X&ved=2ahUKEwix9rKN-tvyAhXlLX0KHc0tD7QQ8gF6BAgOEAE'>4675 Aldona Lane Sacramento, CA</a>
                    <Button fluid href='https://www.alphafiredarts.com/'>Click here for more info</Button>
                </Segment>
            </Grid.Column>
            <Grid.Column >
                
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming