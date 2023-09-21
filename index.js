import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { throttle } from 'throttle-debounce';
import * as Notify from './js/notify';
import { resp } from './js/api';
import { createMarkup } from './js/markup';

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

  const imageData = await sendRequest();
  gallery.insertAdjacentHTML("beforeend", createMarkup(imageData.hits));
  simpleLightbox.refresh();
  page += 1;
  addEvtListener(imageData);
}

async function sendRequest() {
  try {
    const response = await resp(value, page, perPage);
    const totalHits = response.data.totalHits;

    if (response.status !== 200) {
        throw new Error()
    }

    if (!totalHits) {
      Notify.invalidRequest()
      gallery.innerHTML = "";
    } else {
      Notify.success(totalHits);
    }

    return response.data;
  } catch (error) {
    Notify.error();
  }
}

function addEvtListener(imageData) {
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
    smoothScrolling();
  }
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



