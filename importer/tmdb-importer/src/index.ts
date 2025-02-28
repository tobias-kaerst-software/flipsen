import { Command } from 'commander';

import { downloadCommand } from '$/commands/download';
import { openaiCommands } from '$/commands/openai';

const program = new Command();

program
  .name('tmdb-importer-tool')
  .description('CLI to download and process TMDB data.')
  .version('0.0.0')
  .addCommand(downloadCommand)
  .addCommand(openaiCommands);

if (process.argv.length === 2) {
  process.argv.push('-h');
}

program.parse();
