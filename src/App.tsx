import React from "react";
import { Routes, Route } from "react-router-dom";
import { BlogList } from "./components/BlogList";
import { BlogPost } from "./components/BlogPost";
import { NewsletterConfirm } from "./components/NewsletterConfirm";
import { NewsletterUnsubscribe } from "./components/NewsletterUnsubscribe";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/confirm/:token" element={<NewsletterConfirm />} />
      <Route path="/unsubscribe/:token" element={<NewsletterUnsubscribe />} />
      <Route path="/:slug" element={<BlogPost />} />
    </Routes>
  );
}

export default App;
