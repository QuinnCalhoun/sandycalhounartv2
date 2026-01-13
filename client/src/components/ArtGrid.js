import { useState, useEffect, useCallback } from 'react';
import API from '../utils/API'
import { Grid, Modal, Segment, Pagination, Icon, Container, Divider, Placeholder } from 'semantic-ui-react'

const ArtGrid = () => {

    const [art, setArt] = useState()
    const [pages, setPages] = useState()
    const [isDesktop, setDesktop] = useState(window.innerWidth > 767)
    const [currentPage, setCurrentPage] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const [imageLoadStates, setImageLoadStates] = useState({})

    const updateMedia = useCallback(() => {
        setDesktop(window.innerWidth > 767);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateMedia);
        return () => window.removeEventListener("resize", updateMedia);
    }, [updateMedia]);

    useEffect(() => {
        async function artGrabber() {
            try {
                setIsLoading(true)
                const result = await API.getArt()
                setCurrentPage(1)
                setArt(result.data)
                mobilePaginator(result.data)
            } catch (error) {
                console.error('Error fetching art:', error)
            } finally {
                setIsLoading(false)
            }
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

    const handleImageLoad = (imageId) => {
        setImageLoadStates(prev => ({ ...prev, [imageId]: true }))
    }

    const handleImageError = (imageId) => {
        setImageLoadStates(prev => ({ ...prev, [imageId]: 'error' }))
    }

    // Generate image URL - for now just return as-is, can be enhanced when S3 is set up
    const getImageUrl = (baseUrl) => {
        return baseUrl || ''
    }

    // Create placeholder component for loading state
    const ImagePlaceholder = () => (
        <Placeholder style={{ maxHeight: '300px', paddingTop: '15px', paddingBottom: '7.5px' }}>
            <Placeholder.Image rectangular />
        </Placeholder>
    )

    function cardBuilder(array) {
        return (
            array.map((data, index) => {
                const imageId = `${data.title}-${index}`
                const isImageLoaded = imageLoadStates[imageId]
                const isImageError = imageLoadStates[imageId] === 'error'
                const isFirstBatch = index < 6 // Preload first 6 images
                
                return (
                    <Modal 
                        key={data.title} 
                        dimmer='inverted' 
                        closeIcon={<Icon name='close' color='black' />} 
                        trigger={
                            <div style={{ position: 'relative', paddingTop: '15px', paddingBottom: '7.5px', minHeight: '300px' }}>
                                {!isImageLoaded && !isImageError && (
                                    <div style={{ position: 'absolute', inset: '15px 0 7.5px 0' }}>
                                        <ImagePlaceholder />
                                    </div>
                                )}
                                {!isImageError && (
                                    <img
                                        id='gridImage'
                                        alt={data.title}
                                        src={getImageUrl(data.imageUrl)}
                                        loading={isFirstBatch ? 'eager' : 'lazy'}
                                        fetchPriority={isFirstBatch ? 'high' : 'auto'}
                                        onLoad={() => handleImageLoad(imageId)}
                                        onError={() => handleImageError(imageId)}
                                        style={{
                                            maxHeight: '300px',
                                            width: '100%',
                                            objectFit: 'contain',
                                            opacity: isImageLoaded ? 1 : 0,
                                            transition: 'opacity 0.2s ease-in',
                                            position: 'relative'
                                        }}
                                    />
                                )}
                                {isImageError && (
                                    <div style={{
                                        maxHeight: '300px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#999',
                                        border: '1px solid #ddd'
                                    }}>
                                        Image failed to load
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <Modal.Header>
                            {data.title}
                        </Modal.Header>

                        <Modal.Content image>
                            <img
                                alt={data.title}
                                src={getImageUrl(data.imageUrl)}
                                loading="lazy"
                                style={{ margin: 'auto', maxWidth: '100%', height: 'auto' }}
                            />
                        </Modal.Content>
                        <Segment>
                            <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                                {data.size && data.size.height && data.size.length && data.size.width
                                    ? `${data.size.height}" H × ${data.size.length}" L × ${data.size.width}" W`
                                    : 'Size not available'}
                            </p>
                        </Segment>
                    </Modal>

                )
            }))
    }

    if (isLoading) {
        return (
            <Grid stackable columns={4} centered>
                {[...Array(8)].map((_, i) => (
                    <Grid.Column key={i}>
                        <ImagePlaceholder />
                    </Grid.Column>
                ))}
            </Grid>
        )
    }

    if (!art || art.length === 0) {
        return (
            <Container textAlign='center' style={{ padding: '40px' }}>
                <p>No artwork found.</p>
            </Container>
        )
    }

    return (
        <>
            <Grid stackable columns={4} centered>
                {art && pages ? (isDesktop ? cardBuilder(art) : cardBuilder(pages[currentPage - 1] || [])) : null}
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