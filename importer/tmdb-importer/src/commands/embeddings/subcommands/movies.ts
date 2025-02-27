import { Command } from 'commander';
import { existsSync, readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import type { MovieDetails } from '$/features/tmdb/movies/schemas/transformers/MovieDetails.schema';

import { movieToBatchEmbeddingOperation } from '$/features/tmdb/movies';
import { logger } from '$/utils/logger';

export const movieEmbeddingsCommand = new Command()
  .command('movie')
  .description('Generate a jsonl file with movie embeddings for the OpenAI Batch API.')
  .requiredOption('--input-dir, -i <string>', 'Input dir', '.')
  .requiredOption('--output-dir, -o <string>', 'Output dir', '.')
  .action(async (options: { inputDir: string; outputDir: string }) => {
    if (!existsSync(options.inputDir)) {
      return logger.info('Input dir does not exist:', { inputDir: options.inputDir });
    }

    const outputFile = path.resolve(options.outputDir, 'movie_embeddings.jsonl');

    const embeddings: string[] = [];
    const files = readdirSync(options.inputDir);

    try {
      const promises = files.map(async (file) => {
        try {
          const data = await readFile(path.join(options.inputDir, file), 'utf8');
          const json = JSON.parse(data) as MovieDetails;
          embeddings.push(movieToBatchEmbeddingOperation(json));
        } catch (error) {
          logger.error(`Error processing ${file}:`, error as object);
        }
      });

      let progress = 0;

      promises.forEach((promise) => {
        promise.then(() => {
          progress += 1;

          if (progress % 100 === 0) {
            logger.debug(`Processed ${Math.round((progress / files.length) * 100)}% of files`);
          }
        });
      });

      await Promise.all(promises);
      Bun.write(outputFile, embeddings.join('\n'));
      logger.info('Successfully processed all files');
    } catch (error) {
      logger.error('Error reading files:', error as object);
    }
  });
