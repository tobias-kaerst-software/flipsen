import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import type { TmdbExportType } from '$/client/general/downloadDailyExports';

import { downloadDailyExport, downloadDailyExports } from '$/client/general/downloadDailyExports';
import { logger } from '$/utils/logger';

export const dailyExportsCommand = new Command()
  .command('exports')
  .description('Download the daily export files from TMDB.')
  .option('--out-dir, -o <string>', 'Output directory', '.')
  .option(
    '--type, -t <collection | movie | person | production_company | tv_series>',
    'Type to download. Downloads all if not specified.',
    'all',
  )
  .action(async (options: { outDir: string; type: 'all' | TmdbExportType }) => {
    const outputPath = path.resolve(options.outDir);

    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    if (options.type === 'all') {
      const downloadLocations = await downloadDailyExports(options.outDir);
      logger.info('Successfully downloaded daily exports', { locations: downloadLocations });
      return;
    }

    const downloadLocation = await downloadDailyExport(options.outDir, options.type);
    logger.info(`Successfully downloaded daily ${options.type} export`, { location: downloadLocation });
  });
