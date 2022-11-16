import { Grid, Header } from 'semantic-ui-react'
import UpcomingCard from '../components/upcomingContent'
import { Blue, TheHealingShow } from '../assets/pics'

const Upcoming = () => {

  return (
    <Grid stackable columns={3}>
      <Grid.Row>
        <Header size='large' content={'Upcoming Shows and Exhibitions'} />
      </Grid.Row>
      {/* For when nothing is upcoming */}
      {/* <UpcomingCard  showImage={Blue} showTitle={'Check back soon for upcoming shows!'}/> */}
      <UpcomingCard
        showImage={TheHealingShow}
        alt={'Healing and the Artist'}
        showTitle={"Healing and the Artist"}
        showMeta={"Opening Saturday, Nov 12, 6-9pm. \n Additional dates: Nov 19, 1 - 5 pm & Nov 26, 1 - 5 pm"} />
    </Grid>
  )
}

export default Upcoming