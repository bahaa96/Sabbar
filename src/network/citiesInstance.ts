import axios from 'axios';

const citiesServiceInstance = axios.create({
  baseURL: import.meta.env.VITE_GEO_CODING_API_URL,
  timeout: 1000,
});

export default citiesServiceInstance; 