import { ThemeProvider } from '$/components/common/theme/ThemeProvider';

export const App = () => {
  return (
    <ThemeProvider>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
    </ThemeProvider>
  );
};
