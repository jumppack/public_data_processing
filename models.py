from pydantic import BaseModel, Field
from typing import List, Dict, Any

class SpendingProxyRecord(BaseModel):
    """
    Represents an economic health/spending proxy record 
    derived from the ACS dataset.
    """
    geo_id: str = Field(..., description="Geographic identifier (e.g., County or State FIPS code)")
    median_income: float | None = Field(None, description="Median household income in the area")
    total_population: int | None = Field(None, description="Total population in the geographic area")

class SpendingProxyResponse(BaseModel):
    """
    Standardized API response for consumer spending proxies.
    """
    success: bool
    data: List[SpendingProxyRecord]
    metadata: Dict[str, Any]
