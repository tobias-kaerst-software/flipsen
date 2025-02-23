import ky from 'ky';

import { env } from '$/config';

export const tmdb = ky.create({
  headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
  prefixUrl: 'https://api.themoviedb.org/3',
});
