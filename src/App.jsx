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
import { useEffect, useRef, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";

const serverUrl = "wss://solo-9dwvrt7c.livekit.cloud";

export default function App() {
  const [token, settoken] = useState("");
  const [participantName, setparticipantName] = useState("nameer");
  const [showVideo, setshowVideo] = useState(false);
  const [isCreator, setisCreator] = useState(true);
  const [isJoining, setisJoining] = useState(false);
  const creator = "nameer";

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
        setisJoining(true);
        const res = await fetch("http://localhost:3001/getToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantName,
            isCreator,
            roomName: "testingroom",
          }),
        });
        const data = await res.json();
        settoken(data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
        setisJoining(false);
      }
    }
  };

  // Connect to room
  useEffect(() => {
    let mounted = true;
    const connect = async () => {
      try {
        setisJoining(true);
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
        setisJoining(false);
      } catch (error) {
        console.log("Connect() error: ", error);
        setisJoining(false);
      }
    };

    connect();
    room.on("disconnected", (reason) => {
      console.log("disconnected event listener : ", reason);
      room.disconnect();
      settoken("");
      setshowVideo(false);
    });
    room.on("participantDisconnected", (participant) => {
      console.log("participant disconnected : ", participant);
      if (participant.identity === creator) {
        console.log("DESTROY");
        room.disconnect();
        settoken("");
        setshowVideo(false);
      }
    });

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
            <MyVideoConference participantName={participantName} />
          </div>
        </RoomContext.Provider>
      ) : (
        <>
          <div className="flex bg-baseColor rounded-md items-center justify-center w-full h-[70vh]">
            <div
              onClick={getToken}
              className="py-[10px] px-[40px] cursor-pointer rounded-md bg-yellow2 text-black font-bold"
            >
              {isJoining ? "Joining..." : "Join livestreaming"}
            </div>
          </div>
          <input
            placeholder="Enter your name"
            type="text"
            onChange={(e) => setparticipantName(e.target.value)}
            value={participantName}
          />
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

function MyVideoConference({ participantName }) {
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

  const [showCameraWhileScreenShare, setshowCameraWhileScreenShare] =
    useState(true);
  return (
    <div
      data-lk-theme="default"
      className="relative max-h-[70vh] flex flex-wrap lg:flex-nowrap  gap-2 w-full "
    >
      <div className="flex-[1] lg:flex-[3] flex flex-col relative min-h-[70vh] rounded-md">
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

            {!showCameraWhileScreenShare ? (
              <abbr title="Show camera view">
                <div
                  onClick={() => {
                    setshowCameraWhileScreenShare(!showCameraWhileScreenShare);
                  }}
                  className="flex opacity-85 items-center gap-[3px] justify-center absolute top-[10px] right-[10px] cursor-pointer z-20 w-[70px] h-[30px] bg-lightGray text-white rounded-full"
                >
                  <FaUserAlt color="#fff" />
                  <AiOutlineFullscreen color="#eda803" size={24} />
                </div>
              </abbr>
            ) : (
              <div className=" rounded-md border-2 border-[#eda803] z-10 hidden sm:block h-[50px] sm:h-[150px] w-[50px] sm:w-[200px] absolute right-[10px] top-[10px]">
                <abbr title="Hide camera view">
                  <div
                    onClick={() => {
                      setshowCameraWhileScreenShare(
                        !showCameraWhileScreenShare
                      );
                    }}
                    className="flex items-center justify-center absolute -top-[10px] -left-[10px] cursor-pointer z-20 w-[30px] h-[30px] bg-lightGray text-white rounded-full"
                  >
                    <AiOutlineFullscreenExit color="#eda803" size={24} />
                  </div>
                </abbr>

                <GridLayout
                  style={{
                    backgroundColor: "#142028",
                  }}
                  tracks={cameraTracks}
                >
                  <ParticipantTile />
                </GridLayout>
              </div>
            )}
            {/* Small camera overlay */}
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
        <div className="bg-baseColor rounded-b-md">
          <ControlBar />
        </div>
      </div>

      {/* Chat */}
      <div className="md:flex-[1] w-full  md:min-w-[300px]">
        <ChatComponent participantName={participantName} />
      </div>
    </div>
  );
}

function ChatComponent({ participantName }) {
  const creator = "nameer";

  const { chatMessages, send, isSending } = useChat();
  const [msg, setmsg] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);
  return (
    <div className="rounded-md text-white bg-baseColor bg-opacity-75 backdrop-blur-3xl flex flex-col gap-2">
      <div className="flex font-bold text-[20px]  p-[10px] bg-darkGray">
        Live Chat
      </div>
      <div className="flex flex-col gap-2 p-[15px] h-[53vh] overflow-auto custom-scrollbar">
        {chatMessages?.map((entry, index) => (
          <div
            key={index}
            className={`flex w-full ${
              participantName === (entry.from.name || entry.from?.identity) &&
              "justify-end"
            }`}
          >
            <div
              className={`flex flex-col ${
                participantName === (entry.from.name || entry.from?.identity)
                  ? "bg-lightGray"
                  : "bg-lightGray"
              }  min-w-[200px] max-w-[400px] rounded-md px-[10px] pt-[5px] pb-[25px] relative`}
            >
              <p className="font-medium text-[16px] text-yellow2">
                {entry.from?.name || entry.from?.identity || "Unknown"}{" "}
                {(entry.from?.name || entry.from?.identity) === creator && (
                  <span className="text-[12px] text-white">(Creator)</span>
                )}
              </p>
              <p className="text-[14px] break-words overflow-wrap break-word whitespace-pre-wrap">
                {entry.message}
              </p>
              <p className="text-[12px] absolute bottom-[2px] right-[5px] text-disableTextColor">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
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
