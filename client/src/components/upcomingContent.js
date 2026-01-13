import { Card, Container, Button, Icon } from "semantic-ui-react"

const UpcomingCard = ({ show }) => {
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatDateRange = () => {
    if (!show.startDate && !show.endDate) return ''
    const start = formatDate(show.startDate)
    const end = formatDate(show.endDate)
    
    if (start === end) return start
    return `${start} - ${end}`
  }

  const handleMapClick = (e) => {
    e.preventDefault()
    if (show.mapLink) {
      window.open(show.mapLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Container text>
      <Card
        style={{ width: "100%", marginBottom: '2rem' }}
        image={
          show.imageUrl ? (
            <img 
              src={show.imageUrl} 
              alt={show.title} 
              style={{
                height: '400px',
                objectFit: 'cover',
                width: '100%'
              }} 
            />
          ) : null
        }
        header={show.title}
        meta={
          <div style={{ padding: '0.5em 0' }}>
            {formatDateRange() && (
              <div style={{ marginBottom: '0.5em', fontWeight: 'bold', color: '#666' }}>
                {formatDateRange()}
              </div>
            )}
            {show.location && (
              <div style={{ marginBottom: '0.5em', color: '#888' }}>
                <Icon name="map marker alternate" />
                {show.location}
              </div>
            )}
            {show.address && (
              <div style={{ marginBottom: '0.5em', color: '#888', fontSize: '0.9em' }}>
                {show.address}
              </div>
            )}
          </div>
        }
        description={
          <div style={{ padding: '1em 0' }}>
            {show.description && (
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', marginBottom: '1em' }}>
                {show.description}
              </p>
            )}
            {show.mapLink && (
              <Button 
                primary 
                icon 
                labelPosition="left"
                onClick={handleMapClick}
                style={{ marginTop: '0.5em' }}
              >
                <Icon name="map" />
                Get Directions
              </Button>
            )}
          </div>
        }
      />
    </Container>
  )
}

export default UpcomingCard