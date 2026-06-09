from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import Role, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:

    @staticmethod
    async def register(db: AsyncSession, data: RegisterRequest) -> UserResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"errors": {"email": "Email already registered"}},
            )

        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            role=Role.REVIEWER,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return UserResponse.model_validate(user)

    @staticmethod
    async def login(db: AsyncSession, data: LoginRequest) -> TokenResponse:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if user is None or not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"errors": {"email": "Invalid email or password"}},
            )

        token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
