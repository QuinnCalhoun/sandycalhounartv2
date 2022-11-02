import { Card } from "semantic-ui-react"

const UpcomingCard = (props) => {



    return (
        <Card
            image={<img src={props.showImage} alt={props.alt} style={{height: '275px'}} /> }
            header={props.showTitle}
            meta={<div style={{height:'50px'}}>{props.showMeta}</div>}
        />
    )
}

export default UpcomingCard