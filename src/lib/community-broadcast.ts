import type { Server as IoServer } from "socket.io";

export function broadcastCommunityFeedRefresh(): void {
  const io = (globalThis as { __communityIO?: IoServer }).__communityIO;
  io?.to("community").emit("feed:refresh");
}
