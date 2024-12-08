import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import approve from "./pages/Approve";
import addCandidate from "./pages/AddCandidate";
import voting from "./pages/Voting";
import Home from "./Home";
import EndElection from "./pages/EndElection";
import Result from "./pages/Result";
import BackButton from "./component/BackButton";

function App() {
  return (
    <div class="App">
      <p>If you change account, you need to connect it through MetaMask</p>
      <BrowserRouter>
        <BackButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/approve" Component={approve} />
          <Route path="/add" Component={addCandidate} />
          <Route path="/voting" Component={voting} />
          <Route path="/end" Component={EndElection} />
          <Route path="/result" Component={Result} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
