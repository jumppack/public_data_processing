from fastapi import FastAPI, HTTPException
from bigquery_client import fetch_spending_proxies
from models import SpendingProxyResponse

app = FastAPI(
    title="Consumer Spending Trends API",
    description="API analyzing aggregate consumer spending trends using public datasets.",
    version="1.0.0"
)

@app.get("/api/v1/sales-trends", response_model=SpendingProxyResponse)
def get_sales_trends(limit: int = 50):
    """
    Fetches aggregate consumer spending proxy data.
    
    This endpoint executes a query against Google BigQuery's American Community 
    Survey (ACS) dataset to pull median income and population metrics at the county level 
    as a proxy for aggregate retail sales and spending capacity.
    """
    try:
        data = fetch_spending_proxies(limit=limit)
        return SpendingProxyResponse(
            success=True,
            data=data,
            metadata={
                "source": "bigquery-public-data.census_bureau_acs.county_2020_5yr",
                "proxy_metric": "median_income",
                "count": len(data)
            }
        )
    except RuntimeError as e:
        # Catch errors explicitly raised by the BQ client wrapper
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Fallback for unexpected errors
        raise HTTPException(status_code=500, detail="Internal server error occurred.")
