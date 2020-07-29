import React, { useEffect, useState } from 'react' 
import { Image } from 'semantic-ui-react'
import API from '../utils/API'


const Upcoming = () => {
    const [ art, setArt ] = useState()

    useEffect(() => {
        API.getArt()
        .then(res => {
            setArt(res.data)
        })
    }, [])

    return (
        <>
            {art ? 
            art.map(art => {
                if (art.srcSet.w200 !== '') {
                    return (
                    <picture>
                        <source media="(max-width: 479px)" srcSet={art.srcSet.w200} />
                        <source media="(max-width: 800px)" srcSet={art.srcSet.w740} />
                        <source media="(max-width: 1080px)" srcSet={art.srcSet.w983} />
                        <source media="(max-width: 1200px)" srcSet={art.srcSet.w1182} />
                        <source media="(max-width: 1400px)" srcSet={art.srcSet.w1323} />
                        <source media="(max-width: 1600px)" srcSet={art.srcSet.w1400} />
                        <img src={art.imageUrl} alt={art.title} />
                    </picture>
                )
                }
                
            }) :
            null}
        </>
    )
}

export default Upcoming