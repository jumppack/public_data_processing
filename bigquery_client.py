import logging
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError
from models import SpendingProxyRecord

logger = logging.getLogger(__name__)

def fetch_spending_proxies(limit: int = 50) -> list[SpendingProxyRecord]:
    """
    Connects to BigQuery using Application Default Credentials (ADC)
    and fetches median income Data from the ACS dataset as a proxy
    for consumer spending capacity.
    
    Args:
        limit (int): The maximum number of records to return.
        
    Returns:
        list[SpendingProxyRecord]: A list of validated spending proxy records.
    """
    # Initialize the BigQuery client. 
    # This automatically picks up Application Default Credentials (ADC).
    client = bigquery.Client()
    
    # Query the 2020 5-year American Community Survey (ACS) at the county level.
    # Exclude negative median_income values which indicate invalid data/insufficient sample.
    query = f"""
        SELECT 
            geo_id, 
            median_income, 
            total_pop as total_population
        FROM 
            `bigquery-public-data.census_bureau_acs.county_2020_5yr`
        WHERE 
            median_income > 0
        ORDER BY 
            median_income DESC
        LIMIT {limit}
    """
    
    results = []
    try:
        query_job = client.query(query)
        rows = query_job.result()  # Waits for the query to finish
        
        for row in rows:
            # Map the row explicitly to the Pydantic model
            record = SpendingProxyRecord(
                geo_id=row.geo_id,
                median_income=row.median_income,
                total_population=row.total_population
            )
            results.append(record)
            
    except GoogleAPIError as e:
        logger.error(f"BigQuery API Error: {e}")
        raise RuntimeError(f"Failed to fetch data from BigQuery: {e}")
    except Exception as e:
        logger.error(f"Unexpected Error querying BigQuery: {e}")
        raise RuntimeError(f"An unexpected error occurred: {e}")
        
    return results
