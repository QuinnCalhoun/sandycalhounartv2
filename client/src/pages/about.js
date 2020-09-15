import React, { useState, useEffect } from 'react'
import { Image, Container, Header, Divider, Grid, Accordion } from 'semantic-ui-react'
import API from '../utils/API'

const About = () => {

    const [shows, setShows] = useState()
    const [mobile, setMobile] = useState(false)

    useEffect(() => {
        API.getShows()
            .then(res => {
                setShows(res.data)
            })
    }, [])

    useEffect(() => {
        (window.innerWidth < 1080) ? setMobile(true) : setMobile(false)
    }, window.innerWidth)

    const resumeBuilder = (showType) => {
        if (showType === 'solo') {
            return (shows.map((show) => {
                if (show.soloShow) {
                    return (<>
                    <Grid.Row key={show._id}>
                        <Grid.Column width='1'>
                            {show.year}
                        </Grid.Column>
                        <Grid.Column width='5'>
                            <h5>{show.title}</h5>
                        </Grid.Column>
                        <Grid.Column width='3'>{show.awards.length > 0 ? <i> {(show.awards)}</i> : null}</Grid.Column>
                        <Grid.Column width='7'>
    
                            <p>{show.location}</p>
                            {show.juror ? `Juror: ${show.juror}` : null}
                        </Grid.Column>
    
                    </Grid.Row>
                    <Divider fitted />
                </>)
                } else {
                    return null
                }
                
            }))
        } else {
            return (shows.map((show) => {
                if (!show.soloShow) {
                    return (<>
                    <Grid.Row key={show._id}>
                        <Grid.Column width='1'>
                            {show.year}
                        </Grid.Column>
                        <Grid.Column width='5'>
                            <h5>{show.title}</h5>
                        </Grid.Column>
                        <Grid.Column width='3'>{show.awards.length > 0 ? <i> {(show.awards)}</i> : null}</Grid.Column>
                        <Grid.Column width='7'>
    
                            <p>{show.location}</p>
                            {show.juror ? `Juror: ${show.juror}` : null}
                        </Grid.Column>
    
                    </Grid.Row>
                    <Divider fitted />
                </>)
                } else {
                    return null
                }
                
            }))
        }
    }

    return (
        <>
            <Header as='h1'>About</Header>
            <Divider />
            <Grid columns='2' stackable >
                <Grid.Column width='6'>
                    <Image src={require('../assets/pics/BabybirdEdit.jpg')} attached='top' />

                </Grid.Column>
                <Grid.Column width='10'>
                    <Container as='p' content='Born in Vallejo, California in 1966 Sandy Calhoun spent her formative years playing in mud, roller
                    skating, and dreaming of dancing in a disco. After studying industrial and graphic design at San Francisco
                    State University for 4 years, she transferred to Chico State University to finish her education, took a
                    ceramics class to fulfill a general education requirement, and changed her major after the first day of
                    class. After receiving her BA degree, in ceramics, from Chico State, Sandy turned her attention to raising
                    a family and her art making moved to the side, though it was never completely abandoned. In 2013, she
                    decided to reacquaint herself with clay and signed up for a workshop class being led by Tony Natsoulas
                    at Alpha Fired Arts in Sacramento. In the company of wonderful artists, under the direction of Tony, she
                    has been able to develop her skills as a ceramic artist, explore her quirks and neurosis, and discover that
                    art can be weird and funny and personal. Since 2013, Sandy has been in numerous groups shows and
                    has had a solo show at the Pence Gallery in Davis.' />
                    <Accordion exclusive={false} panels={[
                        {
                            key: 'statement',
                            title: <Header as={Accordion.Title} content='Statement' />,
                            content: `Everything that I take in during my incessant people watching and relentless eavesdropping is processed through my own memories and neurotic ruminations and transformed into the final result: an artwork.
                            The essence of my work is not the subject or the medium, but the stories that are discovered that connect the piece to the viewer and to me. I don’t believe I actually create my work as much as discover it as I build.
                            Clay is the perfect material for this discovery as it allows me to experiment and explore as I construct each piece, looking for a way to balance what I know to be a true story with the story that I want to create.
                            -Sandy Calhoun`,
                        },
                        {
                            key: 'shows',
                            title: <Header as={Accordion.Title} content='Resume' />,
                            content: {
                                content: (
                                    <Grid
                                        stackable
                                        style={{ overflow: 'scroll', overflowX: 'hidden', maxHeight: '465px' }}
                                        columns='3'>
                                        <Grid.Row>
                                            <Grid.Column><Header>Solo Showings:</Header></Grid.Column>
                                        </Grid.Row>
                                        {!mobile ? <Grid.Row>
                                            <Grid.Column width='1'><b>Year</b></Grid.Column>
                                            <Grid.Column width='5'><b>Show</b></Grid.Column>
                                            <Grid.Column width='3'><b></b></Grid.Column>
                                            <Grid.Column width='7'><b>Location & Juror</b></Grid.Column>
                                        </Grid.Row> : 
                                        null}
                                        {shows ? resumeBuilder('solo') : null}
                                        <Grid.Row>
                                            <Grid.Column><Header>Group Showings:</Header></Grid.Column>
                                        </Grid.Row>
                                        {!mobile ? <Grid.Row>
                                            <Grid.Column width='1'><b>Year</b></Grid.Column>
                                            <Grid.Column width='5'><b>Show</b></Grid.Column>
                                            <Grid.Column width='3'><b>Awards</b></Grid.Column>
                                            <Grid.Column width='7'><b>Location & Juror</b></Grid.Column>
                                        </Grid.Row> : 
                                        null}

                                        {shows ? resumeBuilder('group') : null}
                                    </Grid>)
                            },
                        },
                    ]} />

                </Grid.Column>

            </Grid>
            <Divider />
        </>
    )
}

export default About