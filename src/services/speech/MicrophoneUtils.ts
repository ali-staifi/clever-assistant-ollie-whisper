
export async function testMicrophoneAccess(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    // If the request succeeds, the microphone is working
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop()); // Clean up after testing
    return true;
  } catch (error) {
    console.error("Erreur d'accès au microphone:", error);
    return false;
  }
}
