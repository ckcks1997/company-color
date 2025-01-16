from fastapi import HTTPException, APIRouter, Depends
from app.api.deps import SessionDep
from app.crud import save_reply, get_reply_by_hash
from app.dtos import Reply
from app.models.tInfoReply import InfoReply

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


@router.get("/reply", response_model=list[InfoReply])
async def get_reply(db: SessionDep, reply: Reply = Depends()):
    if reply.hash == '':
        raise HTTPException(status_code=400, detail="hash is empty")

    list = await get_reply_by_hash(db, reply.hash)
    return list