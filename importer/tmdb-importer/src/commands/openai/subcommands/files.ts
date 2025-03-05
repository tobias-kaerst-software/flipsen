import { Command } from 'commander';
import { createReadStream, existsSync, readdirSync } from 'fs';
import path from 'path';

import { openai } from '$/lib/clients/openai';
import { logger } from '$/lib/logger';
import { promisesWithProgress } from '$/lib/utils';

export const uploadFilesCommand = new Command()
  .command('files')
  .description('Upload multiple files to OpenAI')
  .requiredOption('--input-dir, -i <string>', 'Input directory')
  .action(async (options: { inputDir: string }) => {
    if (!existsSync(options.inputDir)) {
      return logger.info('Input dir does not exist:', { inputDir: options.inputDir });
    }

    const promises = readdirSync(options.inputDir).map(async (file) => {
      const stream = createReadStream(path.resolve(options.inputDir, file));
      return await openai.files.create({ file: stream, purpose: 'batch' });
    });

    const uploaded = await promisesWithProgress(promises);

    logger.info(
      'Uploaded files:',
      uploaded.map((file) => file.id),
    );
  });
