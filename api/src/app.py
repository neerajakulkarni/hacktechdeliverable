from contextlib import asynccontextmanager
from datetime import datetime
from typing import AsyncIterator

from fastapi import FastAPI, Form, status, Query
from fastapi.responses import RedirectResponse, JSONResponse
from datetime import datetime, timedelta
from typing_extensions import TypedDict

from services.database import JSONDatabase


class Quote(TypedDict):
    name: str
    message: str
    time: str


database: JSONDatabase[list[Quote]] = JSONDatabase("data/database.json")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Handle database management when running app."""
    if "quotes" not in database:
        print("Adding quotes entry to database")
        database["quotes"] = []

    yield

    database.close()


app = FastAPI(lifespan=lifespan)


@app.post("/quote")
def post_message(name: str = Form(), message: str = Form()) -> RedirectResponse:
    """
    Process a user submitting a new quote.
    You should not modify this function except for the return value.
    """
    now = datetime.now()
    quote = Quote(name=name, message=message, time=now.isoformat(timespec="seconds"))
    database["quotes"].append(quote)
    print("hey")

    # You may modify the return value as needed to support other functionality
    return RedirectResponse("/", status.HTTP_303_SEE_OTHER)


# TODO: add another API route with a query parameter to retrieve quotes based on max age

@app.get("/quotes")
def get_quotes(max_age: str = Query("all", regex="^(today|week|month|year|all)$")) -> JSONResponse:
    now = datetime.now()
    if max_age == "today":
        threshold = datetime(now.year, now.month, now.day) 
    elif max_age == "week":
        threshold = now - timedelta(weeks=1)
    elif max_age == "month":
        threshold = now - timedelta(days=30)
    elif max_age == "year":
        threshold = now - timedelta(days=365)
    else:
        threshold = None

    if threshold:
        filtered_quotes = [quote for quote in database["quotes"] 
        if datetime.fromisoformat(quote["time"]) >= threshold]
    else:
        filtered_quotes = database["quotes"]

    return JSONResponse(content=filtered_quotes)
