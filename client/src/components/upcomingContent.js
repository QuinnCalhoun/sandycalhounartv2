import { Card, Container } from "semantic-ui-react"

const UpcomingCard = (props) => {

    return (
        <Container text>
          <Card
            style={{width: "100%"}}
            image={<img src={props.showImage} alt={props.alt} style={{height: '275px'}} /> }
            header={props.showTitle}
            meta={<div style={{height:'50px'}}>{props.showMeta}</div>}
        />
        </Container>
    )
}

export default UpcomingCard