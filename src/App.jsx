import { meeting } from "./data/mockMeetingData";
import "./App.css";
import MediaPlayer from "./components/MediaPlayer";

function App() {
  return (
    <>
      <MediaPlayer meeting={meeting} />
    </>
  );
}

export default App;
