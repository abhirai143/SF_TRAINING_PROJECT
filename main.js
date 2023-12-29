let data;
const personUrl = "https://api.themoviedb.org/3/person/";
const apiKey = "b68b5fe706b9897e4567450673fa925b";
const movieUrl = "https://api.themoviedb.org/3/movie/";
const imageUrl = "https://image.tmdb.org/t/p/original";
let movieIds;
let newArray;
let filteredMovies;
let filteredMoviesbyGenres;

const queryString = window.location.search;
const queryParamsMap = new URLSearchParams(queryString);
console.log(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));

import("./src/moviesPlay.js").then((res) => {
  console.log("data imported into data constant");
  data = res;

  run();
});

document.addEventListener("DOMContentLoaded", function () {
  // Get the radio buttons and add an event listener
  var radioButtons = document.getElementsByName("movie-filter");
  var releaseYearSelect = document.getElementById("release-year");
  var genresSelect = document.getElementById("genres");

  releaseYearSelect.addEventListener("change", handleFilterChange);
  genresSelect.addEventListener("change", handleFilterChange);

  radioButtons.forEach(function (radioButton) {
    radioButton.addEventListener("change", handleFilterChange);
  });

  // Function to handle radio button change
  function handleFilterChange() {
    var selectedValue = getSelectedRadioValue("movie-filter");
    console.log(selectedValue);
    if (selectedValue === "data.movies") {
      window.changeData = data.movies.slice(0, 100);
    } else if (selectedValue === "data.hindiMovies") {
      window.changeData = data.hindiMovies;
    } else {
      // ``;
      window.changeData = data.movies.concat(data.hindiMovies);
    }

    newArray = window.changeData.map((movie) => ({
      tmdbId: movie.tmdbId,
      releaseDate: movie.releaseDate,
      genres: movie.genres.map((genre) => genre.name),
      title: movie.title,
      cast: movie.cast.map((castMember) => ({
        character: castMember.character,
        name: castMember.name,
        profilePath: castMember.profilePath,
      })),
    }));


    // Function to filter movies by search input
    function filterMoviesBySearch(searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      return newArray.filter(
        (movie) =>
          movie.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          movie.cast.some(
            (castMember) =>
              castMember.character // by character name 
                .toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              castMember.name.toLowerCase().includes(lowerCaseSearchTerm)//by cast name 
          )
      );
    }

    function updateFilteredMovies() {
      const selectedDecade = document.getElementById("release-year").value;
      const searchTerm = document.getElementById("search-input").value;

      if (selectedDecade !== "") {
        // If a decade is selected, filter by decade
        filteredMovies = filterMoviesByDecade(selectedDecade);
      } else {
        // Otherwise, use all movies
        filteredMovies = newArray;
      }

      // If a search term is provided, 
      if (searchTerm.trim() !== "") {
        filteredMovies = filterMoviesBySearch(searchTerm);
      }

      console.log(filteredMovies);
    }

    //event listeners to trigger filtering on input change
    document
      .getElementById("release-year")
      .addEventListener("change", updateFilteredMovies);
    document
      .getElementById("search-input")
      .addEventListener("input", updateFilteredMovies);

    // Initial call to display all movies
    updateFilteredMovies();


    // Function to filter movies by release year decade
    function filterMoviesByDecade(selectedDecade) {
      if (selectedDecade === "") {
        // "Any" is selected, return all movies
        return newArray;
      }

      //the start year of the selected decade
      const startYear = parseInt(selectedDecade, 10);

      // the end year of the selected decade
      const endYear = startYear + 9;

      // use filter to get movies within the selected decade
      const filteredMovies = newArray.filter((movie) => {
        const movieYear = new Date(movie.releaseDate).getFullYear();
        return movieYear >= startYear && movieYear <= endYear;
      });

      return filteredMovies;
    }
    const selectedDecade = document.getElementById("release-year").value;
    const filteredMoviesbyYear = filterMoviesByDecade(selectedDecade);


    // Function to filter movies by Genres
    function filterMoviesByGenres(selectedGenres) {
      if (selectedGenres === "") {
        //"Any" is selected, return all movies
        return filteredMoviesbyYear;
      }

      // Use filter to get movies within the selected Genres
      const filteredMoviesByGenres = filteredMoviesbyYear.filter((movie) =>
        movie.genres
          .map((genre) => genre.toLowerCase())
          .includes(selectedGenres.toLowerCase())
      );
      return filteredMoviesByGenres;
    }

    const selectedGenres = document.getElementById("genres").value;
    filteredMovies = filterMoviesByGenres(selectedGenres);

  }

  // Function to get the value of the selected radio button
  function getSelectedRadioValue(name) {
    var selectedValue = null;
    var radioButtons = document.getElementsByName(name);

    radioButtons.forEach(function (radioButton) {
      if (radioButton.checked) {
        selectedValue = radioButton.value;
      }
    });

    return selectedValue;
  }
});

function run() {}

// ----------------movie card-----------------

function getMovieInformation() {
  const fetchArray = filteredMovies.map((movieId) => {
    return fetch(`${movieUrl}${movieId.tmdbId}?api_key=${apiKey}`).then(
      (response) => response.json()
    );
  });
  Promise.all(fetchArray).then((fetchResponses) => {
    const moviesInfo = fetchResponses.map((resp) => {
      return {
        id: resp.id,
        overview: resp.overview,
        posterPath: resp.poster_path,
        releaseDate: resp.release_date,
        runTime: resp.runtime,
        tagLine: resp.tagline,
        title: resp.title,
      };
    });
    console.log(moviesInfo);
    if (moviesInfo.length === 0) {
      // No movies found, display a message
      document.getElementById("content").innerHTML = "<p>No movies found.</p>";
    } else {
      // Sort movies based on the selected option in the sort-by-year dropdown
      const sortByYearOption = document.getElementById("sort-by-year").value;
      if (sortByYearOption === "newest") {
        moviesInfo.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
      } else if (sortByYearOption === "oldest") {
        moviesInfo.sort(
          (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)
        );
      }
      document.getElementById("content").innerHTML = getMovieHtml(moviesInfo);
    }
  });
}

function getMovieHtml(moviesInfo) {
  return moviesInfo.map((movie) => {
    return `
      <div class="card">
        <div class="image">
          <a href='./movie.html?id=${movie.id}&posterPath=${movie.posterPath}'>
            <img src='${imageUrl}${movie.posterPath}' alt="${movie.title}" />
          </a>
        </div>
        <div class="content">
          <div class="header">${movie.title}</div>
          <div class="meta">
            <a>${movie.releaseDate}</a>
          </div>
          <div class="description">
            ${movie.tagLine}
          </div>
        </div>
      </div>
    `;
  });
}

function updateContentWithMovies(moviesInfo) {
  const movieHtmlArray = getMovieHtml(moviesInfo);
  document.getElementById("content").innerHTML = movieHtmlArray.join("");
}

updateContentWithMovies(moviesInfo);

