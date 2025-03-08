import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import { getTmdbChanges } from '$/features/tmdb/features/changes';
import { logger } from '$/lib/logger';

export const dailyChangesCommand = new Command()
  .command('changes')
  .description('Download the changed entries from TMDB.')
  .argument('<movie | person | tv>', 'Type to download changes.')
  .requiredOption('--out-dir, -o <string>', 'Output directory', '.')
  .requiredOption('--start-date, -s <string>', 'Start date for the export')
  .requiredOption('--end-date, -e <string>', 'End date for the export')
  .action(
    async (
      type: 'movie' | 'person' | 'tv',
      options: {
        endDate: string;
        outDir: string;
        startDate: string;
      },
    ) => {
      const outputPath = path.resolve(options.outDir);

      if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

      const { data, errors } = await getTmdbChanges(type, options.startDate, options.endDate);

      if (!data) {
        logger.error(`Failed to download daily ${type} changes`, { errors });
        return;
      }

      const outputFile = path.resolve(outputPath, `${type}-${options.startDate}-${options.endDate}.jsonl`);
      Bun.write(outputFile, data.map((obj) => JSON.stringify(obj)).join('\n') + '\n');
      logger.info(`Successfully downloaded daily ${type} changes`, { location: outputFile });
    },
  );
