import axios from 'axios'

export default {
    getArt: function () {
        return axios.get("http://localhost:3001/api/art")
    },
    getArtByTitle: (title) => {
        return axios.get("http://localhost:3001/api/art/title/" + title)
    },
    getShows: () => {
        return axios.get('http://localhost:3001/api/shows')
    }
}