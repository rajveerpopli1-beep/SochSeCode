from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from config import get_settings
from services.alpaca import AlpacaClient
from services.finnhub import FinnhubClient


class TradeRequest(BaseModel):
    symbol: str
    side: str  # buy or sell2
    quantity: int
    order_type: str = "market"  # market or limit
    limit_price: Optional[float] = None
    time_in_force: str = "day"  # day, gtc, etc.
    asset_class: str = "us_equity"  # us_equity, option
    strike_price: Optional[float] = None
    expiry: Optional[str] = None  # YYYY-MM-DD for options
    strategy: Optional[str] = None


app = FastAPI(title="Trading Bot API", version="0.1.0")

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "ok"}


@app.get("/price")
def get_price(symbol: str, asset_class: str = "us_equity") -> Dict[str, Any]:
    try:
        alpaca = AlpacaClient(settings)
        price = alpaca.get_latest_price(symbol=symbol, asset_class=asset_class)
        return {"symbol": symbol, "asset_class": asset_class, "price": price}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/trade")
def place_trade(req: TradeRequest) -> Dict[str, Any]:
    try:
        alpaca = AlpacaClient(settings)
        order = alpaca.place_order(
            symbol=req.symbol,
            side=req.side,
            quantity=req.quantity,
            order_type=req.order_type,
            limit_price=req.limit_price,
            time_in_force=req.time_in_force,
            asset_class=req.asset_class,
            strike_price=req.strike_price,
            expiry=req.expiry,
            strategy=req.strategy,
        )
        return {"order": order}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/sentiment")
def get_sentiment(symbol: Optional[str] = None) -> Dict[str, Any]:
    try:
        finnhub = FinnhubClient(settings)
        if symbol:
            data = finnhub.get_company_news_sentiment(symbol)
        else:
            data = finnhub.get_market_news()
        return {"data": data}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/portfolio")
def get_portfolio() -> Dict[str, Any]:
    try:
        alpaca = AlpacaClient(settings)
        positions = alpaca.get_positions()
        account = alpaca.get_account()
        return {"positions": positions, "account": account}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc))
