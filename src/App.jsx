import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  // useTracks,
  RoomContext,
  Chat,
  VideoConference,
  useParticipants,
  useChat,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

const serverUrl = "wss://solo-9dwvrt7c.livekit.cloud";
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDY5MTQwNzcsImlzcyI6IkFQSVhvdEhaNGkzZkNWOCIsIm5iZiI6MTc0NjkwNjg3Nywic3ViIjoicXVpY2tzdGFydCB1c2VyIDdnbnp1aCIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJxdWlja3N0YXJ0IHJvb20iLCJyb29tSm9pbiI6dHJ1ZX19.2oACsUCjIcBN0gFOCaJtD088vv8YpN2BFoofzK8pRuA";
// const token =
//   "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InF1aWNrc3RhcnQtcm9vbSJ9LCJpc3MiOiJBUElYb3RIWjRpM2ZDVjgiLCJleHAiOjE3NDcwNDIxMjYsIm5iZiI6MCwic3ViIjoicXVpY2tzdGFydC11c2VybmFtZSJ9._DRAWU5Cq7SNqSX738Mh3FGvXkQub3Y-kyFkRZeFyGg";

export default function App() {
  const [token, settoken] = useState("");
  const [participantName, setparticipantName] = useState("");
  const [showVideo, setshowVideo] = useState(false);
  const [isCreator, setisCreator] = useState(false);
  const [room] = useState(
    () =>
      new Room({
        // Optimize video quality for each participant's screen
        adaptiveStream: true,
        // Enable automatic audio/video quality optimization
        dynacast: true,
      })
  );
  console.log("room : ", room);
  const getToken = async () => {
    if (participantName) {
      try {
        const res = await fetch("http://localhost:3001/getToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participantName, isCreator }),
        });

        console.log("Res 1 :", res);
        const data = await res.json();
        console.log("Res:", data.token);
        settoken(data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    }
  };

  // Connect to room
  useEffect(() => {
    let mounted = true;
    const connect = async () => {
      if (mounted && token) {
        await room
          .connect(serverUrl, token, {
            audio: true,
            video: true,
          })
          .then(() => {
            setshowVideo(true);
          })
          .catch(() => {
            setshowVideo(false);
          });
      }
    };

    connect();

    console.log("room events : ", room.eventNames);

    return () => {
      mounted = false;
      room.disconnect();
    };
  }, [room, token]);

  // useEffect(() => {
  //   getToken();
  // }, []);
  return (
    <>
      {showVideo ? (
        <RoomContext.Provider value={room} connect={true}>
          <div data-lk-theme="default" style={{ height: "100vh" }}>
            {/* Your custom component with basic video conferencing functionality. */}
            <MyVideoConference />
            {/* <VideoConference /> */}
          </div>
        </RoomContext.Provider>
      ) : (
        <>
          <input
            placeholder="Enter your name"
            type="text"
            onChange={(e) => setparticipantName(e.target.value)}
            value={participantName}
          />
          <button onClick={getToken}>Connect</button>
          <input
            type="checkbox"
            value={isCreator}
            onChange={() => setisCreator(!isCreator)}
          />
          {`${isCreator}`}
        </>
      )}
    </>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  // const tracks = useTracks(
  //   [
  //     { source: Track.Source.Camera, withPlaceholder: true },
  //     { source: Track.Source.ScreenShare, withPlaceholder: false },
  //   ],
  //   { onlySubscribed: false }
  // );
  const participants = useParticipants();
  console.log("all participants ", participants);
  return (
    <>
      <div style={{ color: "black" }}>
        {`participants : ${participants.length}`}
        {participants.map((participant) => {
          console.log("participants ", participant);
        })}
      </div>
      <div data-lk-theme="default" style={{ height: "100vh" }}>
        <VideoConference />
        <ChatComponent />
      </div>
    </>
  );
}

function ChatComponent() {
  const { chatMessages, send, isSending } = useChat();
  console.log("chatMessages : ", chatMessages);
  return (
    <div>
      {chatMessages.map((msg) => (
        <div key={msg.timestamp} style={{ color: "black" }}>
          {msg.from?.identity}: {msg.message}
        </div>
      ))}
      <button disabled={isSending} onClick={() => send("Hello!")}>
        Send Message
      </button>
    </div>
  );
}
