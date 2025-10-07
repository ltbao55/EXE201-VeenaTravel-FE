import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { MobileOptimized } from "./components/common/MobileOptimized";

function App() {
  return (
    <MobileOptimized>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MobileOptimized>
  );
}

export default App;
