import { Command } from 'commander';
import { createReadStream, existsSync, mkdirSync, rmSync } from 'fs';
import PQueue from 'p-queue';
import path from 'path';
import readline from 'readline';

import { getCollectionDetails } from '$/features/tmdb/features/collections';
import { getCompanyDetails } from '$/features/tmdb/features/companies';
import { getMovieDetails } from '$/features/tmdb/features/movies';
import { getPersonDetails } from '$/features/tmdb/features/person';
import { getCompleteTvDetails } from '$/features/tmdb/features/tv';
import { logger } from '$/lib/logger';

export const downloadCommand = new Command()
  .command('download')
  .description('Download all movies from given ids as json files to the output directory.')
  .argument('<movies | tvs | collections | persons | companies>', 'Type of data to download from the api')
  .requiredOption('--input-file, -i <string>', 'Input file with movie ids')
  .option('--out-dir, -o <string>', 'Output directory', '.')
  .option('--concurrency, -c <number>', 'Number of concurrent requests', '40')
  .option('--error-dir, -e <string>', 'Output directory for error logs', '.')
  .option('--overwrite -f <boolean>', 'Overwrite existing files', false)
  .action(
    async (
      type: 'collections' | 'companies' | 'movies' | 'persons' | 'tvs',
      options: {
        concurrency: string;
        errorDir: string;
        inputFile: string;
        outDir: string;
        overwrite: boolean;
      },
    ) => {
      const filePath = path.resolve(options.outDir);
      const errorPath = path.resolve(options.errorDir, String(Date.now()));

      if (!existsSync(filePath)) mkdirSync(filePath, { recursive: true });
      if (!existsSync(errorPath)) mkdirSync(errorPath, { recursive: true });

      const queue = new PQueue({ concurrency: parseInt(options.concurrency, 10) });

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

        if (!options.overwrite && existsSync(path.resolve(filePath, `${json.id}.json`))) {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(`Skipping ${json.id}.json file`);
          return;
        }

        queue.add(async () => {
          const downloadFunction = async () => {
            if (type === 'movies') {
              const { data, status } = await getMovieDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return { data, isMissing: status === 404 };
            }

            if (type === 'tvs') {
              const { data, errors } = await getCompleteTvDetails(id);

              const has404 = errors?.some((err) => err?.status === 404);

              if (has404) missingIds.push(id);
              else if (!data) erroredIds.push(id);

              return { data, isMissing: has404 };
            }

            if (type === 'collections') {
              const { data, status } = await getCollectionDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return { data, isMissing: status === 404 };
            }

            if (type === 'persons') {
              const { data, status } = await getPersonDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return { data, isMissing: status === 404 };
            }

            if (type === 'companies') {
              const { data, status } = await getCompanyDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return { data, isMissing: status === 404 };
            }

            return { data: undefined, isMissing: false };
          };

          const { data, isMissing } = await downloadFunction();

          if (isMissing) {
            logger.info(`Entry of type ${type} with id ${id} is missing. Forcing removal of file.`);
            rmSync(path.resolve(filePath, `${json.id}.json`), { force: true });
          }

          if (!data) {
            Bun.write(
              path.resolve(errorPath, 'errored_ids.json'),
              erroredIds.map((id) => `{ "id": ${id} }`).join('\n'),
            );

            Bun.write(
              path.resolve(errorPath, 'missing_ids.json'),
              missingIds.map((id) => `{ "id": ${id} }`).join('\n'),
            );
          }

          if (data) {
            Bun.write(path.resolve(filePath, `${json.id}.json`), JSON.stringify(data, null, 2));

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`DEBUG: Processed ${writtenFiles++} files`);
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
    },
  );
