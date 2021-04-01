import { Image, Grid, Segment, Header } from 'semantic-ui-react'
import UpcomingCard from '../components/upcomingContent'
import { CrowShow, Gallery625 } from '../assets/pics/index'


const Upcoming = () => {

    return (
        <Grid stackable columns={3}>
            <Grid.Row>
                <Header size='large' content={'Upcoming Shows and Exhibitions'} />
            </Grid.Row>
            <Grid.Column >
                <Segment compact>
                    <UpcomingCard
                        showImage={CrowShow}
                        showTitle={'The Crow Show'}
                        showMeta={['Thursday, April 1st 5-10pm',<br />,'Saturday, April 17th 4-9pm', <br/>, <a href='https://thestudiodoor.com/the-crow-show'>Click Here for More Details</a>]}
                    />
                </Segment>
            </Grid.Column>
            <Grid.Column >
                <Segment compact>
                    <UpcomingCard
                        showImage={Gallery625}
                        showTitle={'Emerging Artists'}
                        showMeta={['April 2nd through June 1st, 2021', <br />, <a href={'https://yoloarts.org/gallery-625/'}>Click Here for More Details</a>]}
                    />
                </Segment>
            </Grid.Column>

        </Grid>
    )
}

export default Upcoming