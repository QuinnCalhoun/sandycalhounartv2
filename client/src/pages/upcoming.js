import {  Grid, Segment, Header } from 'semantic-ui-react'
// import UpcomingCard from '../components/upcomingContent

const Upcoming = () => {

  return (
    <Grid stackable columns={3}>
      <Grid.Row>
        <Header size='large' content={'Upcoming Shows and Exhibitions'} />
      </Grid.Row>
      <Grid.Column >
      </Grid.Column>
      <Grid.Column >
        <Segment attached='top'>
          <Header>Check back soon for upcoming shows!</Header>
        </Segment>
      </Grid.Column>
      <Grid.Column >
      </Grid.Column>

    </Grid>
  )
}

export default Upcoming