import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from './context/AuthContext';
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;