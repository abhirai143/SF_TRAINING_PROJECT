let data;
const personUrl = "https://api.themoviedb.org/3/person/";
const apiKey = "b68b5fe706b9897e4567450673fa925b";
const movieUrl = "https://api.themoviedb.org/3/movie/";
const imageUrl = "https://image.tmdb.org/t/p/original";

const queryString = window.location.search;
const queryParamsMap = new URLSearchParams(queryString);
console.log(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));

import("./src/moviesPlay.js").then((res) => {
  console.log("data imported into data constant");
  data = res;
  if (queryString) {
    showPerson(queryParamsMap.get("id"), queryParamsMap.get("posterPath"));
  }
});

async function showPerson(id, profilePath) {
  try {
    const response = await fetch(`${personUrl}${id}?api_key=${apiKey}`);
    const personInfo = await response.json();

    document.getElementById("name").innerHTML = personInfo.name;
    document.getElementById("birthday").innerHTML = personInfo.birthday;
    document.getElementById("deathday").innerHTML = personInfo.deathday ? personInfo.deathday : "Still Alive";
    document.getElementById("born-place").innerHTML = personInfo.place_of_birth;
    document.getElementById("biography").innerHTML = personInfo.biography;
    document.getElementById("profile-image").innerHTML = `<img src='${imageUrl}${personInfo.profile_path}' style='max-width: 100%; max-height: 400px;' />`;

  } catch (error) {
    console.error("Error fetching person details:", error);
  }
}
