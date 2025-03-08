import { Command } from 'commander';

import { dailyChangesCommand } from '$/commands/tmdb/subcommands/changes';
import { downloadCommand } from '$/commands/tmdb/subcommands/download';
import { dailyExportsCommand } from '$/commands/tmdb/subcommands/exports';

export const tmdbCommands = new Command()
  .command('tmdb')
  .addCommand(dailyExportsCommand)
  .addCommand(dailyChangesCommand)
  .addCommand(downloadCommand);
