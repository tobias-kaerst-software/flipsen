import axios from 'axios';
import * as AxiosLogger from 'axios-logger';
import rateLimit from 'axios-rate-limit';

import { env } from '$/config';

export const tmdb = rateLimit(
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
  }),
  { maxRequests: 45, perMilliseconds: 1000 },
);

tmdb.interceptors.request.use(AxiosLogger.requestLogger);
