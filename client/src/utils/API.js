import axios from 'axios'
const baseUrl = 'https://sandycalhounart.herokuapp.com'

const API =  {
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
export default API