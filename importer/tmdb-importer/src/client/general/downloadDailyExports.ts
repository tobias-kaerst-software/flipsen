// http://files.tmdb.org/p/exports/movie_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/tv_series_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/person_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/collection_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/production_company_ids_02_26_2025.json.gz

import axios from 'axios';
import { createWriteStream } from 'fs';
import path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { createGunzip } from 'zlib';

const pipeline = promisify(stream.pipeline);

export type TmdbExportType = 'collection' | 'movie' | 'person' | 'production_company' | 'tv_series';

const getTmdbDateString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}_${day}_${year}`;
};

export const downloadDailyExports = async (output: string) => {
  const types: TmdbExportType[] = ['collection', 'movie', 'person', 'production_company', 'tv_series'];
  const downloads = types.map((type) => downloadDailyExport(output, type));
  return Promise.all(downloads);
};

export const downloadDailyExport = async (output: string, type: TmdbExportType) => {
  const filename = `${type}_ids_${getTmdbDateString()}.jsonl`;
  const outputPath = path.resolve(output, filename);

  const downloadUrl = `http://files.tmdb.org/p/exports/${filename}.gz`;

  const response = await axios.get(downloadUrl, { responseType: 'stream' });

  const unzip = createGunzip();
  const writer = createWriteStream(outputPath);

  await pipeline(response.data, unzip, writer);

  return outputPath;
};
