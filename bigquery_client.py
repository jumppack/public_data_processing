import logging
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError
from models import DashboardDataRecord

logger = logging.getLogger(__name__)

def fetch_dashboard_data() -> list[DashboardDataRecord]:
    """
    Connects to BigQuery using Application Default Credentials (ADC)
    and fetches aggregated time-series Data from the ACS dataset 
    from 2015 to 2018.
    
    Returns:
        list[DashboardDataRecord]: A list of validated dashboard records for the UI.
    """
    # Using UNION ALL to aggregate data across 4 years from the ACS 5-year county tables.
    years = [2015, 2016, 2017, 2018]
    queries = []
    
    for year in years:
        table_name = f"`bigquery-public-data.census_bureau_acs.county_{year}_5yr`"
        q = f"""
        SELECT 
            '{year}' as year,
            AVG(median_income) as median_income,
            AVG(median_rent) as median_rent,
            AVG(per_capita_income) as income_per_capita,
            SUM(total_pop) as total_population,
            SUM(employed_management_business_science_arts) as employed_management,
            SUM(employed_service) as employed_service,
            SUM(employed_manufacturing) as employed_manufacturing,
            SUM(employed_arts_entertainment_recreation_accommodation_food) as employed_arts,
            SUM(aggregate_travel_time_to_work) as aggregate_travel_time
        FROM 
            {table_name}
        """
        queries.append(q)
        
    query = " UNION ALL ".join(queries) + " ORDER BY year ASC"
    
    results = []
    try:
        client = bigquery.Client()
        query_job = client.query(query)
        rows = query_job.result()  # Waits for the query to finish
        
        for row in rows:
            record = DashboardDataRecord(
                year=row.year,
                median_income=float(row.median_income or 0),
                median_rent=float(row.median_rent or 0),
                income_per_capita=float(row.income_per_capita or 0),
                total_population=int(row.total_population or 0),
                employed_management=int(row.employed_management or 0),
                employed_service=int(row.employed_service or 0),
                employed_manufacturing=int(row.employed_manufacturing or 0),
                employed_arts=int(row.employed_arts or 0),
                aggregate_travel_time=int(row.aggregate_travel_time or 0)
            )
            results.append(record)
            
    except GoogleAPIError as e:
        logger.error(f"BigQuery API Error: {e}")
        raise RuntimeError(f"Failed to fetch data from BigQuery: {e}")
    except Exception as e:
        logger.error(f"Unexpected Error querying BigQuery: {e}")
        raise RuntimeError(f"An unexpected error occurred: {e}")
        
    return results
