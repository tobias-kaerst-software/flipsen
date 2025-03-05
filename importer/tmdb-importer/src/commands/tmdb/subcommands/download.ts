import { Command } from 'commander';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import PQueue from 'p-queue';
import path from 'path';
import readline from 'readline';

import { getCollectionDetails } from '$/features/tmdb/features/collections';
import { getCompanyDetails } from '$/features/tmdb/features/companies';
import { getMovieDetails } from '$/features/tmdb/features/movies';
import { getPersonDetails } from '$/features/tmdb/features/person';
import { getCompleteTvDetails } from '$/features/tmdb/features/tv';

export const downloadCommand = new Command()
  .command('download')
  .description('Download all movies from given ids as json files to the output directory.')
  .argument('<movie | tv | collections | persons | companies>', 'Type of data to download from the api')
  .requiredOption('--input-file, -i <string>', 'Input file with movie ids')
  .option('--out-dir, -o <string>', 'Output directory', '.')
  .action(
    async (
      type: 'collections' | 'companies' | 'movie' | 'persons' | 'tv',
      options: { inputFile: string; outDir: string },
    ) => {
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

        if (existsSync(path.resolve(filePath, `${json.id}.json`))) {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(`Skipping ${json.id}.json file`);
          return;
        }

        queue.add(async () => {
          const downloadFunction = async () => {
            if (type === 'movie') {
              const { data, status } = await getMovieDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return data;
            }

            if (type === 'tv') {
              const { data, errors } = await getCompleteTvDetails(id);

              const has404 = errors?.some((err) => err?.status === 404);

              if (has404) missingIds.push(id);
              else if (!data) erroredIds.push(id);

              return data;
            }

            if (type === 'collections') {
              const { data, status } = await getCollectionDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return data;
            }

            if (type === 'persons') {
              const { data, status } = await getPersonDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return data;
            }

            if (type === 'companies') {
              const { data, status } = await getCompanyDetails(id);

              if (status === 404) missingIds.push(id);
              else if (status !== 200) erroredIds.push(id);

              return data;
            }

            return undefined;
          };

          const data = await downloadFunction();

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
