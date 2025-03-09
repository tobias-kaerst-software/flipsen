import { Command } from 'commander';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

import type { MovieDetails } from '$/features/tmdb/features/movies/schemas/MovieDetails.schema';

import { config } from '$/config';
import { movieToBatchInput } from '$/features/tmdb/features/movies';
import { logger } from '$/lib/logger';
import { promisesWithProgress } from '$/lib/utils';

export const createBatchEmbeddingsCommand = new Command()
  .command('embeddings')
  .description('Generate a jsonl file with movie embeddings for the OpenAI Batch API.')
  .argument('<movie>', 'Type of the embeddings to create')
  .requiredOption('--input-dir, -i <string>', 'Input dir')
  .requiredOption('--output-dir, -o <string>', 'Output dir')
  .action(async (type: 'movie', options: { inputDir: string; outputDir: string }) => {
    const outputDir = path.resolve(options.outputDir);
    const inputDir = path.resolve(options.inputDir);

    if (!existsSync(inputDir)) {
      return logger.error('Input dir does not exist.', { inputDir });
    }

    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const hash = Math.random().toString(36).substring(7);
    const embeddings: string[] = [];

    const promises = readdirSync(inputDir).map(async (file) => {
      if (type === 'movie') {
        const movie = (await Bun.file(path.join(inputDir, file)).json()) as MovieDetails;
        const input = movieToBatchInput(movie);

        const request = {
          custom_id: movie.static.id,
          method: 'POST',
          url: '/v1/embeddings',
          body: { input, model: 'text-embedding-3-large', encoding_format: 'float', dimensions: 1024 },
        };

        embeddings.push(JSON.stringify(request, null, 0));
      }
    });

    await promisesWithProgress(promises, 1000);

    const writtenFiles: string[] = [];
    let fileIndex = 1;

    for (let i = 0; i < embeddings.length; i += config.openAiBatchSize) {
      const batch = embeddings.slice(i, i + config.openAiBatchSize);
      const batchFileName = path.resolve(options.outputDir, `${type}_${hash}_${fileIndex}.jsonl`);
      Bun.write(batchFileName, batch.join('\n'));
      writtenFiles.push(batchFileName);
      fileIndex++;
    }

    logger.info('Batch embeddings written', { writtenFiles });
  });
