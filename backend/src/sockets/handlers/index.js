import registerChatHandlers from "./chat.handler.js";
import registerPresenceHandlers from "./presence.handler.js";

/**
 * Register all socket event handlers for a socket connection
 */
const registerHandlers = (io, socket) => {
  // Presence must be first (handles disconnect)
  registerPresenceHandlers(io, socket);

  // Chat handlers
  registerChatHandlers(io, socket);

  // Future handlers will be added here:
  // registerTaskHandlers(io, socket);
  // registerDocumentHandlers(io, socket);
  // registerAIHandlers(io, socket);
};

export default registerHandlers;