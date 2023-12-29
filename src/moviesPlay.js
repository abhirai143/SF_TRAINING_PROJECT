import { movies, languages, countries, genres } from '../data/movies.js';
import { hindiMovies } from '../data/hindiMovies.js';
import { popular } from '../data/popular.js';
import { top_rated } from '../data/top_rated.js';
import { up_coming } from '../data/up_coming.js';
import { trending } from '../data/trending.js';




export const getCounts = () => {
  const counts = {};
  counts.movies = movies.length;
  counts.popular = popular.length;
  counts.up_coming = up_coming.length;
  counts.trending = trending.length;
  counts.top_rated = top_rated.length;
  counts.hindiMovies = hindiMovies.length;
  counts.languages = languages.length;
  counts.countries = countries.length;
  counts.genres = genres.length;

  return counts;
}

export { movies, languages, countries, genres } from '../data/movies.js';
export { hindiMovies } from '../data/hindiMovies.js';
export {popular} from '../data/popular.js';
export { top_rated } from '../data/top_rated.js';
export { up_coming } from '../data/up_coming.js';
export { trending } from '../data/trending.js';

