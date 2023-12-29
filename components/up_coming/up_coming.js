let data;
const personUrl = "https://api.themoviedb.org/3/person/";
const apiKey = "b68b5fe706b9897e4567450673fa925b";
const movieUrl = "https://api.themoviedb.org/3/movie/";
const imageUrl = "https://image.tmdb.org/t/p/original";
let movieIds;
let newArray;
window.changeData;
const queryString = window.location.search;
const queryParamsMap = new URLSearchParams(queryString);
console.log(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));

import("../../src/moviesPlay.js").then((res) => {
  console.log("data imported into data constant");
  data = res;
  if (queryString) {
    showHollyMovie(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));
  }

  run();
});


function run() {
    window.changeData = data.up_coming;
    newArray = window.changeData.map((movie) => ({
      id: movie.id,
      releaseDate: movie.releaseDate,
      title: movie.original_title,
    }));
  console.log(movieIds);
  getUpComingMovies();
}

async function getUpComingMovies() {
    try {
      const upComingMovies = data.up_coming.map((movie) => ({
        tmdbId: movie.id,
      }));
  
      const fetchArray = upComingMovies.map((movieId) =>
        fetch(`${movieUrl}${movieId.tmdbId}?api_key=${apiKey}`).then((response) =>
          response.json()
        )
      );
  
      const fetchResponses = await Promise.all(fetchArray);
  
      const moviesInfo = fetchResponses.map((resp) => ({
        id: resp.id,
        homePage:resp.homepage,
        overview: resp.overview,
        posterPath: resp.poster_path,
        releaseDate: resp.release_date,
        runTime: resp.runtime,
        tagLine: resp.tagline,
        title: resp.title,
      }));
  
      updateContentWithMovies(moviesInfo, "trending-content");
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  }
  
  
  function updateContentWithMovies(moviesInfo, elementId) {
    const movieHtmlArray = getMovieHtml(moviesInfo);
    document.getElementById(elementId).innerHTML = movieHtmlArray.join("");
  }
  
  // ---------get upComing movie html--------
  
  function getMovieHtml(moviesInfo) {
    return moviesInfo.map((movie) => {
      return `
        <div class="card">
          <div class="image">
            <a href=${movie.homePage}>
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
  updateContentWithMovies(moviesInfo);