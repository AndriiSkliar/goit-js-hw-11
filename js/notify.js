
import { Notify } from 'notiflix/build/notiflix-notify-aio';

Notify.init({
  timeout: 1900,
});

function success(data) {
  Notify.success(`Hooray! We found ${data} images.`);
}

function invalidRequest() {
  Notify.failure("Sorry, there are no images matching your search query. Please try again.");
}

function error() {
  Notify.failure('Something went wrong. Please try again later.');
}

function noMoreResults() {
  Notify.failure(
      "We're sorry, but you've reached the end of search results.");
}

function emptyLine() {
  Notify.failure(
      'The search string cannot be empty. Please specify your search query.');
}

export { success, invalidRequest, error, noMoreResults, emptyLine };