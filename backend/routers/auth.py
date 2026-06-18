from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone
from bson import ObjectId

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token, decode_access_token
from core.config import settings
from core.email import send_password_reset_email
from models.user import UserCreate, UserLogin, UserOut, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


def _serialize_user(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        first_name=doc.get("first_name") or "",
        last_name=doc.get("last_name") or "",
        email=doc["email"],
        avatar=doc.get("avatar"),
        created_at=doc["created_at"],
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: UserCreate):
    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    doc = {
        "first_name": body.first_name,
        "last_name": body.last_name,
        "email": body.email,
        "hashed_password": hash_password(body.password),
        "avatar": None,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return TokenResponse(access_token=token, user=_serialize_user(doc))


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token, user=_serialize_user(user))


# Google OAuth removed — app uses email/password only


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    import secrets
    from datetime import timedelta

    db = get_db()
    user = await db.users.find_one({"email": body.email})

    # Always return the same message — never reveal if email exists
    generic = {"message": "If an account with that email exists, a reset link has been sent."}

    if not user:
        return generic  # don't reveal if email exists

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": token, "reset_token_expires": expires}},
    )

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    username = (user.get("first_name") or "") or user["email"].split("@")[0]

    try:
        await send_password_reset_email(
            to_email=user["email"],
            username=username,
            reset_url=reset_url,
        )
    except Exception as e:
        # Surface email errors clearly in dev so they're not invisible
        raise HTTPException(status_code=500, detail=f"Email send failed: {str(e)}")

    return generic


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    from datetime import timezone as tz
    db = get_db()
    user = await db.users.find_one({"reset_token": body.token})

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    expires = user.get("reset_token_expires")
    if expires and expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set":  {"hashed_password": hash_password(body.new_password)},
            "$unset": {"reset_token": "", "reset_token_expires": ""},
        },
    )
    return {"message": "Password updated successfully. You can now sign in."}





@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _serialize_user(current_user)
