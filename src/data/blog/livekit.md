---
title: LiveKit - Powering Real-Time Audio, Video, and Data
author: Birat Poudel
pubDatetime: 2025-07-21
slug: livekit-powering-real-time-audio-video-and-data
featured: false
draft: false
tags:
  - LiveKit
  - Amazon Nova Sonic
  - AWS
description: "LiveKit is an open-source platform offering scalable, production-ready infrastructure for real-time audio, video, and data communication, featuring server-side agents, WebRTC routing, and tools to simplify building multi-user conferencing."
timezone: "Asia/Kathmandu"
---

> LiveKit is an open-source platform built to simplify and scale real-time audio, video, and data applications. It provides a robust WebRTC infrastructure with built-in features like SFU (Selective Forwarding Unit), NAT traversal, media routing, and adaptive bandwidth handling so developers don’t have to build all the plumbing themselves. LiveKit also includes an Agents system: programmable server-side logic that can listen to events, transcribe audio, moderate content, or act as virtual participants, enabling advanced use cases like AI moderation or automated streaming workflows.

<div style="text-align: center;">

![LiveKIt](/livekit-1.webp)

*Figure 1: LiveKit*

</div>

LiveKit is an **open source project** that provides scalable, multi-user conferencing based on WebRTC.

LiveKit core features are:

1. **WebRTC Infrastructure**

LiveKit provides a robust and production-ready WebRTC infrastructure that handles low-latency audio and video communication at scale. It takes care of media routing, bandwidth adaptation, NAT traversal, and SFU (Selective Forwarding Unit) logic, allowing developers to focus on building engaging real-time applications without worrying about the underlying complexity.

2. **Agents System**

The Agents system in LiveKit enables programmable, server-side automation and intelligence within a room. Agents can listen to events, interact with participants, transcribe audio, analyze media streams, or even serve as virtual participants, opening the door to advanced use cases like AI moderation, bot-driven interactions, or automated live streaming.

---

LiveKit has both a client and a server. They work together to enable real-time audio/video/data communication.

The LiveKit Server is the backend component that manages rooms, participants, media routing, and signaling. It includes features like:

- SFU (Selective Forwarding Unit) for efficient media routing. The LiveKit Server acts as a Selective Forwarding Unit, which is a fancy way of saying that it accepts all of these incoming streams and sends (forwards) them to the appropriate users (i.e. selectively).
- Room and participant state management
- Authentication and authorization
- TURN/STUN support for NAT traversal
- Webhooks and APIs for control and integration

The Client SDKs are used by our app (web, mobile, or desktop) to connect to the LiveKit Server. They handle:

- Joining and leaving rooms
- Publishing and subscribing to audio/video streams
- Sending/receiving data
- Handling events like user joined, track added, etc.

### Workflow Example

1. The client authenticates (via a token from our backend) and joins a room.
2. The server manages room state, participants, and routes media streams via SFU.
3. Both communicate using WebRTC under the hood for real-time performance.

---

### Participants, Tracks, Rooms, Egress and Ingress

1. **Participants:**

End-users or processes that connect to a room. Participants can:

- Publish their own audio/video/data tracks
- Subscribe to tracks published by others
- Be humans (like users in a video call), media bots (ingesting RTMP or broadcasting), or AI agents (doing transcription, moderation, or analysis in real time)
- Have roles and permissions, e.g., moderator, speaker, viewer
- Example: In a virtual classroom, the teacher, students, and a transcription bot are all participants.

2. **Tracks:**

Media streams shared by participants. Types include:

- Audio tracks: e.g., voice from a microphone
- Video tracks: e.g., camera feed or screen share
- Data tracks: low-latency, unordered messages used for chat, reactions, whiteboarding, etc
- Tracks can be enabled/disabled, muted, or replaced during a session. Tracks are routed via the SFU so multiple participants can subscribe without duplicating upstream bandwidth.
- Example: A user in a meeting might publish one video track (webcam) and one screen-sharing track simultaneously.

3. **Rooms:**

Logical spaces that group participants together. Rooms:

