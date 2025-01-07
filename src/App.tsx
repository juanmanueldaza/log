import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BlogList } from "./components/BlogList";
import { BlogPost } from "./components/BlogPost";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/post/:slug" element={<BlogPost />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
