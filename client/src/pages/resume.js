import { useState, useEffect } from 'react';
import { Header, Divider, Grid } from 'semantic-ui-react'
import API from '../utils/API'

const Resume = () => {
    const [shows, setShows] = useState()
    const [isDesktop, setDesktop] = useState(window.innerWidth > 767);

    const updateMedia = () => {
        setDesktop(window.innerWidth > 767);
    };

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    });

    useEffect(() => {
        API.getShows().then(res => setShows(res.data))
    }, [])

    const resumeBuilder = (showType) => {
        if (showType === 'solo') {
            return (shows.map((show) => {
                if (show.soloShow) {
                    return isDesktop ? (<>
                        <Grid.Row key={show._id}>
                            <Grid.Column width={1}>
                                {show.year}
                            </Grid.Column>
                            <Grid.Column width={5}>
                                <h5>{show.title}</h5>
                            </Grid.Column>
                            <Grid.Column width={3}>{show.awards.length > 0 ? <i> {(show.awards)}</i> : null}</Grid.Column>
                            <Grid.Column width={7}>

                                <p>{show.location}</p>
                                {show.juror ? `Juror: ${show.juror}` : null}
                            </Grid.Column>

                        </Grid.Row>
                        <Divider fitted />
                    </>) :
                        (<>
                            <Grid.Row>
                                <Grid.Column width='2'  >
                                    {show.year}
                                </Grid.Column>
                                <Grid.Column width='14' >
                                    <h5>{show.title}</h5>
                                </Grid.Column>
                                <Grid.Column width='2'  ></Grid.Column>
                                <Grid.Column width='14' >

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
                    return isDesktop ?
                        (<>
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
                        </>) :
                        (<>
                            <Grid.Row>
                                <Grid.Column width='2'  >
                                    {show.year}
                                </Grid.Column>
                                <Grid.Column width='14' >
                                    <h5>{show.title}</h5>
                                </Grid.Column>
                                <Grid.Column width='2'  ></Grid.Column>
                                <Grid.Column width='14' >
                                    <p>{show.location}</p>
                                    {show.juror ? `Juror: ${show.juror} ${show.awards.length > 0 ? ` || Awards: ${show.awards[0]}` : ''}` : null}
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
    return (<>

        <Grid>
            <Grid.Row><Header as='h1'>Resume</Header></Grid.Row>
            <Divider horizontal hidden />
            <Grid.Row><Header as='h3'>Solo Shows:</Header></Grid.Row>
            {isDesktop ? <Grid.Row>
                <Grid.Column width='1'>Year</Grid.Column>
                <Grid.Column width='5'>Show Title</Grid.Column>
                <Grid.Column width='3'></Grid.Column>
                <Grid.Column width='7'>Location & Juror</Grid.Column>
            </Grid.Row> : null}
            {shows ? resumeBuilder('solo') : null}
            <Grid.Row><Header as='h3'>Group Shows:</Header></Grid.Row>
            {isDesktop ? <Grid.Row>
                <Grid.Column width='1'>Year</Grid.Column>
                <Grid.Column width='5'>Show Title</Grid.Column>
                <Grid.Column width='3'>Awards Recieved</Grid.Column>
                <Grid.Column width='7'>Location & Juror</Grid.Column>
            </Grid.Row> : null}
            {shows ? resumeBuilder() : null}
        </Grid>
    </>

    )
}

export default Resume