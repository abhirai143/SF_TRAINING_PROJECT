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
