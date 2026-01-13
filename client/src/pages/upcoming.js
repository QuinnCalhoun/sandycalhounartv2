import { useState, useEffect } from 'react'
import { Grid, Header, Message, Loader, Segment } from 'semantic-ui-react'
import UpcomingCard from '../components/upcomingContent'
import API from '../utils/API'

const Upcoming = () => {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUpcomingShows = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await API.getUpcomingShows()
        setShows(response.data)
      } catch (err) {
        console.error('Error fetching upcoming shows:', err)
        setError('Failed to load upcoming shows. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingShows()
  }, [])

  if (loading) {
    return (
      <Grid stackable columns={1}>
        <Grid.Row>
          <Header size='large' content={'Upcoming Shows and Exhibitions'} />
        </Grid.Row>
        <Grid.Row>
          <Segment style={{ width: '100%', minHeight: '200px' }}>
            <Loader active inline='centered' size='large'>
              Loading upcoming shows...
            </Loader>
          </Segment>
        </Grid.Row>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid stackable columns={1}>
        <Grid.Row>
          <Header size='large' content={'Upcoming Shows and Exhibitions'} />
        </Grid.Row>
        <Grid.Row>
          <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{error}</p>
          </Message>
        </Grid.Row>
      </Grid>
    )
  }

  return (
    <Grid stackable columns={1}>
      <Grid.Row>
        <Header size='large' content={'Upcoming Shows and Exhibitions'} />
      </Grid.Row>
      {shows.length === 0 ? (
        <Grid.Row>
          <Message info>
            <Message.Header>No Upcoming Shows</Message.Header>
            <p>Check back soon for upcoming shows and exhibitions!</p>
          </Message>
        </Grid.Row>
      ) : (
        shows.map((show) => (
          <Grid.Row key={show._id}>
            <UpcomingCard show={show} />
          </Grid.Row>
        ))
      )}
    </Grid>
  )
}

export default Upcoming