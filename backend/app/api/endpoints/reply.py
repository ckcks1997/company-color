from fastapi import HTTPException, APIRouter
from app.api.deps import SessionDep
from app.crud import save_reply
from app.dtos import Reply

router = APIRouter()

@router.post("/reply")
async def post_reply(reply: Reply, db: SessionDep):
    if reply.access_token == '':
        raise HTTPException(status_code=400, detail="Failed to get user info")
    if reply.hash == '':
        raise HTTPException(status_code=400, detail="hash is empty")

    print(reply)
    await save_reply(db, reply)

    return reply