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
let perPageCounter = 0;
let scrollEventListenerAdded = false;
let totalPages = 1;
let simpleLightbox = new SimpleLightbox('.gallery__link', {
    captionsData: "alt",
    captionDelay: 250,
});

searchFormInput.addEventListener("submit", getCurrentValue);

// Функция для обработки события submit
function getCurrentValue(e) {
  e.preventDefault();

  value = e.currentTarget.elements[0].value.trim();
  if (value === '') {
    Notify.emptyLine();
  } else {
    createRequest();
  }
}

// Функция для создания запроса
async function createRequest() {
  if (value !== currentValue) {
    resetGallery();
  } else {
    currentValue = value;
    perPageCounter += perPage;
  }

  if (page >= totalPages + 1) {
    removeScrollEventListener();
    Notify.noMoreResults();
    return
  }

  const imageData = await sendRequest();

  gallery.insertAdjacentHTML("beforeend", createMarkup(imageData.hits));
  simpleLightbox.refresh();
  page += 1;
  addEvtListener(imageData);
}

// Функция для отправки запроса
async function sendRequest() {
  try {
    const response = await resp(value, page, perPage);
    const totalHits = response.data.totalHits;
    totalPages = Math.ceil(totalHits / perPage);

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

// Функция для добавления обработчика скролла
function addEvtListener(imageData) {
  if (imageData.hits.length < imageData.totalHits) {
    if (!scrollEventListenerAdded) {
      scrollEventListenerAdded  = true;
      window.addEventListener('scroll', throttle(500, showLoadMorePage, { noLeading: true }))
    } else {
    showLoadMorePage()}
  }
}

// Функция для плавной прокрутки
function smoothScrolling() {
const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
}

// Функция для проверки достижения конца страницы
function checkIfEndOfPage() {
  return (
    (window.innerHeight * 2) + window.scrollY >= document.documentElement.scrollHeight
  );
}

// Функция для обработки скролла и создания запроса
function showLoadMorePage() {
  if (checkIfEndOfPage()) {
    createRequest();
    smoothScrolling();
  }
}

// Функция для сброса галереи
function resetGallery() {
  page = 1;
  currentValue = value;
  gallery.innerHTML = '';
  perPageCounter = perPage;
}

// Функция для удаления обработчика скролла
function removeScrollEventListener() {
  window.removeEventListener('scroll', showLoadMorePage);
  scrollEventListenerAdded = false;
}