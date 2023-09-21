import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { throttle } from 'throttle-debounce';
import * as Notify from './js/notify'

const searchFormInput = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");

const perPage = 40;
let page = 1;
let currentValue = "";
let value = "";
let simpleLightbox = new SimpleLightbox('.gallery__link');
let perPageCounter = 0;

searchFormInput.addEventListener("submit", getCurrentValue);

function getCurrentValue(e) {
  e.preventDefault();

  value = e.currentTarget.elements[0].value.trim();
  createRequest()
}

async function createRequest() {
  if (value !== currentValue) {
    page = 1;
    currentValue = value;
    gallery.innerHTML = "";
    perPageCounter = perPage;
  } else {
    currentValue = value;
    perPageCounter += perPage;
  }

  const imageData = await sendRequest(value);
  gallery.insertAdjacentHTML("beforeend", createMarkup(imageData.hits));
  simpleLightbox.refresh();
  page += 1;

  if (imageData.hits.length < imageData.totalHits) {
    let loading = false;

    window.addEventListener('scroll', throttle(500, () => {
    if (!loading && checkIfEndOfPage()) {
      loading = true;
      showLoadMorePage(imageData);
    }
}, { noLeading: true }));
  }
}

async function sendRequest(value) {
  try {
    const BASE_URL = `https://pixabay.com/api/`;
    const API_KEY = "39534369-205412e6b12f43677745c2c2a";
    axios.defaults.baseURL = BASE_URL;
    const resp = await axios.get(`?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`)
    const totalHits = resp.data.totalHits;

    if (resp.status !== 200) {
        throw new Error()
    }

    if (!totalHits) {
      Notify.invalidRequest()
      gallery.innerHTML = "";
    } else {
      Notify.success(totalHits);
    }

    return resp.data;
  } catch (error) {
    Notify.error();
  }
}

function createMarkup(data) {
  return data
    .map(
      ({ id, webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
      `<a class="gallery__link" href="${largeImageURL}">
            <div class="gallery-item" id="${id}">
              <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
              </div>
            </div>
          </a>`
    )
    .join("");
  }

function smoothScrolling() {
const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
}

const onloadMore = (data) => {
  const totalPages = Math.ceil(data.totalHits / perPage);

  if (page >= totalPages) {
    window.removeEventListener('scroll', showLoadMorePage);
    Notify.noMoreResults()
  } else {
  createRequest();
  smoothScrolling();}
};


function checkIfEndOfPage() {
  return (
    (window.innerHeight * 2) + window.scrollY >= document.documentElement.scrollHeight
  );
}

function showLoadMorePage(data) {
  if (checkIfEndOfPage()) {
    onloadMore(data);
  }
}



