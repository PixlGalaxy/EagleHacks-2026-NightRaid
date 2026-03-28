import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import ApiTest from "./pages/ApiTest";

const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/api-test" element={<ApiTest />} />
    </Routes>
  </Router>
);
export default App;