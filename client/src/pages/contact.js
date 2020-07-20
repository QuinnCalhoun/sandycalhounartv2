import React, { useState } from 'react'
import { Form, Segment, Header, Grid, Image, TextArea } from 'semantic-ui-react'
import axios from 'axios'

const Contact = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [send, setSending] = useState('Send Message')

    const emailer = ( event ) => {
        event.preventDefault()
        setSending('...Sending')
        const data = {
            name: name,
            email: email,
            subject: subject,
            message: message
        }
        axios.post('http://localhost:3001/api/contact', data)
            .then(res => {
                if (res.data.status === 'success') {
                    setSending('Message Sent')
                    setTimeout(() => {
                        resetForm()
                    }, 500) 
                }
            })
            .catch(() => {
                setSending('Error, message not sent')
            })
    }

    const resetForm = () => {
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setSending('Send Message')
    }

return (
    <>
        <Header as='h1' content='Contact' />
        <Grid columns='2' stackable >
            <Grid.Column width='6'>
                <p>
                    Please feel free to reach out with any questions regarding shows, purchases, or commissions
                    </p>
                <Segment>
                    <Form>
                        <Form.Input onChange={(e, d) => setName(d.value)} placeholder='Name' />
                        <Form.Input onChange={(e, d) => setEmail(d.value)} placeholder='Email' />
                        <Form.Input onChange={(e, d) => setSubject(d.value)} placeholder='Subject' />
                        <TextArea onChange={(e, d) => setMessage(d.value)} class='field' placeholder='Message' style={{ height: '150px' }} />
                        <Form.Button content={send} onClick={emailer} type='Submit' />
                    </Form>
                </Segment>
            </Grid.Column>
            <Grid.Column width='10'>
                <Image src={require('../assets/pics/Lookout.jpg')} attached='top' />
            </Grid.Column>

        </Grid>

    </>
)
}

export default Contact