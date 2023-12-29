let data;
const personUrl = "https://api.themoviedb.org/3/person/";
const apiKey = "b68b5fe706b9897e4567450673fa925b";
const movieUrl = "https://api.themoviedb.org/3/movie/";
const imageUrl = "https://image.tmdb.org/t/p/original";
let movieIds;
let details;
let newArray;
let filteredMovies;
let filteredMoviesbyGenres;
window.changeData;

const queryString = window.location.search;
const queryParamsMap = new URLSearchParams(queryString);
console.log(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));

import("./src/moviesPlay.js").then((res) => {
  console.log("data imported into data constant");
  data = res;
  if (queryString) {
    showHollyMovie(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));
    
  }

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
      window.changeData = data.movies;
    } else if (selectedValue === "data.hindiMovies") {
      window.changeData = data.hindiMovies;
    } else {
      // ``;
      window.changeData = data.movies;
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
              castMember.character
                .toLowerCase()
                .includes(lowerCaseSearchTerm) ||
              castMember.name.toLowerCase().includes(lowerCaseSearchTerm)
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

      // If a search term is provided, filter by search term
      if (searchTerm.trim() !== "") {
        filteredMovies = filterMoviesBySearch(searchTerm);
      }

      console.log(filteredMovies);
    }

    // Attach event listeners to trigger filtering on input change
    document
      .getElementById("release-year")
      .addEventListener("change", updateFilteredMovies);
    document
      .getElementById("search-input")
      .addEventListener("input", updateFilteredMovies);

    // Initial call to display all movies
    updateFilteredMovies();

    function filterMoviesByDecade(selectedDecade) {
      if (selectedDecade === "") {
        // If "Any" is selected, return all movies
        return newArray;
      }

      // Extract the start year of the selected decade
      const startYear = parseInt(selectedDecade, 10);

      // Calculate the end year of the selected decade
      const endYear = startYear + 9;

      // Use filter to get movies within the selected decade
      const filteredMovies = newArray.filter((movie) => {
        const movieYear = new Date(movie.releaseDate).getFullYear();
        return movieYear >= startYear && movieYear <= endYear;
      });

      return filteredMovies;
    }

    // Example usage:
    const selectedDecade = document.getElementById("release-year").value;
    const filteredMoviesbyYear = filterMoviesByDecade(selectedDecade);
    console.log(filteredMoviesbyYear);

    // Function to filter movies by Genres
    function filterMoviesByGenres(selectedGenres) {
      if (selectedGenres === "") {
        // If "Any" is selected, return all movies
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

    // Example usage:
    const selectedGenres = document.getElementById("genres").value;
    filteredMoviesbyGenres = filterMoviesByGenres(selectedGenres);
    console.log(filteredMoviesbyGenres);

    console.log(newArray);
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

function run() {
  console.log(movieIds);
}

async function getMovieInformation() {
  // for (const obj of newArray) {
  //   const tmdbIdValue = obj.tmdbId;
  //   return fetch(`${movieUrl}${tmdbIdValue}?api_key=${apiKey}`).then((response) =>
  //     response.json()
  //   );
  // }

  const fetchArray = filteredMovies.map((movieId) => {
    return fetch(`${movieUrl}${movieId.tmdbId}?api_key=${apiKey}`).then(
      (response) => response.json()
    );
  });
  await Promise.all(fetchArray).then((fetchResponses) => {
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
    document.getElementById("trending-content").innerHTML =
      getMovieHtml(moviesInfo);
  });
}

function getMovieHtml(moviesInfo) {
  let movieHtml = '<div class="ui link cards">';

  const movieCards = moviesInfo.reduce((html, movie) => {
    return (
      html +
      `
      <div class="card">
        <div class="image">
          <a href='./movie.html?id=${movie.id}&posterPath=${movie.posterPath}'>
          <img src='${imageUrl}${movie.posterPath}' />
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

      <div class="card">

    </div>
    `
    );
  }, "");

  movieHtml += `${movieCards}</div>`;
  // console.log(movieHtml);
  return movieHtml;
}

function showHollyMovie(id, posterPath) {
  const movieInfo = data.movies.find((movie) => {
    return movie.tmdbId === id;
  });
  getCastHtml(movieInfo.cast).then((castHtml) => {
    document.getElementById("castInfo").innerHTML = castHtml;
  });

  document.getElementById("title").innerHTML = movieInfo.title;
  document.getElementById("overview").innerHTML = movieInfo.overview;
  document.getElementById(
    "moviePoster"
  ).innerHTML = `<img src='${imageUrl}${posterPath}' />`;
  if (queryString) {
    showPerson(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));
  }
}

async function getCastHtml(cast) {
  const castFetchArray = cast.map((cm) => {
    return fetch(`${personUrl}${cm.id}?api_key=${apiKey}`).then((response) =>
      response.json()
    );
  });
  const castResponses = await Promise.all(castFetchArray);

  let castHtml = '<div class="ui cards">';
  castResponses.forEach((cr) => {
    castHtml += `
      <div class="card">
        <div class="content">
        <a href="./personhtml.html?id=${cr.id}&posterPath=${cr.profile_path}">
        <img class="right floated mini ui image" src="${imageUrl}${cr.profile_path}">
      </a>
          <div class="header">
            ${cr.name}
          </div>
          <div class="meta">
            ${cr.birthday}
          </div>
        </div>
      </div>
    `;
  });
  castHtml += "</div>";

  return castHtml;
}