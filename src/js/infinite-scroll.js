'use strict';
import '../css/styles.css';
import { fetchPhotos } from './pixabay-api';
import createGalleryCards from '../gallery/gallery-card.hbs';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('.search-form');
const galleryContainerEl = document.querySelector('.gallery');
const targetEl = document.querySelector('.target-element');

let simplelightboxGallery = new SimpleLightbox('.gallery a');

let searchQuery = '';
let page = 1;

const options = {
  root: null,
  rootMargin: '500px',
  threshold: 1,
};

const observer = new IntersectionObserver(async (entries, observe) => {
  const [targetEl] = entries;

  if (targetEl.isIntersecting) {
    page += 1;

    try {
      await createPhotoGallery();

      if (page === totalPages) {
        observer.unobserve(targetEl);
      }
    } catch (err) {
      console.warn(err);
    }
  }
}, options);

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

    observer.observe(targetEl);

    if (page === 1) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
    }

    simplelightboxGallery.refresh();

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
