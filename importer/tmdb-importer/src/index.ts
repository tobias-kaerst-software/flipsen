import { createReadStream } from 'fs';
import PQueue from 'p-queue';
import readline from 'readline';

import { getCompleteTvDetails } from '$/client/tv';

import { getMovieDetailsById } from './client/movies';

// http://files.tmdb.org/p/exports/movie_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/tv_series_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/person_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/collection_ids_02_26_2025.json.gz
// http://files.tmdb.org/p/exports/production_company_ids_02_26_2025.json.gz

export const movieImporter = async () => {
  const movieId = '549509';

  const movie = await getMovieDetailsById(movieId);

  if (movie) {
    Bun.write(`output/${movieId}.json`, JSON.stringify(movie, null, 2));

    // const movieSearchPayload = transformMovieDetailsToSearchPayload(movie);

    //const movieEmbedding = await generateMovieEmbedding(movie);

    // Bun.write(
    //   `output/${movieId}.search.json`,
    //   JSON.stringify({ ...movieSearchPayload, embedding: movieEmbedding }, null, 0),
    // );
  }
};

export const tvImporter = async () => {
  const tvId = '37854';

  // const tv = await getTvDetails(tvId);
  // const tv = await getTvSeasonDetails(tvId, 1);
  // const tv = await getTvEpisodeDetails(tvId, 1, 1);

  const tv = await getCompleteTvDetails(tvId);

  if (tv) {
    Bun.write(`output/${tvId}.json`, JSON.stringify(tv, null, 2));
  }
};

export const downloadMoviesFromList = async () => {
  const queue = new PQueue({ concurrency: 40 });

  const rl = readline.createInterface({
    input: createReadStream('lists/movie_ids_02_26_2025.json'),
    crlfDelay: Infinity,
  });

  const erroredIds: string[] = [];
  let writtenFiles = 0;

  rl.on('line', (line) => {
    const json = JSON.parse(line) as { id: number };

    queue.add(async () => {
      const movie = await getMovieDetailsById(String(json.id));

      if (movie) {
        Bun.write(`output/movies/${json.id}.json`, JSON.stringify(movie, null, 2));
        writtenFiles += 1;

        if (writtenFiles % 100 === 0) {
          console.log(`Written ${writtenFiles} files`);
        }
      } else {
        erroredIds.push(String(json.id));
      }
    });
  });

  rl.on('close', () => {
    queue.onIdle().then(() => {
      Bun.write('output/errored-movies.json', JSON.stringify(erroredIds, null, 2));
    });
  });
};

export const downloadFailedMovies = async () => {
  const random_hash = String(Date.now());
  const queue = new PQueue({ concurrency: 40 });

  const ids = (await Bun.file('./output/1740675926414/errored-movies.json').json()) as string[];

  const erroredIds: string[] = [];
  const missingIds: string[] = [];

  ids.forEach((id) => {
    queue.add(async () => {
      const { data, status } = await getMovieDetailsById(String(id));

      if (status === 404) missingIds.push(String(id));
      else if (status !== 200) erroredIds.push(String(id));

      if (data) {
        Bun.write(`/home/devtobias/data/movies/${id}.json`, JSON.stringify(data, null, 2));
      }
    });
  });

  queue.onIdle().then(() => {
    Bun.write(`output/${random_hash}/errored-movies.json`, JSON.stringify(erroredIds, null, 2));
    Bun.write(`output/${random_hash}/missing-movies.json`, JSON.stringify(missingIds, null, 2));
  });
};
