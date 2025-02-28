import type { BatchCreateParams } from 'openai/resources';

import { Command } from 'commander';

import { openai } from '$/utils/clients/openai';
import { logger } from '$/utils/logger';

export const initiateBatchesCommand = new Command()
  .command('initiate')
  .description('Create a new batch')
  .argument('<download | upload>', 'Whether to download or initiate the batch')
  .requiredOption('--file-id, -i <string>', 'OpenAI File ID')
  .requiredOption('--endpoint, -e <string>', 'OpenAI Batch API endpoint')
  .action(async (options: { endpoint: BatchCreateParams['endpoint']; fileId: string }) => {
    const batch = await openai.batches.create({
      input_file_id: options.fileId,
      endpoint: options.endpoint,
      completion_window: '24h',
    });

    logger.info(`Batch created:`, batch);
  });
