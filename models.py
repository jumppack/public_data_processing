from pydantic import BaseModel, Field
from typing import List, Dict, Any

class DashboardDataRecord(BaseModel):
    """
    Represents aggregated yearly data from the ACS dataset for dashboards.
    """
    year: str = Field(..., description="The year of the data (e.g., 2015, 2016)")
    median_income: float = Field(0.0, description="Average of median incomes across counties")
    median_rent: float = Field(0.0, description="Average of median rents")
    income_per_capita: float = Field(0.0, description="Average income per capita")
    total_population: int = Field(0, description="Sum of total populations")
    employed_management: int = Field(0, description="Sum of people employed in Management/Business")
    employed_service: int = Field(0, description="Sum of people employed in Service")
    employed_manufacturing: int = Field(0, description="Sum of people employed in Manufacturing")
    employed_arts: int = Field(0, description="Sum of people employed in Arts/Entertainment/Recreation")
    aggregate_travel_time: int = Field(0, description="Sum of aggregate travel time to work")

class DashboardDataResponse(BaseModel):
    """
    Standardized API response for the dashboards dynamically generated on landing page.
    """
    success: bool
    data: List[DashboardDataRecord]
    metadata: Dict[str, Any]
