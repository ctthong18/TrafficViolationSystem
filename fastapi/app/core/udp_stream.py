import asyncio
import logging
from app.core.camera_manager import update_frame

logger = logging.getLogger(__name__)

class CameraUDPProtocol(asyncio.DatagramProtocol):
    def datagram_received(self, data, addr):
        try:
            if len(data) < 2:
                # print(f"UDP: Tiny packet from {addr}")
                return
            
            # Simple protocol: [ID_LEN (1 byte)] [ID (string)] [JPEG_DATA]
            id_len = data[0]
            if len(data) < 1 + id_len:
                return
            
            camera_id = data[1:1+id_len].decode('utf-8')
            frame_data = data[1+id_len:]
            
            # print(f"UDP: Received {len(frame_data)} bytes for {camera_id}")
            update_frame(camera_id, frame_data)
        except Exception as e:
            print(f"UDP Error: {e}")

async def start_udp_receiver(host="0.0.0.0", port=9999):
    logger.info(f"Starting UDP Stream Receiver on {host}:{port}")
    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: CameraUDPProtocol(),
        local_addr=(host, port)
    )
    return transport
