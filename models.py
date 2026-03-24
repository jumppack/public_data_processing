from pydantic import BaseModel, Field
from typing import List, Dict, Any

class DashboardDataRecord(BaseModel):
    """
    Represents aggregated yearly data from the ACS dataset for simplified dashboards.
    """
    year: str = Field(..., description="The year of the data (e.g., 2015, 2016)")
    median_income: float = Field(0.0, description="Average of median incomes across counties")
    income_bracket_50k_60k: int = Field(0, description="Total households earning $50k-$60k")
    income_bracket_100k_125k: int = Field(0, description="Total households earning $100k-$125k")
    income_bracket_200k_plus: int = Field(0, description="Total households earning $200k+")
    median_rent: float = Field(0.0, description="Average of median rents")
    income_per_capita: float = Field(0.0, description="Average income per capita")
    employed_management: int = Field(0, description="Sum of people employed in Management/Business")
    employed_manufacturing: int = Field(0, description="Sum of people employed in Manufacturing")

class DashboardDataResponse(BaseModel):
    """
    Standardized API response for the dashboards dynamically generated on landing page.
    """
    success: bool
    data: List[DashboardDataRecord]
    metadata: Dict[str, Any]
