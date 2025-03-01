import { Command } from 'commander';
import { existsSync, readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import type { MovieDetails } from '$/features/tmdb/features/movies/schemas/transformers/MovieDetails.schema';

import { movieToBatchInput } from '$/features/tmdb/features/movies';
import { logger } from '$/utils/logger';
import { promisesWithProgress } from '$/utils/utils';

const MAX_BATCH_LINES = 20_000;

export const createBatchEmbeddingsCommand = new Command()
  .command('embeddings')
  .description('Generate a jsonl file with movie embeddings for the OpenAI Batch API.')
  .argument('<movie | tv | game>', 'Type of the embeddings to create')
  .requiredOption('--input-dir, -i <string>', 'Input dir', '.')
  .requiredOption('--output-dir, -o <string>', 'Output dir', '.')
  .action(async (type: string, options: { inputDir: string; outputDir: string }) => {
    if (!existsSync(options.inputDir)) {
      return logger.info('Input dir does not exist:', { inputDir: options.inputDir });
    }

    const hash = Math.random().toString(36).substring(7);
    const embeddings: string[] = [];

    const promises = readdirSync(options.inputDir).map(async (file) => {
      if (type === 'movie') {
        const data = await readFile(path.join(options.inputDir, file), 'utf8');
        const json = JSON.parse(data) as MovieDetails;

        const input = movieToBatchInput(json);
        const request = {
          custom_id: json.id,
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

    for (let i = 0; i < embeddings.length; i += MAX_BATCH_LINES) {
      const batch = embeddings.slice(i, i + MAX_BATCH_LINES);
      const batchFileName = path.resolve(options.outputDir, `${type}_${hash}_${fileIndex}.jsonl`);
      Bun.write(batchFileName, batch.join('\n'));
      writtenFiles.push(batchFileName);
      fileIndex++;
    }

    logger.info('Batch embeddings written:', writtenFiles);
  });
