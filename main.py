from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from bigquery_client import fetch_dashboard_data
from models import DashboardDataResponse
import os

app = FastAPI(
    title="Consumer Spending Trends API",
    description="API analyzing aggregate consumer spending trends using public datasets.",
    version="1.0.0"
)

# Ensure static directory exists
os.makedirs("static", exist_ok=True)

# Mount the static directory to serve CSS and JS files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/api/v1/dashboard-data", response_model=DashboardDataResponse)
def get_dashboard_data():
    """
    Fetches aggregate multi-year data for all 4 dashboards.
    """
    try:
        data = fetch_dashboard_data()
        return DashboardDataResponse(
            success=True,
            data=data,
            metadata={
                "source": "bigquery-public-data.census_bureau_acs",
                "years_covered": ["2015", "2016", "2017", "2018"],
                "records": len(data)
            }
        )
    except RuntimeError as e:
        # Catch errors explicitly raised by the BQ client wrapper
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Fallback for unexpected errors
        raise HTTPException(status_code=500, detail="Internal server error occurred.")

@app.get("/")
def serve_landing_page():
    """
    Serves the main landing page with the 4 dashboards.
    """
    return FileResponse("static/index.html")
