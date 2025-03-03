from enum import Enum
from typing import List, Optional
from pydantic import BaseModel
from pydantic_extra_types.currency_code import ISO4217
from datetime import datetime


class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float


class Receipt(BaseModel):
    name: str
    description: Optional[str] = None
    date: datetime
    items: List[Item]
    total_price: float
    subtotal: Optional[float] = None
    category: str
