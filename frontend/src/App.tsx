import { AuthProvider } from '@/features/auth/AuthProvider';
import { ThemeProvider } from '@/features/theme/theme';
import { AppRouter } from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
