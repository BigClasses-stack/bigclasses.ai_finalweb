from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest
import os

def get_analytics_data():
    client = BetaAnalyticsDataClient()
    property_id = "YOUR_GA4_PROPERTY_ID"
    
    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[{"name": "city"}],
        metrics=[{"name": "activeUsers"}],
        date_ranges=[{"start_date": "2024-01-01", "end_date": "today"}],
    )
    
    response = client.run_report(request)
    return response