import { Command } from 'commander';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import PQueue from 'p-queue';
import path from 'path';
import readline from 'readline';

import { getMovieDetailsById } from '$/features/tmdb/movies';
import { logger } from '$/utils/logger';

export const moviesCommand = new Command()
  .command('movies')
  .description('Download all movies from given ids as json files to the output directory.')
  .requiredOption('--input-file, -i <string>', 'Input file with movie ids')
  .option('--out-dir, -o <string>', 'Output directory', '.')
  .action(async (options: { inputFile: string; outDir: string }) => {
    const filePath = path.resolve(options.outDir, 'files');
    const errorPath = path.resolve(options.outDir, 'logs', String(Date.now()));

    if (!existsSync(filePath)) mkdirSync(filePath, { recursive: true });
    if (!existsSync(filePath)) mkdirSync(errorPath, { recursive: true });

    const queue = new PQueue({ concurrency: 40 });

    const lineReader = readline.createInterface({
      input: createReadStream(options.inputFile),
      crlfDelay: Infinity,
    });

    const erroredIds: string[] = [];
    const missingIds: string[] = [];

    let writtenFiles = 0;

    lineReader.on('line', (line) => {
      const json = JSON.parse(line) as { id: number };
      const id = String(json.id);

      queue.add(async () => {
        const { data, status } = await getMovieDetailsById(id);

        if (status === 404) missingIds.push(id);
        else if (status !== 200) erroredIds.push(id);

        if (data) {
          Bun.write(path.resolve(filePath, `${json.id}.json`), JSON.stringify(data, null, 2));
          if (writtenFiles++ % 100 === 0) logger.debug(`Written ${writtenFiles} files`);
        }
      });
    });

    lineReader.on('close', () =>
      queue.onIdle().then(() => {
        Bun.write(
          path.resolve(errorPath, 'errored_ids.json'),
          erroredIds.map((id) => `{ "id": ${id} }`).join('\n'),
        );

        Bun.write(
          path.resolve(errorPath, 'missing_ids.json'),
          missingIds.map((id) => `{ "id": ${id} }`).join('\n'),
        );
      }),
    );
  });
