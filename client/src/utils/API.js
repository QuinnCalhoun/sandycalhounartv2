import axios from 'axios'
const baseUrl = 'http://www.sandycalhoun.com'
export default {
    getArt: function () {
        return axios.get(baseUrl + "/api/art")
    },
    getArtByTitle: (title) => {
        return axios.get(baseUrl + "/api/art/title/" + title)
    },
    getShows: () => {
        return axios.get(baseUrl + "/api/shows")
    }
}