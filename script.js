const apiKey = ''; // Zastąp wartość 'YOUR_OMDB_API_KEY' swoim kluczem API OMDB

// Pobieranie elementów z DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('type-select');
const searchYear = document.getElementById('year-input');
const resultsContainer = document.getElementById('results-container');
const paginationContainer = document.getElementById('pagination-container');
const headerMain = document.getElementById('header-main');

const advancedSearchCheckbox = document.getElementById('advanced-search-checkbox');
const advancedSearchPanel = document.getElementById('advanced-search-panel');

let searchResults = []; // Przechowuje wyniki wyszukiwania
let currentPage = 1; // Numer bieżącej strony
let totalPages = 0; // Całkowita liczba stron wyników wyszukiwania

//----------------------------------------------

// Obsługa zdarzenia przesyłania formularza wyszukiwania
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  const searchTypeValue = searchType.value;
  const searchYearValue = searchYear.value;
  if (searchTerm) {
    currentPage = 1; // Resetuj numer strony przy nowym wyszukiwaniu
    if(advancedSearchCheckbox.checked){
      searchMovies(searchTerm, searchTypeValue, searchYearValue);
    }else {
      searchMovies(searchTerm);
    }
    headerMain.classList.add('header-rolled');
  }
});

//----------------------------------------------

// Funkcja pobierająca szczegóły filmu na podstawie identyfikatora IMDB
async function getMovieDetails(imdbID) {
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`);
    const data = await response.json();

    if (data.Response === 'True') {
      displayMovieDetails(data);
    } else {
      displayMessage('Wystąpił błąd podczas pobierania informacji o filmie.');
    }
  } catch (error) {
    console.log(error);
    displayMessage('Wystąpił błąd podczas komunikacji z API.');
  }
}

// Funkcja wyświetlająca szczegóły filmu
function displayMovieDetails(movie) {
  resultsContainer.innerHTML = ''; // Wyczyść zawartość kontenera wyników
  paginationContainer.innerHTML='';

  const movieDetails = document.createElement('div');
  movieDetails.classList.add('movie-details');
  movieDetails.innerHTML = `
  <h2>${movie.Title}</h2>
  <div class="details-wrapper">
    <div class="details-left">
      <img src="${movie.Poster}" alt="${movie.Title}">
    </div>
    <div class="details-right">
      <p><strong>Year:</strong> ${movie.Year}</p>
      <p><strong>Rated:</strong> ${movie.Rated}</p>
      <p><strong>Released:</strong> ${movie.Released}</p>
      <p><strong>Runtime:</strong> ${movie.Runtime}</p>
      <p><strong>Genre:</strong> ${movie.Genre}</p>
      <p><strong>Director:</strong> ${movie.Director}</p>
      <p><strong>Writer:</strong> ${movie.Writer}</p>
      <p><strong>Actors:</strong> ${movie.Actors}</p>
      <p><strong>Plot:</strong> ${movie.Plot}</p>
      <p><strong>Language:</strong> ${movie.Language}</p>
      <p><strong>Country:</strong> ${movie.Country}</p>
      <p><strong>Awards:</strong> ${movie.Awards}</p>
      <!-- <p><strong>Ratings:</strong></p> --!>
      </div>
    </div>
  `;

  const ratingsContainer = document.createElement('ul');
  ratingsContainer.classList.add('ratings-container');

  const ratingsTitle = document.createElement('h2');
  ratingsTitle.innerHTML = '<strong>Ratings:</strong>';

  // Dodawanie elementu <p> do listy
ratingsContainer.appendChild(ratingsTitle);
  movie.Ratings.forEach(rating => {
    const ratingItem = document.createElement('li');

    if (rating.Source === "Internet Movie Database") {
      const ratingValue = parseFloat(rating.Value);
      const maxRating = 10;
      const grayCircle = '\u25CF'; // Szary kształt kółka

      // Generowanie kółek zależnie od oceny
      let ratingContent = '';
      for (let i = 1; i <= maxRating; i++) {
        const circleColor = i <= ratingValue ? 'green' : 'gray';
        ratingContent += `<span style="color: ${circleColor};">${grayCircle}</span>`;
      }

      ratingItem.innerHTML = `<strong>${rating.Source}:</strong> <span class="dots-wrapper">${ratingContent}</span>`;
    } else if (rating.Source === "Rotten Tomatoes") {
      const ratingValue = parseFloat(rating.Value);
      const percentage = ratingValue;

      // Generowanie koła z gradientem o stopniu zależnym od procentu 
      ratingItem.innerHTML = `<strong>${rating.Source}:</strong><div class="chart-wrapper"><div class="chart" style="--p:${percentage};--b:10px;--c:purple;">${percentage}%</div></div>`;

    } else if (rating.Source === "Metacritic") {
      const ratingValue = parseFloat(rating.Value);
      const maxGradientWidth = 100;

      // Generowanie paska gradientowego zależnego od oceny
      const gradientWidth = (ratingValue / 100) * maxGradientWidth;
      ratingItem.innerHTML = `<strong>${rating.Source}:</strong> <span class="gradient-bar" style="background: linear-gradient(to right, green ${gradientWidth}%, red);"></span>`;
    }

    ratingsContainer.appendChild(ratingItem);
  });
  movieDetails.appendChild(ratingsContainer);

  const backButton = document.createElement('button');
  backButton.setAttribute('id', 'back-button');
  backButton.textContent = 'Wstecz';
  backButton.addEventListener('click', goBack);
  movieDetails.appendChild(backButton);

  resultsContainer.appendChild(movieDetails);
}

// Funkcja wywołująca funkcję wyszukującą filmy przy zmianie checkboxa "Wyszukiwanie zaawansowane"
advancedSearchCheckbox.addEventListener('change', () => {
  if (advancedSearchCheckbox.checked) {
    advancedSearchPanel.style.display = 'block';
  } else {
    advancedSearchPanel.style.display = 'none';
  }
});

// Funkcja obsługująca wyszukiwanie filmów po naciśnięciu przycisku "Szukaj"
// function handleSearch(event) {
//   event.preventDefault();
//   const searchTerm = searchInput.value.trim();
//   if (searchTerm) {
//     currentPage = 1; // Resetuj numer strony przy nowym wyszukiwaniu
//     searchMovies(searchTerm);
//   }

// }

// Nasłuchiwanie zdarzenia przesyłania formularza wyszukiwania
searchForm.addEventListener('submit', handleSearch);

// Funkcja wyszukująca filmy na podstawie podanych parametrów
function searchMovies(searchTerm='', searchType='', searchYear='') {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}&type=${searchType}&y=${searchYear}&page=${currentPage}`;
  console.log(url);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Obsługa otrzymanych danych
      if (data.Response === 'True') {
        searchResults = data.Search;
        totalPages = Math.ceil(data.totalResults / 10);
        displayResults();
      } else {
        displayMessage('Brak wyników spełniających kryteria wyszukiwania.');
      }
    })
    .catch(error => {
      console.log(error);
      displayMessage('Wystąpił błąd podczas komunikacji z API.');
    });
}

