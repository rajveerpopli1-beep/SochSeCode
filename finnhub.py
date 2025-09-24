import requests
from typing import Any

from config import Settings


class FinnhubClient:
    def __init__(self, settings: Settings) -> None:
        self.api_key = settings.FINNHUB_API_KEY
        self.base_url = "https://finnhub.io/api/v1"

    def get_company_news_sentiment(self, symbol: str) -> Any:
        url = f"{self.base_url}/news-sentiment"
        resp = requests.get(url, params={"symbol": symbol, "token": self.api_key}, timeout=15)
        resp.raise_for_status()
        return resp.json()

    def get_market_news(self) -> Any:
        url = f"{self.base_url}/news"
        resp = requests.get(url, params={"category": "general", "token": self.api_key}, timeout=15)
        resp.raise_for_status()
        return resp.json()


