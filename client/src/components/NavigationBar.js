import { useState, useEffect } from 'react';
import { Divider, List, Icon, Grid, Header, } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const NavigationBar = (props) => {

    const [isDesktop, setDesktop] = useState(window.innerWidth > 767);

    const updateMedia = () => {
        setDesktop(window.innerWidth > 767);
    };

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    });


    return (
        isDesktop ?
            <List size='huge' relaxed >
                <List.Item as={Link} to='/' style={{ textAlign: 'center' }}>
                    <Divider style={{ borderTop: '2px solid rgba(34,36,38,.7)', borderBottom: '2px solid rgba(255,255,255,.7)' }} />
                    <List.Header style={{ fontFamily: 'Source Sans Pro, sans-serif', letterSpacing: '5px' }} as='h1' content='Sandy' />
                    <List.Header style={{ fontFamily: 'Source Sans Pro, sans-serif' }} as='h1' content='Calhoun' />
                    <Divider style={{ borderTop: '2px solid rgba(34,36,38,.7)', borderBottom: '2px solid rgba(255,255,255,.7)' }} />
                </List.Item>
                <List.Item as={Link} to='/about'>ABOUT</List.Item>
                <Divider />
                <List.Item as={Link} to='/artworks'>ARTWORKS</List.Item>
                <Divider />
                <List.Item as={Link} to='/upcoming'>UPCOMING</List.Item>
                <Divider />
                <List.Item as={Link} to='/contact'>CONTACT</List.Item>
            </List>
            :

            <Grid columns='2' >
                <Grid.Column width='2' verticalAlign='middle' children={<Icon size='big' name='bars' onClick={() => props.dick()} />} />
                <Grid.Column width='1' />
                <Grid.Column width='12' as={props.state.shown ? null : Link} to='/' style={{ textAlign: 'center' }}>
                    <Divider style={{ borderTop: '2px solid rgba(34,36,38,.7)', borderBottom: '2px solid rgba(255,255,255,.7)' }} />
                    <Header style={{ fontFamily: 'Source Sans Pro, sans-serif', letterSpacing: '5px' }} as='h1' content='Sandy' />
                    <Header style={{ fontFamily: 'Source Sans Pro, sans-serif' }} as='h1' content='Calhoun' />
                    <Divider style={{ borderTop: '2px solid rgba(34,36,38,.7)', borderBottom: '2px solid rgba(255,255,255,.7)' }} />
                </Grid.Column>

            </Grid>
    )



}

export default NavigationBar