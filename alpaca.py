import requests
from typing import Any, Dict, Optional

from config import Settings


class AlpacaClient:
    def __init__(self, settings: Settings) -> None:
        self.api_key = settings.ALPACA_API_KEY
        self.api_secret = settings.ALPACA_API_SECRET
        self.base_url = settings.ALPACA_BASE_URL.rstrip("/")
        self.data_url = settings.ALPACA_DATA_URL.rstrip("/")

        self._headers = {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.api_secret,
            "Content-Type": "application/json",
        }

    def get_latest_price(self, symbol: str, asset_class: str = "us_equity") -> float:
        if asset_class == "us_equity":
            url = f"{self.data_url}/stocks/{symbol}/trades/latest"
            resp = requests.get(url, headers=self._headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            return float(data.get("trade", {}).get("p"))
        elif asset_class == "option":
            url = f"{self.data_url}/options/{symbol}/quotes/latest"
            resp = requests.get(url, headers=self._headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            # Use mid price if available
            ask = data.get("quote", {}).get("ap")
            bid = data.get("quote", {}).get("bp")
            if ask is not None and bid is not None:
                return (float(ask) + float(bid)) / 2.0
            # fallback to ask or bid
            return float(ask or bid)
        else:
            raise ValueError("Unsupported asset_class")

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: int,
        order_type: str = "market",
        limit_price: Optional[float] = None,
        time_in_force: str = "day",
        asset_class: str = "us_equity",
        strike_price: Optional[float] = None,
        expiry: Optional[str] = None,
        strategy: Optional[str] = None,
    ) -> Dict[str, Any]:
        # For options, Alpaca uses option_symbol; construct when required
        payload: Dict[str, Any] = {
            "symbol": symbol,
            "side": side.lower(),
            "qty": quantity,
            "type": order_type.lower(),
            "time_in_force": time_in_force.lower(),
        }
        if order_type.lower() == "limit" and limit_price is not None:
            payload["limit_price"] = limit_price

        if asset_class == "option":
            # Simplified OCC option symbol construction may vary based on Alpaca API
            if not (strike_price and expiry and strategy):
                raise ValueError("Options require strike_price, expiry, and strategy (C/P)")
            # Example OCC format: AAPL230915C00175000 (symbol + yymmdd + C/P + strike*1000 padded)
            yymmdd = expiry.replace("-", "")[2:]
            cp = "C" if strategy.upper().startswith("C") else "P"
            strike_int = int(float(strike_price) * 1000)
            option_symbol = f"{symbol.upper()}{yymmdd}{cp}{strike_int:08d}"
            payload = {
                "symbol": option_symbol,
                "side": side.lower(),
                "qty": quantity,
                "type": order_type.lower(),
                "time_in_force": time_in_force.lower(),
                "asset_class": "option",
            }

        url = f"{self.base_url}/v2/orders"
        resp = requests.post(url, json=payload, headers=self._headers, timeout=20)
        resp.raise_for_status()
        return resp.json()

    def get_positions(self) -> Any:
        url = f"{self.base_url}/v2/positions"
        resp = requests.get(url, headers=self._headers, timeout=20)
        resp.raise_for_status()
        return resp.json()

    def get_account(self) -> Any:
        url = f"{self.base_url}/v2/account"
        resp = requests.get(url, headers=self._headers, timeout=20)
        resp.raise_for_status()
        return resp.json()


