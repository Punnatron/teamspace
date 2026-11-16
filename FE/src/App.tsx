
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import PortfolioPage from "./pages/PortfolioPage";
import ChatPage from "./pages/ChatPage";

import "./App.css";
import "./styles/responsive.css";

import Footer from "./components/layout/Footer";

function App() {
  return (
    <BrowserRouter>

      <div className="app-shell">

        <Navbar />

        <main className="app-main">

          <Routes>

            <Route
              path="/"
              element={<PortfolioPage />}
            />

            <Route
              path="/chat"
              element={<ChatPage />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </main>

        <Footer />

      </div>

    </BrowserRouter>
  );
}

export default App;
