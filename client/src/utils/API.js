import axios from 'axios'

// Use local API in development, production API in production
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://sandycalhounart.herokuapp.com'
  : 'http://localhost:3001'

const API =  {
    getArt: function () {
        return axios.get(baseUrl + "/api/art")
    },
    getArtByTitle: (title) => {
        return axios.get(baseUrl + "/api/art/title/" + title)
    },
    getShows: () => {
        return axios.get(baseUrl + "/api/shows")
    },
    sendMail: (body) => {
      return axios.post(baseUrl + "/api/contact", body)
    }
}
export default API