import { Command } from 'commander';

import { batchesCommand } from '$/commands/openai/subcommands/batches';
import { createBatchEmbeddingsCommand } from '$/commands/openai/subcommands/embeddings';
import { filesCommand } from '$/commands/openai/subcommands/files';

export const openaiCommands = new Command()
  .command('openai')
  .addCommand(createBatchEmbeddingsCommand)
  .addCommand(filesCommand)
  .addCommand(batchesCommand);
