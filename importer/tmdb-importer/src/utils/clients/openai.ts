import ky from 'ky';

import { env } from '$/config';

export const openai = ky.create({
  headers: { Authorization: `Bearer ${env.OPENAPI_API_KEY}` },
  prefixUrl: 'https://api.openai.com/v1/',
});
