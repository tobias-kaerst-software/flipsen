import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import type { TmdbExportType } from '$/features/tmdb/features/downloadDailyExports';

import { downloadDailyExport, downloadDailyExports } from '$/features/tmdb/features/downloadDailyExports';
import { logger } from '$/lib/logger';

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
      const locations = downloadLocations.map((location) => location.data).filter(Boolean);

      if (locations.length !== 0) {
        logger.info('Successfully downloaded daily exports', { locations });
      }

      return;
    }

    const { data } = await downloadDailyExport(options.outDir, options.type);

    if (data) {
      logger.info(`Successfully downloaded daily ${options.type} export`, { location: data });
    }
  });
