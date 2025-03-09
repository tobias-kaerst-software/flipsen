import { Command } from 'commander';
import { createReadStream, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

import { openai } from '$/lib/clients/openai';
import { logger } from '$/lib/logger';
import { promisesWithProgress } from '$/lib/utils';

const uploadFilesCommand = new Command()
  .command('upload')
  .description('Upload multiple files to OpenAI')
  .requiredOption('--input-dir, -i <string>', 'Input directory')
  .requiredOption('--output-folder, -o <string>', 'Where to save the batch IDs')
  .action(async (options: { inputDir: string; outputDir: string }) => {
    const inputPath = path.resolve(options.inputDir);
    const outputPath = path.resolve(options.outputDir);

    if (!existsSync(inputPath)) {
      return logger.error('Input dir does not exist:', { inputPath });
    }

    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    const promises = readdirSync(inputPath).map(async (file) => {
      const stream = createReadStream(path.resolve(inputPath, file));
      return await openai.files.create({ file: stream, purpose: 'batch' });
    });

    const uploaded = await promisesWithProgress(promises);
    const fileIds = uploaded.map((file) => file.id);

    Bun.write(
      path.resolve(options.outputDir, `uploaded-files-${String(Date.now())}.json`),
      JSON.stringify(fileIds, null, 2),
    );

    logger.info('Uploaded files', { fileIds });
  });

const deleteFilesCommand = new Command()
  .command('delete')
  .description('Removes multiple files from OpenAI')
  .requiredOption('--input-file, -i <string>', 'Input file containing an array of file IDs')
  .action(async (options: { inputFile: string }) => {
    const inputPath = path.resolve(options.inputFile);

    if (!existsSync(inputPath)) {
      return logger.error('Input file does not exist:', { inputPath });
    }

    const fileIds = (await Bun.file(inputPath).json()) as string[];

    const promises = fileIds.map(async (id) => {
      return await openai.files.del(id);
    });

    const deleted = await promisesWithProgress(promises);

    logger.info('Successfully deleted files', { fileIds: deleted.map((file) => file.id) });
  });

const downloadFilesCommand = new Command()
  .command('download')
  .description('Download multiple files from OpenAI')
  .requiredOption('--input-file, -i <string>', 'Input file containing an array of file IDs')
  .requiredOption('--output-dir, -o <string>', 'Output directory')
  .action(async (options: { inputFile: string; outputDir: string }) => {
    const inputPath = path.resolve(options.inputFile);
    const outputPath = path.resolve(options.outputDir);

    if (!existsSync(inputPath)) {
      return logger.error('Input file does not exist:', { inputPath });
    }

    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    const fileIds = (await Bun.file(inputPath).json()) as string[];

    const promises = fileIds.map(async (id) => {
      const res = await openai.files.content(id);
      const content = await res.text();
      const outputFile = path.resolve(outputPath, `${id}.jsonl`);
      Bun.write(outputFile, content);
      return outputFile;
    });

    const downloaded = await promisesWithProgress(promises, 5);

    logger.info('Successfully downloaded files', { files: downloaded });
  });

export const filesCommand = new Command()
  .command('files')
  .description('OpenAI File commands')
  .addCommand(uploadFilesCommand)
  .addCommand(deleteFilesCommand)
  .addCommand(downloadFilesCommand);