// Funkcja wyświetlająca listę wyników wyszukiwania
function displayResults() {
  resultsContainer.innerHTML = ''; // Wyczyść zawartość kontenera wyników

  searchResults.forEach(result => {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.innerHTML = `
      <img src="${result.Poster}" alt="${result.Title}">
      <h3>${result.Title}</h3>
    `;
    movieItem.addEventListener('click', () => {
      getMovieDetails(result.imdbID);
    });
    resultsContainer.appendChild(movieItem);
  });

  // Dodawanie nasłuchiwania na przyciski "Szczegóły"
  // const detailsButtons = document.querySelectorAll('.details-button');
  // detailsButtons.forEach(button => {
  //   button.addEventListener('click', () => {
  //     const imdbID = button.getAttribute('data-imdb-id');
  //     getMovieDetails(imdbID);
  //   });
  // });

  displayPagination();
}

// Funkcja wyświetlająca paginację
function displayPagination() {
  paginationContainer.innerHTML = ''; // Wyczyść zawartość kontenera paginacji

  if (totalPages > 1) {
    const previousButton = document.createElement('button');
    previousButton.textContent = 'Poprzednia';
    previousButton.addEventListener('click', goToPreviousPage);
    paginationContainer.appendChild(previousButton);

    const pageNumbers = document.createElement('div');
    pageNumbers.classList.add('page-numbers');

    // Oblicz zakres stron do wyświetlenia
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 10) {
      if (currentPage <= 6) {
        endPage = 10;
      } else if (currentPage >= totalPages - 5) {
        startPage = totalPages - 9;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageNumber = document.createElement('span');
      pageNumber.textContent = i;
      if (i === currentPage) {
        pageNumber.classList.add('current-page');
      }
      pageNumber.addEventListener('click', () => goToPage(i));
      pageNumbers.appendChild(pageNumber);
    }
    paginationContainer.appendChild(pageNumbers);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Następna';
    nextButton.addEventListener('click', goToNextPage);
    paginationContainer.appendChild(nextButton);
  }
}


// Funkcja przechodzenia do poprzedniej strony
function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    searchMovies(searchInput.value.trim());
  }
}

// Funkcja przechodzenia do następnej strony
function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    searchMovies(searchInput.value.trim());
  }
}

// Funkcja przechodzenia do wybranej strony
function goToPage(pageNumber) {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    searchMovies(searchInput.value.trim());
  }
}

// Funkcja obsługująca powrót do wyników wyszukiwania po wyświetleniu szczegółów filmu
function goBack() {
  displayResults();
}

// Funkcja wyświetlająca komunikat w kontenerze wyników
function displayMessage(message) {
  resultsContainer.innerHTML = `<p class="message">${message}</p>`;
}
