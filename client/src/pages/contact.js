import { useState } from 'react';
import { Form, Segment, Header, Grid, Image, TextArea, Message } from 'semantic-ui-react'
import API from '../utils/API'
import {LookOut} from '../assets/pics/index'

const Contact = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null
    const [errorMessage, setErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateForm = () => {
        const errors = {}
        let isValid = true

        // Name validation
        if (!name.trim()) {
            errors.name = 'Name is required'
            isValid = false
        } else if (name.length > 100) {
            errors.name = 'Name must be 100 characters or less'
            isValid = false
        }

        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required'
            isValid = false
        } else if (!validateEmail(email)) {
            errors.email = 'Please enter a valid email address'
            isValid = false
        }

        // Subject validation
        if (!subject.trim()) {
            errors.subject = 'Subject is required'
            isValid = false
        } else if (subject.length > 200) {
            errors.subject = 'Subject must be 200 characters or less'
            isValid = false
        }

        // Message validation
        if (!message.trim()) {
            errors.message = 'Message is required'
            isValid = false
        } else if (message.length > 5000) {
            errors.message = 'Message must be 5000 characters or less'
            isValid = false
        }

        setFieldErrors(errors)
        return isValid
    }

    const emailer = (event) => {
        event.preventDefault()
        
        // Clear previous errors
        setSubmitStatus(null)
        setErrorMessage('')
        setFieldErrors({})

        // Validate form
        if (!validateForm()) {
            setSubmitStatus('error')
            setErrorMessage('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)
        setSubmitStatus(null)

        const data = {
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim()
        }

        API.sendMail(data)
            .then(res => {
                if (res.status === 200 && res.data.success) {
                    setSubmitStatus('success')
                    setTimeout(() => {
                        resetForm()
                    }, 3000) // Give user time to see success message
                } else {
                    setSubmitStatus('error')
                    setErrorMessage(res.data?.message || 'Failed to send message. Please try again.')
                }
            })
            .catch((err) => {
                setSubmitStatus('error')
                const errorMsg = err.response?.data?.message || 
                                err.response?.data?.error?.message ||
                                'Failed to send message. Please try again later.'
                setErrorMessage(errorMsg)
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const resetForm = () => {
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setIsSubmitting(false)
        setSubmitStatus(null)
        setErrorMessage('')
        setFieldErrors({})
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
                    {submitStatus === 'success' && (
                        <Message success>
                            <Message.Header>Message Sent Successfully!</Message.Header>
                            <p>Thank you for your message. We'll get back to you soon.</p>
                        </Message>
                    )}
                    {submitStatus === 'error' && (
                        <Message error>
                            <Message.Header>Error</Message.Header>
                            <p>{errorMessage}</p>
                        </Message>
                    )}
                    <Form onSubmit={emailer}>
                        <Form.Input 
                            required
                            label='Name'
                            onChange={(e, d) => {
                                setName(d.value)
                                if (fieldErrors.name) {
                                    setFieldErrors({...fieldErrors, name: null})
                                }
                            }} 
                            value={name} 
                            placeholder='Your name' 
                            error={fieldErrors.name ? { content: fieldErrors.name } : null}
                            disabled={isSubmitting}
                        />
                        <Form.Input 
                            required
                            type='email'
                            label='Email'
                            onChange={(e, d) => {
                                setEmail(d.value)
                                if (fieldErrors.email) {
                                    setFieldErrors({...fieldErrors, email: null})
                                }
                            }} 
                            value={email} 
                            placeholder='your.email@example.com' 
                            error={fieldErrors.email ? { content: fieldErrors.email } : null}
                            disabled={isSubmitting}
                        />
                        <Form.Input 
                            required
                            label='Subject'
                            onChange={(e, d) => {
                                setSubject(d.value)
                                if (fieldErrors.subject) {
                                    setFieldErrors({...fieldErrors, subject: null})
                                }
                            }} 
                            value={subject} 
                            placeholder='Message subject' 
                            error={fieldErrors.subject ? { content: fieldErrors.subject } : null}
                            disabled={isSubmitting}
                        />
                        <Form.Field
                            required
                            label='Message'
                            control={TextArea}
                            onChange={(e, d) => {
                                setMessage(d.value)
                                if (fieldErrors.message) {
                                    setFieldErrors({...fieldErrors, message: null})
                                }
                            }} 
                            value={message} 
                            placeholder='Your message...' 
                            style={{ height: '150px' }}
                            error={fieldErrors.message ? { content: fieldErrors.message } : null}
                            disabled={isSubmitting}
                        />
                        <Form.Button 
                            type='submit'
                            primary
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            content={isSubmitting ? 'Sending...' : 'Send Message'}
                        />
                    </Form>
                </Segment>
            </Grid.Column>
            <Grid.Column width='10'>
                <Image src={LookOut} attached='top' />
            </Grid.Column>

        </Grid>

    </>
)
}

export default Contact