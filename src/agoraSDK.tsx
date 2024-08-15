import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

const APP_ID = 'b8a2706939fd468b958ad552a1aa3ff5';
const TOKEN = '007eJxTYFgrPyFMe0qH5ZotJtkPrnP7/79813VrhJt8wbt/p4q2Vk1WYEiySDQyNzCzNLZMSzExs0iyNLVITDE1NUo0TEw0Tksz9Tu5J60hkJGh+tFbZkYGCATxWRhKUotLGBgAxK4iAQ==';

const VideoCall: React.FC = () => {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<IRemoteAudioTrack | null>(null);
  const [change, setChange] = useState('test')

  useEffect(() => {
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
        if (remoteVideoRef.current) {
          remoteVideoTrack.play(remoteVideoRef.current);
        }
      }
      if (mediaType === 'audio') {
        const audioTrack = user.audioTrack as IRemoteAudioTrack;
        audioTrack.play();
        setRemoteAudioTrack(audioTrack);
      }
    });

    return () => {
      handleLeave();
    };
  }, [client]);

  const handleJoin = async () => {
    try {
      console.log('client', client)
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      console.log('videoTrack', videoTrack)

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      await client.join(APP_ID, change, TOKEN || null);

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel', error);
    }
  };

  const handleLeave = async () => {
    try {
      localAudioTrack?.close();
      localVideoTrack?.close();
      await client.leave();
      setIsJoined(false);
    } catch (error) {
      console.error('Failed to leave channel', error);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!localAudioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!localVideoTrack.enabled);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    if (remoteAudioTrack) {
      remoteAudioTrack.setVolume(newVolume);
    }
  };

  return (
    <div>
      <h1>Agora Video Call</h1>
    
      <div ref={localVideoRef} style={{ width: '420px', height: '500px', backgroundColor: '#000' }} />
      <div ref={remoteVideoRef} style={{ width: '150px', height: '150px', backgroundColor: '#000'  }} />
  
     

      <div>
        {isJoined ? (
          <>
            <button onClick={toggleAudio}>Toggle Audio</button>
            <button onClick={toggleVideo}>Toggle Video</button>
            <button onClick={handleLeave}>Leave Call</button>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              onChange={handleVolumeChange}
            />
          </>
        ) : (
          <button onClick={handleJoin}>Join Call</button>
        )}
      </div>
      <input type='text' onChange={(e) => setChange(e.target.value)} />
    </div>
  );
};

export default VideoCall;