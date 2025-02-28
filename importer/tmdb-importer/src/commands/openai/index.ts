import { Command } from 'commander';

import { initiateBatchesCommand } from '$/commands/openai/subcommands/batches/initiate';
import { createBatchEmbeddingsCommand } from '$/commands/openai/subcommands/embeddings';
import { uploadFilesCommand } from '$/commands/openai/subcommands/files';

export const openaiCommands = new Command()
  .command('openai')
  .addCommand(uploadFilesCommand)
  .addCommand(createBatchEmbeddingsCommand)
  .addCommand(new Command().command('batches').addCommand(initiateBatchesCommand));
