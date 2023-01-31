'use strict';
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '33254827-c3e2a932c5595413c2f51b6ee';

export async function fetchPhotos(searchQuery, page) {
  return await axios
    .get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    )
    .then(response => response.data);
}
