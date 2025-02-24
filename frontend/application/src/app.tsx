import { Terminal } from 'lucide-react';

import { ThemeProvider } from '$/components/common/theme/ThemeProvider';
import { Alert, AlertDescription, AlertTitle } from '$/components/ui/alert';

export const App = () => {
  return (
    <ThemeProvider>
      <div className='flex h-screen items-center justify-center'>
        <div className='w-1/3'>
          <Alert>
            <Terminal className='h-4 w-4' />
            <AlertTitle>Flipsen</AlertTitle>
            <AlertDescription>Flipsen is currently work in Progress!</AlertDescription>
          </Alert>
        </div>
      </div>
    </ThemeProvider>
  );
};
