import { Command } from 'commander';

import { openaiCommands } from '$/commands/openai';
import { tmdbCommands } from '$/commands/tmdb';

const program = new Command();

program
  .name('tmdb-importer-tool')
  .description('CLI to download and process TMDB data.')
  .version('0.0.0')
  .addCommand(tmdbCommands)
  .addCommand(openaiCommands);

if (process.argv.length === 2) {
  process.argv.push('-h');
}

program.parse();
