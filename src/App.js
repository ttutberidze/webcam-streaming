import { BrowserRouter, Route, Routes } from "react-router-dom";
import Broadcast from "./broadcast";
import Watch from "./watch";

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/" element={<Watch />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;