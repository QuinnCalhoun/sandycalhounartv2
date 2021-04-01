import { Header, Divider } from 'semantic-ui-react'
import { ArtGrid } from '../components/index'

const Art = () => {
    return (
        <>
            <Header as='h1' content='Artworks' />
            <Divider hidden />
            <ArtGrid />
        </>
    )
}

export default Art