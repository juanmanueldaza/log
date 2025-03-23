import React from "react";
import SoundBackground from "./components/SoundBackground";
import { Routes, Route } from "react-router-dom";
import { BlogList } from "./components/BlogList";
import { BlogPost } from "./components/BlogPost";

function App() {
  return (
    <>
      <SoundBackground />
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="post/:slug" element={<BlogPost />} />
      </Routes>
    </>
  );
}

export default App;