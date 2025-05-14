import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  RoomContext,
  useParticipants,
  useChat,
  useTracks,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";

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
        adaptiveStream: true,
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
        const data = await res.json();
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

  return (
    <>
      {showVideo ? (
        <RoomContext.Provider value={room} connect={true}>
          <div data-lk-theme="default" className="w-full">
            <MyVideoConference />
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
  return (
    <div
      data-lk-theme="default"
      className="relative max-h-[70vh] flex flex-wrap lg:flex-nowrap  gap-2 w-screen "
    >
      {/* <div style={{ color: "black" }}>
        {("participants : ", participants.length)}
      </div> */}
      <div className="flex-[1] lg:flex-[3] flex flex-col relative min-h-[70vh]">
        <div className="absolute top-[10px] left-[10px] z-[99] flex rounded-md bg-darkGray opacity-85 text-white py-[5px] px-[10px] gap-[5px] items-center">
          <FaUserAlt color="#eda803" />
          <p className="text-[14px] font-bold">{participants?.length}</p>
        </div>
        <RoomAudioRenderer />

        {screenShareTracks.length > 0 ? (
          <>
            {/* Large screen share */}
            <GridLayout
              tracks={screenShareTracks}
              style={{
                backgroundColor: "#142028",
              }}
            >
              <ParticipantTile />
            </GridLayout>

            {/* Small camera overlay */}
            <div
              // style={{
              //   position: "absolute",
              //   top: 10,
              //   right: 10,
              //   width: "200px",
              //   height: "150px",
              //   zIndex: 10,
              //   border: "2px solid #eda803",
              //   backgroundColor: "#142028",
              //   borderRadius: "8px",
              //   overflow: "hidden",
              // }}
              className="overflow-hidden rounded-md border-2 border-[#eda803] z-10 hidden sm:block h-[50px] sm:h-[150px] w-[50px] sm:w-[200px] absolute right-[10px] top-[10px]"
            >
              <GridLayout
                style={{
                  backgroundColor: "#142028",
                }}
                tracks={cameraTracks}
              >
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
              backgroundColor: "#142028",
            }}
          >
            <ParticipantTile />
          </GridLayout>
        )}

        {/* Controls */}
        <div className="bg-baseColor">
          <ControlBar />
        </div>
      </div>

      {/* Chat */}
      <div className="md:flex-[1] w-full  md:min-w-[300px]">
        <ChatComponent />
      </div>
    </div>
  );
}

function ChatComponent() {
  const creator = "nameer";

  const { chatMessages, send, isSending } = useChat();
  const [msg, setmsg] = useState("");

  return (
    <div className="rounded-md text-white bg-baseColor bg-opacity-75 backdrop-blur-3xl flex flex-col gap-2">
      <div className="flex font-bold text-[20px]  p-[10px] bg-darkGray">
        Live Chat
      </div>
      <div className="flex flex-col gap-2 p-[15px] h-[53vh] overflow-auto">
        {chatMessages?.map((entry, index) => (
          <div key={index} className="flex w-full">
            <div className="flex flex-col bg-lightGray min-w-[280px] max-w-[400px] rounded-md px-[15px] pt-[10px] pb-[25px] relative">
              <p className="font-bold text-[18px] text-yellow2">
                {entry.from?.name || entry.from?.identity || "Unknown"}{" "}
                {(entry.from?.name || entry.from?.identity) === creator && (
                  <span className="text-[14px] text-white">(Creator)</span>
                )}
              </p>
              <p className="text-[16px] break-words overflow-wrap break-word whitespace-pre-wrap">
                {entry.message}
              </p>
              <p className="text-[12px] absolute bottom-[2px] right-[5px] text-disableTextColor">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 px-[15px] py-[15px]">
        <input
          type="text"
          value={msg}
          placeholder="Type your message..."
          onChange={(e) => setmsg(e.target.value)}
          className="w-full bg-darkGray rounded-md p-[10px] outline-none color-white"
        />
        <button
          disabled={isSending}
          onClick={() => {
            if (msg.trim()) {
              send(msg.trim());
              setmsg("");
            }
          }}
          className="flex items-center justify-center w-[50px] h-[50px] cursor-pointer rounded-md outline-none bg-darkGray"
        >
          <IoIosSend color="#eda803" size={24} />
        </button>
      </div>
    </div>
  );
}