- Define the scope of communication, participants can only see/hear others in the same room
- Can be configured with limits, e.g., max participants, auto-recording, bandwidth policies
- Support ephemeral (temporary) or persistent rooms
- Expose events and webhooks for when participants join/leave or tracks are published
- Example: Each customer support session in a telehealth app could be a separate room for privacy.

4. **Egress / Ingress**

- Ingress allows bringing external media streams (e.g., RTMP input, SIP calls) into LiveKit
- Egress allows streaming out to external platforms (e.g., RTMP out to YouTube, recording to S3)
- Example: In a live podcast, a guest connects via SIP (ingress), and the session is streamed to Twitch (egress).

_Note: RTMP (Real-Time Messaging Protocol) is a communication protocol used to stream audio, video, and data over the internet, originally developed by Adobe for Flash. It uses a persistent TCP connection to deliver low-latency streams._

LiveKit is open-source, which means we can self-host our own LiveKit server. This is a great option if we want to have full control over our infrastructure, or if we want to customize the LiveKit server to our specific needs.

There is also LiveKit Cloud service, which is a hosted version of LiveKit that is managed by the LiveKit team. This makes it easy for us to get up and running quickly and is free for small applications.

### LiveKit Flow

```py file="agent.py"
import logging

from typing import Any
from livekit import agents
from livekit.agents import Agent, AgentSession, function_tool, JobContext, RunContext, ChatContext, RoomInputOptions
from livekit.plugins.aws.experimental.realtime import RealtimeModel

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

@function_tool()
async def lookup_weather(
    context: RunContext,
    location: str,
) -> dict[str, Any]:
    """Look up weather information for a given location.
    
    Args:
        location: The location to look up weather information for.
    """
    return {"weather": f"{location} king", "temperature_f": 70}

class Assistant(Agent):
    def __init__(self, chat_ctx: ChatContext | None = None):
        super().__init__(
            instructions = "You are helpful, creative, and friendly Assistant.",
            chat_ctx = chat_ctx,
            tools = [lookup_weather]
        )

async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # Chat History
    initial_ctx = ChatContext()
    initial_ctx.add_message(role="user", content="My name is Birat.")

    session = AgentSession(llm=RealtimeModel(
        voice="tiffany",
        temperature=0.7,
        top_p=0.9,
        max_tokens=2048,
        region="us-east-1",
    ))

    agent = Assistant(initial_ctx)

    session = await session.start(agent, room=ctx.room,
                                  room_input_options=RoomInputOptions())
    
if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
```

1. When the agent program is run, it registers itself as a worker with the associated LiveKit server.
2. When a room is started for our application, the LiveKit sends a job request to the worker, causing the worker to initiate a job.
3. The job is initiated by an entrypoint function.
4. When our program (worker) receives a job request, it connects to the room, automatically subscribing to all audio tracks.
5. It then creates an AgentSession, which orchestrates all of the input/output, components, and orchestration required to create an AI agent.
6. We start the session, passing in an instance of our agent, specifying the room to which the agent session is assigned/bound, and defining what streams are sent to the room by the agent.
7. Finally, we define the main loop of our agent, which uses the run_app method to run our program and register it as a worker with the LiveKit server.

LiveKit transforms the complexity of real-time conferencing, covering audio, video, and data into a developer-friendly, scalable foundation built on modern protocols like WebRTC, STUN/TURN, and SFU architecture.

By defining clear abstractions: Participants, Tracks, Rooms, along with features like RTMP Ingress/Egress and Data Channels. LiveKit offers a comprehensive toolkit for building everything from virtual classrooms and AI-powered bots to high-stakes live-streaming platforms.

What makes LiveKit stand out is its flexibility:

- A high-performance Go server for handling real-time media at scale
- Rich client SDKs across web, mobile, and game engines
- A plethora of automation possibilities through APIs and Python agents

In essence, with LiveKit we don’t just spin up video/audio calls we gain the freedom to architect interactive, intelligent, and event-driven experiences that scale to hundreds or thousands of users.