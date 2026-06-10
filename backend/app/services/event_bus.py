import asyncio


class EventBus:
    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    async def publish(self, event: str, data: dict | None = None) -> None:
        payload = {"event": event, "data": data or {}}
        for queue in self._subscribers:
            await queue.put(payload)


event_bus = EventBus()
