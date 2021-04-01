import {Image} from 'semantic-ui-react'
import {MoreDangerous} from '../assets/pics/index'

const Landing = () => {

    return (
        <div>
            <Image src={MoreDangerous} style={{maxHeight: '90vh'}} />
        </div>

    )
}

export default Landing