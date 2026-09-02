import os

from startuped import Startuped

client = Startuped(api_key=os.getenv("STARTUPED_API_KEY"))

client._http.request(

    "/api/v1/auth/validate",

    method="GET",

)

print("SDK API call completed")

