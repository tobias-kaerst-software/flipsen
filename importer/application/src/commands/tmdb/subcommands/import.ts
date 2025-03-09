import { Command } from 'commander';
import { existsSync, readdirSync } from 'fs';
import { ObjectId } from 'mongodb';
import path from 'path';

import type { MovieDetails } from '$/features/tmdb/features/movies/schemas/MovieDetails.schema';

import { movieViewFacet } from '$/features/tmdb/views/movies.view';
import { group } from '$/lib/array';
import { mongodb } from '$/lib/clients/mongodb';
import { logger } from '$/lib/logger';

export const importCommand = new Command()
  .command('import')
  .description('Imports the specified view into the matching data sources.')
  .argument('<movie>', 'Type of the view to import')
  .requiredOption('--input-dir, -i <string>', 'Input directory')
  .action(async (type: 'movie', options: { inputDir: string }) => {
    if (!existsSync(options.inputDir)) {
      return logger.error(`Input directory does not exist: ${options.inputDir}`);
    }

    if (type === 'movie') {
      const collection = mongodb.db('flipsen').collection('movies');

      const files = readdirSync(options.inputDir);
      const groups = group(files, 1000);

      let inserted = 0;

      for (const group of groups) {
        const toInsertRaw = await Promise.all(
          group.map(async (file) => {
            const movieFile = path.resolve(options.inputDir, file);

            if (!existsSync(movieFile)) {
              return { err: 'file_not_found' as const, data: undefined };
            }

            const movie = (await Bun.file(movieFile).json()) as MovieDetails;

            const _id = new ObjectId();
            const payload = movieViewFacet.generateItem(movie);
            const state = movieViewFacet.generateState(_id.toString(), payload);

            return { data: { _id, ...payload }, state, err: undefined };
          }),
        );

        if (toInsertRaw.some((obj) => obj.err)) {
          logger.error('Failed to insert some movies', { files: toInsertRaw.filter((obj) => obj.err) });
          return;
        }

        const toInsert = toInsertRaw.map((obj) => obj.data!);

        const res = await collection.insertMany(toInsert).catch((err) => {
          logger.error('Failed to insert movies', { err });
        });

        inserted += res?.insertedCount ?? 0;

        const percent = Math.round((inserted / files.length) * 100);
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`DEBUG: Processing at ${percent}%`);
      }

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      logger.info(`Inserted ${inserted} movies to database`);
    }

    await mongodb.close();
  });
