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
  ChatEntry,
  useTracks,
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
  const [participantName, setparticipantName] = useState("aaaa");
  const [showVideo, setshowVideo] = useState(false);
  const [isCreator, setisCreator] = useState(true);
  const [room] = useState(
    () =>
      new Room({
        // Optimize video quality for each participant's screen
        adaptiveStream: true,
        // Enable automatic audio/video quality optimization
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
        publishDefaults: {
          videoEncoding: {
            maxBitrate: 1_500_000,
            maxFramerate: 30,
          },
        },
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
          Creator :{" "}
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

// function MyVideoConference() {
//   // `useTracks` returns all camera and screen share tracks. If a user
//   // joins without a published camera track, a placeholder track is returned.
//   // const tracks = useTracks(
//   //   [
//   //     { source: Track.Source.Camera, withPlaceholder: true },
//   //     { source: Track.Source.ScreenShare, withPlaceholder: false },
//   //   ],
//   //   { onlySubscribed: false }
//   // );
//   const participants = useParticipants();
//   // const { chatMessages, send, isSending } = useChat();

//   console.log("all participants ", participants);
//   return (
//     <>
//       <div style={{ color: "black" }}>
//         {`participants : ${participants.length}`}
//         {participants.map((participant) => {
//           console.log("participants ", participant);
//           return <p>{participant.identity}</p>;
//         })}
//       </div>
//       <div data-lk-theme="default" style={{ height: "100vh" }}>
//         <VideoConference>
//           {/* <Chat>
//             {chatMessages.map((msg) => (
//               <ChatEntry hideName={false} hideTimestamp={false} entry={msg} />
//             ))}
//           </Chat> */}
//         </VideoConference>

//         <ChatComponent />
//       </div>
//     </>
//   );
// }
function MyVideoConference() {
  const creator = "nameer";
  const participants = useParticipants();

  // const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const cameraTracks = tracks.filter(
    (t) =>
      t.source === Track.Source.Camera && t.participant.identity === creator
  );
  const screenShareTracks = tracks.filter(
    (t) => t.source === Track.Source.ScreenShare
  );

  // return (
  //   <div data-lk-theme="default" style={{}}>
  //     <RoomAudioRenderer />

  //     {/* Participant tiles (video) */}
  //     {participants && participants?.length > 0 && (
  //       <div style={{ flex: 1 }}>
  //         <GridLayout
  //           tracks={tracks}
  //           style={{
  //             backgroundColor: "#000",
  //           }}
  //         >
  //           <ParticipantTile />
  //         </GridLayout>
  //       </div>
  //     )}
  //     {/* Controls */}
  //     <div style={{ backgroundColor: "#111" }}>
  //       <ControlBar />
  //     </div>

  //     {/* Chat */}
  //     <div style={{ backgroundColor: "#fff", padding: "1rem", color: "black" }}>
  //       <ChatComponent />
  //     </div>
  //   </div>
  // );
  return (
    <div
      data-lk-theme="default"
      style={{ height: "100vh", position: "relative" }}
    >
      <div style={{ color: "black" }}>
        {("participants : ", participants.length)}
      </div>
      <RoomAudioRenderer />

      {screenShareTracks.length > 0 ? (
        <>
          {/* Large screen share */}
          <GridLayout
            tracks={screenShareTracks}
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#000",
            }}
          >
            <ParticipantTile />
          </GridLayout>

          {/* Small camera overlay */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: "200px",
              height: "150px",
              zIndex: 10,
              border: "2px solid white",
              backgroundColor: "black",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <GridLayout tracks={cameraTracks}>
              <ParticipantTile />
            </GridLayout>
          </div>
        </>
      ) : (
        // No screen share, show cameras in full layout
        <GridLayout
          tracks={cameraTracks}
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#000",
          }}
        >
          <ParticipantTile />
        </GridLayout>
      )}

      {/* Controls */}
      <div style={{ backgroundColor: "#111" }}>
        <ControlBar />
      </div>

      {/* Chat */}
      <div style={{ backgroundColor: "#fff", padding: "1rem", color: "black" }}>
        <ChatComponent />
      </div>
    </div>
  );
}

// function ChatComponent() {
//   const { chatMessages, send, isSending } = useChat();
//   const [msg, setmsg] = useState("");
//   console.log("chatMessages : ", chatMessages);
//   return (
//     <div style={{ color: "black" }}>
//       <h2>Chat</h2>
//       <input type="text" value={msg} onChange={(e) => setmsg(e.target.value)} />
//       <button
//         style={{ backgroundColor: "blue", color: "white" }}
//         disabled={isSending}
//         onClick={() => {
//           send(msg);
//           setmsg("");
//         }}
//       >
//         Send Message
//       </button>
//       <br />
//       <br />
//       {chatMessages.map((msg) => (
//         <div key={msg.timestamp} style={{ color: "black" }}>
//           {msg.from?.identity}: {msg.message}
//         </div>
//       ))}
//     </div>
//   );
// }

function ChatComponent() {
  const { chatMessages, send, isSending } = useChat();
  const [msg, setmsg] = useState("");

  return (
    <div>
      <h2>Chat</h2>
      <input
        type="text"
        value={msg}
        placeholder="Type your message..."
        onChange={(e) => setmsg(e.target.value)}
        style={{ width: "70%", marginRight: "10px" }}
      />
      <button
        disabled={isSending}
        onClick={() => {
          if (msg.trim()) {
            send(msg.trim());
            setmsg("");
          }
        }}
        style={{ backgroundColor: "blue", color: "white" }}
      >
        Send
      </button>

      <div style={{ marginTop: "1rem", maxHeight: "200px", overflowY: "auto" }}>
        {chatMessages?.map((entry) => (
          <div key={entry.timestamp} style={{ marginBottom: "8px" }}>
            <strong>
              {entry.from?.name || entry.from?.identity || "Unknown"}:
            </strong>{" "}
            {entry.message}
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
