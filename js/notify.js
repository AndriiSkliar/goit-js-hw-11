
import { Notify } from 'notiflix/build/notiflix-notify-aio';

function success(data) {
  Notify.success(`Hooray! We found ${data} images.`, {
        timeout: 1900,
      });
}

function invalidRequest() {
  Notify.failure("Sorry, there are no images matching your search query. Please try again.", {
        timeout: 1900,
      });
}

function error() {
  Notify.failure('Something went wrong. Please try again later.', {
        timeout: 1900,
      });
}

function noMoreResults() {
  Notify.failure(
      "We're sorry, but you've reached the end of search results.", {
        timeout: 1900,
      });
}

function emptyLine() {
  Notify.failure(
      'The search string cannot be empty. Please specify your search query.', {
        timeout: 1900,
      });
}

export { success, invalidRequest, error, noMoreResults, emptyLine };