import { Command } from 'commander';

import { downloadCommand } from '$/commands/tmdb/subcommands/download';
import { dailyExportsCommand } from '$/commands/tmdb/subcommands/exports';

export const tmdbCommands = new Command()
  .command('tmdb')
  .addCommand(dailyExportsCommand)
  .addCommand(downloadCommand);
