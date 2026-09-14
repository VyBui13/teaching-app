import { TeachingProvider } from './context/TeachingContext';
import { WorkspacePage } from './pages/WorkspacePage';

export function App() {
  return (
    <TeachingProvider>
      <WorkspacePage />
    </TeachingProvider>
  );
}

export default App;
