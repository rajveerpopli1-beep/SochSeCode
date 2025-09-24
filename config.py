from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Alpaca
    ALPACA_API_KEY: str = ""
    ALPACA_API_SECRET: str = ""
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"
    ALPACA_DATA_URL: str = "https://data.alpaca.markets/v2"

    # Finnhub
    FINNHUB_API_KEY: str = ""

    # CORS
    CORS_ALLOW_ORIGINS: str = "*"

    # Misc
    ENV: str = "development"

    @property
    def cors_allow_origins(self) -> List[str]:
        if not self.CORS_ALLOW_ORIGINS:
            return ["*"]
        return [o.strip() for o in self.CORS_ALLOW_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


