import json

from fastapi import APIRouter, Depends, status
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_current_user_by_token
from app.db.models.user import User
from app.services.event_bus import event_bus

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("")
async def subscribe_to_events(
    current_user: User = Depends(get_current_user_by_token),
):
    queue = event_bus.subscribe()

    async def event_generator():
        try:
            while True:
                payload = await queue.get()
                yield {
                    "event": payload["event"],
                    "data": json.dumps(payload["data"]),
                }
        except Exception:
            pass
        finally:
            event_bus.unsubscribe(queue)

    return EventSourceResponse(event_generator())
