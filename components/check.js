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

import("../src/moviesPlay.js").then((res) => {
  console.log("data imported into data constant");
  data = res;

  run();
});

document.addEventListener("DOMContentLoaded", function () {
    var radioButtons = document.getElementsByName("movie-filter");
    var releaseYearSelect = document.getElementById("release-year");
    var genresCheckboxes = document.querySelectorAll('input[name="genre"]');
    var genreLogicRadios = document.getElementsByName("genre-logic");
    var searchInput = document.getElementById("search-input");


    releaseYearSelect.addEventListener("change", handleFilterChange);
    searchInput.addEventListener("input", handleFilterChange);

    radioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", handleFilterChange);
    });

    genresCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", handleFilterChange);
    });

    genreLogicRadios.forEach(function (radio) {
        radio.addEventListener("change", handleFilterChange);
    });

    function handleFilterChange() {
        var selectedValue = getSelectedRadioValue("movie-filter");
        console.log(selectedValue);

        if (selectedValue === "data.movies") {
            window.changeData = data.movies.slice(0, 100);
        } else if (selectedValue === "data.hindiMovies") {
            window.changeData = data.hindiMovies;
        } else {
            window.changeData = data.movies.concat(data.hindiMovies);
        }

        var newArray = window.changeData.map((movie) => ({
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
        function updateFilteredMovies() {
            const selectedDecade = releaseYearSelect.value;
            const searchTerm = searchInput.value.toLowerCase().trim();
            const selectedGenres = getSelectedGenres();
            const genreLogic = getGenreLogic();

            if (selectedDecade !== "") {
                filteredMovies = filterMoviesByDecade(selectedDecade);
            } else {
                filteredMovies = newArray;
            }

            if (searchTerm !== "") {
                filteredMovies = filterMoviesBySearch(searchTerm, filteredMovies);
            }

            if (selectedGenres.length > 0) {
                filteredMovies = filterMoviesByGenres(selectedGenres, filteredMovies, genreLogic);
            }

            console.log(filteredMovies);
        }

        function filterMoviesBySearch(searchTerm, movies) {
            return movies.filter(
                (movie) =>
                    movie.title.toLowerCase().includes(searchTerm) ||
                    movie.cast.some(
                        (castMember) =>
                            castMember.character.toLowerCase().includes(searchTerm) ||
                            castMember.name.toLowerCase().includes(searchTerm)
                    )
            );
        }

        //event listeners to trigger filtering on input change
        document.getElementById("release-year").addEventListener("change", updateFilteredMovies);
        document.getElementById("search-input").addEventListener("input", updateFilteredMovies);

        genresCheckboxes.forEach(function (checkbox) {
            checkbox.addEventListener("change", updateFilteredMovies);
        });

        genreLogicRadios.forEach(function (radio) {
            radio.addEventListener("change", updateFilteredMovies);
        });

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

        function filterMoviesByGenres(selectedGenres, movies, logic) {
            if (selectedGenres.length === 0) {
                return movies;
            }

            return movies.filter((movie) => {
                const movieGenres = movie.genres.map((genre) => genre.toLowerCase());

                if (logic === "OR") {
                    return selectedGenres.some((selectedGenre) => movieGenres.includes(selectedGenre.toLowerCase()));
                } else {
                    return selectedGenres.every((selectedGenre) => movieGenres.includes(selectedGenre.toLowerCase()));
                }
            });
        }

        function getSelectedGenres() {
            return Array.from(genresCheckboxes)
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.value);
        }

        function getGenreLogic() {
            return Array.from(genreLogicRadios)
                .find((radio) => radio.checked)
                .value;
        }
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
