import React, { useState, useEffect } from 'react'
import API from '../utils/API'
import { Grid, Image, Modal, Segment, Button, Pagination, Icon, Container, Divider } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const ArtGrid = () => {

    const [art, setArt] = useState()
    const [pages, setPages] = useState()
    const [isDesktop, setDesktop] = useState(window.innerWidth > 767)
    const [currentPage, setCurrentPage] = useState()
    const [searchterm, setSearchTerm] = useState()

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    });

    const updateMedia = () => {
        setDesktop(window.innerWidth > 767);
    };

    useEffect(() => {
        async function artGrabber() {
            const result = await API.getArt()
            setCurrentPage(1)
            setArt(result.data)
            mobilePaginator(result.data)
        }
        artGrabber()
    }, [])

    const mobilePaginator = (array) => {
        let mobilePages = []
        for (let i = 0; i < Math.ceil(array.length / 10); i++) {
            mobilePages.push(array.slice((i * 10), (i + 1) * 10))
        }
        setPages(mobilePages)
    }


    const uppercaser = (string) => {
        let karko = string.substring(0, 1).toUpperCase() + string.substring(1)
        return karko
    }



    function cardBuilder(array) {
        return (
            array.map((data) => {
                return (
                    <Modal dimmer='inverted' closeIcon={<Icon name='close' color='black' />} trigger={<Image style={{ maxHeight: '300px', paddingTop: '15px', paddingBottom: '7.5px' }} id='gridImage' alt={data.title} src={data.imageUrl} />} >
                        <Modal.Header>
                            {data.title}
                            <p style={{ fontSize: '1rem' }}>
                                {(data.wallPiece === true ? '  (wall piece)' : null)}
                            </p>
                        </Modal.Header>

                        <Modal.Content image>
                            <Image style={{ margin: 'auto' }} alt={data.title} src={data.imageUrl} />
                        </Modal.Content>
                        <Segment>
                            <Grid columns='2'>
                                <Grid.Column>
                                    <p>
                                        Media: {data.media.map((media, i) => {
                                        return uppercaser((i === data.media.length - 1) ? `${media} ` : `${media}, `)
                                    })}
                                    </p>
                                    <p>
                                        Height: {data.size.height}" x Length: {data.size.length}" x Width: {data.size.width}"
                                    </p>
                                </Grid.Column>
                                <Grid.Column textAlign='right'>
                                    <p>
                                        {data.author}, {data.year}
                                    </p>
                                    <p>
                                        {(data.price ? <Button content='Inquire for purchase' as={Link} to='/contact' /> : `Unavailable for purchase`)}
                                    </p>
                                </Grid.Column>
                            </Grid>
                        </Segment>
                    </Modal>

                )
            }))
    }

    return (
        <>

            <Grid stackable columns={4} centered>
                {art && pages ? (isDesktop ? cardBuilder(art) : cardBuilder(pages[currentPage - 1])) : null}
            </Grid>
            <Divider />
            {art && !isDesktop ?
                <Container textAlign='center'>
                    <Pagination
                        activePage={currentPage}
                        totalPages={Math.ceil(art.length / 10)}
                        firstItem={null}
                        lastItem={null}
                        nextItem={null}
                        prevItem={null}
                        onPageChange={(e, data) => {
                            setCurrentPage(data.activePage)
                            setTimeout(() => {
                                window.scrollTo(0, 150)
                            }, 500)
                        }} />
                </Container> :
                null}


        </>
    )
}

export default ArtGrid