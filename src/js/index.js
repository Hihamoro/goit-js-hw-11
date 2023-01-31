'use strict';
import '../css/styles.css';
import { fetchPhotos } from './pixabay-api';
import createGalleryCards from '../gallery/gallery-card.hbs';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('.search-form');
const galleryContainerEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

let simplelightboxGallery = new SimpleLightbox('.gallery a');

let searchQuery = '';
let page = 1;

async function createPhotoGallery() {
  try {
    const response = await fetchPhotos(searchQuery, page);

    let totalPages = response.totalHits / 40;

    if (response.totalHits === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    galleryContainerEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(response.hits)
    );

    if (page === 1) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
    }

    simplelightboxGallery.refresh();
    loadMoreBtnEl.classList.remove('is-hidden');

    if (page >= 2) {
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    if (page >= totalPages) {
      loadMoreBtnEl.classList.add('is-hidden');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}

function updateGallery() {
  galleryContainerEl.innerHTML = '';
  page = 1;
  loadMoreBtnEl.classList.add('is-hidden');
}

const handleSearchGalleryCards = async event => {
  event.preventDefault();

  try {
    updateGallery();
    searchQuery = event.target.searchQuery.value.trim();

    if (searchQuery === '') {
      return Notify.warning(
        'Oops, the input field is empty. Please enter search query again.'
      );
    }
    await createPhotoGallery();
  } catch (err) {
    console.warn(err);
  }
};

searchFormEl.addEventListener('submit', handleSearchGalleryCards);

const handleClickMoreCards = event => {
  try {
    page += 1;
    createPhotoGallery();
  } catch (err) {
    console.warn(err);
  }
};

loadMoreBtnEl.addEventListener('click', handleClickMoreCards);
