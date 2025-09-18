export class MobileNetworking {
  async setup(): Promise<{ address: string; port: number; status: string }> {
    // In mobile, we simulate having a "server" for UI purposes
    // In reality, this would be WebRTC peer connections
    return {
      address: 'mobile-webrtc',
      port: 0,
      status: 'ready'
    };
  }
}