import { useState } from "react";
import { meeting } from "./data/mockMeetingData";
import "./App.css";
import MediaPlayer from "./components/MediaPlayer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MediaPlayer meeting={meeting} />
    </>
  );
}

export default App;
