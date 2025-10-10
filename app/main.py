# main.py
from fastapi import FastAPI
from typing import Optional

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="My FastAPI Project",
    description="A simple FastAPI example",
    version="1.0.0"
)

# Route căn bản
@app.get("/")
async def root():
    return {"message": "Hello World", "status": "success"}

# Route với tham số đường dẫn
@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

# Route POST với request body
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

@app.post("/items/")
async def create_item(item: Item):
    item_dict = item.dict()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict

# Route với query parameters
@app.get("/users/")
async def read_users(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}