from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models.user import Role, User

SEED_USERS = [
    {
        "name": "Admin User",
        "email": "admin@techcraft.com",
        "password": "password123",
        "role": Role.ADMIN,
    },
    {
        "name": "Reviewer User",
        "email": "reviewer@techcraft.com",
        "password": "password123",
        "role": Role.REVIEWER,
    },
]


async def seed_users(db: AsyncSession) -> None:
    for user_data in SEED_USERS:
        result = await db.execute(select(User).where(User.email == user_data["email"]))
        existing = result.scalar_one_or_none()
        if existing is not None:
            continue
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=hash_password(user_data["password"]),
            role=user_data["role"],
        )
        db.add(user)
    await db.commit()
