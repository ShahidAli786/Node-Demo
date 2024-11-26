import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Socket interface to include user property
declare module "socket.io" {
  interface Socket {
    user?: JwtPayload | string;
  }
}

// Middleware for token verification
export const verifyToken = (
  socket: Socket,
  next: (err?: ExtendedError) => void
): void => {
  try {
    // Extract token from handshake auth or headers
    const token =
      socket.handshake.auth?.token || socket.handshake.headers["authorization"];

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.JWT_KEY as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        // Attach decoded user information to socket
        socket.user = decoded;
        next();
      }
    );
  } catch (error) {
    next(new Error("Authentication error"));
  }
};
