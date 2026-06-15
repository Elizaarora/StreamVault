from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    await db.users.create_index("email", unique=True)
    # Drop old non-sparse username index if it exists, then recreate as sparse
    # (sparse=True allows multiple documents with username=None)
    try:
        await db.users.drop_index("username_1")
    except Exception:
        pass
    await db.users.create_index("username", unique=True, sparse=True)
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
