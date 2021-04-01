import { Card, Image } from "semantic-ui-react"

const UpcomingCard = (props) => {



    return (
        <Card
            image={<img src={props.showImage} style={{height: '275px'}} /> }
            header={props.showTitle}
            meta={<div style={{height:'50px'}}>{props.showMeta}</div>}
        />
    )
}

export default UpcomingCard