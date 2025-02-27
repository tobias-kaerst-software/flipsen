import { Command } from 'commander';
import { createReadStream, existsSync } from 'fs';
import PQueue from 'p-queue';
import readline from 'readline';

import type { TmdbExportType } from '$/client/general/downloadDailyExports';

import { downloadDailyExport, downloadDailyExports } from '$/client/general/downloadDailyExports';
import { getCompleteTvDetails } from '$/client/tv';

import { getMovieDetailsById } from './client/movies';

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

const program = new Command();

program
  .name('tmdb-importer-tool')
  .description('CLI to download and process TMDB data.')
  .version('0.0.0')
  .showHelpAfterError();

program
  .command('download-daily-export')
  .description('Download the daily export files from TMDB.')
  .option('--out-dir, -o <string>', 'Output directory', '.')
  .option(
    '--type, -t <collection | movie | person | production_company | tv_series>',
    'Type to download. Downloads all if not specified.',
    'all',
  )
  .action(async (options: { outDir: string; type: 'all' | TmdbExportType }) => {
    if (!existsSync(options.outDir)) {
      console.error(`Output directory ${options.outDir} does not exist.`);
      process.exit(1);
    }

    if (options.type === 'all') {
      const downloadLocations = await downloadDailyExports(options.outDir);
      console.log(`Downloaded daily export to ${JSON.stringify(downloadLocations, null, 2)}`);
      return;
    }

    const downloadLocation = await downloadDailyExport(options.outDir, options.type);
    console.log(`Downloaded daily export to ${downloadLocation}`);
  });

if (process.argv.length === 2) {
  process.argv.push('-h');
}

program.parse();
