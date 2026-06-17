"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Le cookie de session httpOnly est envoyé automatiquement via withCredentials.
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}
