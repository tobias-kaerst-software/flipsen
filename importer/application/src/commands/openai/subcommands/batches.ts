import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import { openai } from '$/lib/clients/openai';
import { logger } from '$/lib/logger';
import { promisesWithProgress } from '$/lib/utils';

const initiateBatchCommand = new Command()
  .command('initiate')
  .description('Create a new batch job')
  .requiredOption('--input-file, -i <string>', 'File containing an array of file IDs')
  .requiredOption('--output-dir, -o <string>', 'Where to save the batch IDs')
  .action(async (options: { inputFile: string; outputDir: string }) => {
    const filePath = path.resolve(options.inputFile);
    const outputPath = path.resolve(options.outputDir);

    if (!existsSync(filePath)) {
      return logger.error('Input file does not exist:', { filePath });
    }

    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    const fileIds = (await Bun.file(filePath).json()) as string[];

    const batches = fileIds.map((fileId) => {
      return openai.batches.create({
        input_file_id: fileId,
        endpoint: '/v1/embeddings',
        completion_window: '24h',
      });
    });

    const initiated = await promisesWithProgress(batches, 10);
    const batchIds = initiated.map((batch) => batch.id);

    Bun.write(
      path.resolve(options.outputDir, `batches-${String(Date.now())}.json`),
      JSON.stringify(batchIds, null, 2),
    );

    logger.info('Batch created', { batchIds });
  });

const statusBatchCommand = new Command()
  .command('status')
  .description('Get the status of a batch job')
  .requiredOption('--input-file, -i <string>', 'File containing an array of batch IDs')
  .requiredOption('--output-dir, -o <string>', 'Where to save the resulting file ids if finished.')
  .action(async (options: { inputFile: string; outputDir: string }) => {
    const filePath = path.resolve(options.inputFile);
    const outputPath = path.resolve(options.outputDir);

    if (!existsSync(filePath)) {
      return logger.error('Input file does not exist:', { filePath });
    }

    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    const batchIds = (await Bun.file(filePath).json()) as string[];

    const batches = batchIds.map((batchId) => {
      return openai.batches.retrieve(batchId);
    });

    const initiated = await promisesWithProgress(batches, 10);

    const unfinished = initiated.filter((batch) => batch.status !== 'completed');

    if (unfinished.length > 0) {
      logger.info('There are unfinished batches', { unfinished });
      return;
    }

    const outputFileIds = initiated.map((batch) => batch.output_file_id!);

    Bun.write(
      path.resolve(options.outputDir, `batches-outputs-${String(Date.now())}.json`),
      JSON.stringify(outputFileIds, null, 2),
    );

    logger.info('Received batches output file ids', { outputFileIds });
  });

export const batchesCommand = new Command()
  .command('batches')
  .description('OpenAI Batch API commands')
  .addCommand(initiateBatchCommand)
  .addCommand(statusBatchCommand);
