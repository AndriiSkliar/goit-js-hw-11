import axios from "axios";

const BASE_URL = `https://pixabay.com/api/`;
const API_KEY = "39534369-205412e6b12f43677745c2c2a";
axios.defaults.baseURL = BASE_URL;

async function resp(value, page, perPage) {
  return await axios.get(`?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`)
}

export { resp }