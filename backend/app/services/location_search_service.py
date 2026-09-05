import math
from typing import List, Dict, Any, Optional
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session

from app.models.equipment_listing import EquipmentListing


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    
    Args:
        lat1: Latitude of first point in decimal degrees
        lon1: Longitude of first point in decimal degrees
        lat2: Latitude of second point in decimal degrees
        lon2: Longitude of second point in decimal degrees
    
    Returns:
        Distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r


def find_equipment_within_radius(
    db: Session,
    user_lat: float, 
    user_lon: float, 
    radius_km: float,
    equipment_type: Optional[str] = None,
    available_from: Optional[str] = None,
    available_until: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    sort_by: str = "distance",
    limit: int = 20,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Find equipment listings within a given radius of user's location
    using Haversine formula for distance calculation
    
    Args:
        db: Database session
        user_lat: User's latitude
        user_lon: User's longitude
        radius_km: Search radius in kilometers (10-50)
        equipment_type: Filter by equipment type
        available_from: Filter by availability start date
        available_until: Filter by availability end date
        min_price: Minimum rental price per day
        max_price: Maximum rental price per day
        condition: Filter by equipment condition
        state: Filter by state
        district: Filter by district
        sort_by: Sort method ('distance', 'price', 'rating', 'newest')
        limit: Number of results to return
        offset: Offset for pagination
    
    Returns:
        Dictionary containing listings, total count, and pagination info
    """
    # Build base query
    query = db.query(EquipmentListing).filter(
        and_(
            EquipmentListing.status == 'active',
            EquipmentListing.is_available == True
        )
    )
    
    # Add equipment type filter
    if equipment_type:
        query = query.filter(EquipmentListing.equipment_type == equipment_type)
    
    # Add date availability filters
    if available_from:
        query = query.filter(EquipmentListing.available_from <= available_from)
    if available_until:
        query = query.filter(EquipmentListing.available_until >= available_until)
    
    # Add price filters
    if min_price:
        query = query.filter(EquipmentListing.rental_price_per_day >= min_price)
    if max_price:
        query = query.filter(EquipmentListing.rental_price_per_day <= max_price)
    
    # Add condition filter
    if condition:
        query = query.filter(EquipmentListing.condition == condition)
    
    # Add location filters
    if state:
        query = query.filter(EquipmentListing.state == state)
    if district:
        query = query.filter(EquipmentListing.district == district)
    
    # Get total count before distance filtering
    total_count = query.count()
    
    # Get all matching listings
    listings = query.all()
    
    # Filter by distance using Haversine formula
    nearby_listings = []
    for listing in listings:
        distance = haversine_distance(
            user_lat, user_lon, 
            listing.latitude, listing.longitude
        )
        if distance <= radius_km:
            nearby_listings.append({
                'listing': listing,
                'distance_km': round(distance, 1)
            })
    
    # Sort results
    if sort_by == 'distance':
        nearby_listings.sort(key=lambda x: x['distance_km'])
    elif sort_by == 'price':
        nearby_listings.sort(key=lambda x: x['listing'].rental_price_per_day)
    elif sort_by == 'newest':
        nearby_listings.sort(key=lambda x: x['listing'].created_at, reverse=True)
    elif sort_by == 'rating':
        # This would require joining with reviews table
        # For now, sort by listing quality score
        nearby_listings.sort(key=lambda x: x['listing'].listing_quality_score, reverse=True)
    
    # Apply pagination
    paginated_listings = nearby_listings[offset:offset + limit]
    
    # Format results
    formatted_listings = []
    for item in paginated_listings:
        listing = item['listing']
        formatted_listings.append({
            'id': listing.id,
            'equipment_name': listing.equipment_name,
            'equipment_type': listing.equipment_type,
            'brand': listing.brand,
            'condition': listing.condition,
            'rental_price_per_day': listing.rental_price_per_day,
            'rental_price_per_hour': listing.rental_price_per_hour,
            'distance_km': item['distance_km'],
            'primary_photo': listing.primary_photo,
            'location': {
                'state': listing.state,
                'district': listing.district,
                'village': listing.village
            },
            'availability': {
                'available_from': listing.available_from.isoformat() if listing.available_from else None,
                'available_until': listing.available_until.isoformat() if listing.available_until else None
            },
            'owner_id': listing.owner_id,
            'verification_status': listing.verification_status,
            'view_count': listing.view_count
        })
    
    return {
        'listings': formatted_listings,
        'total': len(nearby_listings),
        'page': (offset // limit) + 1,
        'total_pages': (len(nearby_listings) + limit - 1) // limit,
        'has_more': offset + limit < len(nearby_listings)
    }


def get_equipment_by_location_bounds(
    db: Session,
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float,
    **filters
) -> List[EquipmentListing]:
    """
    Find equipment within a bounding box (more efficient than radius search for map views)
    
    Args:
        db: Database session
        min_lat: Minimum latitude
        max_lat: Maximum latitude
        min_lon: Minimum longitude
        max_lon: Maximum longitude
        **filters: Additional filters (equipment_type, status, etc.)
    
    Returns:
        List of equipment listings within bounds
    """
    query = db.query(EquipmentListing).filter(
        and_(
            EquipmentListing.latitude >= min_lat,
            EquipmentListing.latitude <= max_lat,
            EquipmentListing.longitude >= min_lon,
            EquipmentListing.longitude <= max_lon,
            EquipmentListing.status == 'active',
            EquipmentListing.is_available == True
        )
    )
    
    # Apply additional filters
    if 'equipment_type' in filters:
        query = query.filter(EquipmentListing.equipment_type == filters['equipment_type'])
    if 'state' in filters:
        query = query.filter(EquipmentListing.state == filters['state'])
    if 'district' in filters:
        query = query.filter(EquipmentListing.district == filters['district'])
    
    return query.all()


def calculate_bounds_from_center(
    center_lat: float,
    center_lon: float,
    radius_km: float
) -> Dict[str, float]:
    """
    Calculate bounding box coordinates from center point and radius
    Useful for map-based searches
    
    Args:
        center_lat: Center latitude
        center_lon: Center longitude
        radius_km: Radius in kilometers
    
    Returns:
        Dictionary with min_lat, max_lat, min_lon, max_lon
    """
    # Approximate conversion (this is simplified, for more accuracy use proper projections)
    lat_delta = radius_km / 111.0  # 1 degree latitude ≈ 111 km
    lon_delta = radius_km / (111.0 * math.cos(math.radians(center_lat)))
    
    return {
        'min_lat': center_lat - lat_delta,
        'max_lat': center_lat + lat_delta,
        'min_lon': center_lon - lon_delta,
        'max_lon': center_lon + lon_delta
    }


def get_nearby_equipment_summary(
    db: Session,
    user_lat: float,
    user_lon: float,
    radius_km: float = 25
) -> Dict[str, Any]:
    """
    Get summary statistics of nearby equipment by type
    Useful for showing quick overview on search screen
    
    Args:
        db: Database session
        user_lat: User's latitude
        user_lon: User's longitude
        radius_km: Search radius in kilometers
    
    Returns:
        Dictionary with equipment type counts and price ranges
    """
    # Get all active listings
    listings = db.query(EquipmentListing).filter(
        and_(
            EquipmentListing.status == 'active',
            EquipmentListing.is_available == True
        )
    ).all()
    
    # Filter by distance and group by type
    equipment_summary = {}
    
    for listing in listings:
        distance = haversine_distance(
            user_lat, user_lon,
            listing.latitude, listing.longitude
        )
        
        if distance <= radius_km:
            equipment_type = listing.equipment_type
            
            if equipment_type not in equipment_summary:
                equipment_summary[equipment_type] = {
                    'count': 0,
                    'min_price': float('inf'),
                    'max_price': 0,
                    'avg_price': 0,
                    'total_price': 0
                }
            
            summary = equipment_summary[equipment_type]
            summary['count'] += 1
            summary['min_price'] = min(summary['min_price'], listing.rental_price_per_day)
            summary['max_price'] = max(summary['max_price'], listing.rental_price_per_day)
            summary['total_price'] += listing.rental_price_per_day
            summary['avg_price'] = summary['total_price'] / summary['count']
    
    # Clean up infinite values
    for equipment_type in equipment_summary:
        if equipment_summary[equipment_type]['min_price'] == float('inf'):
            equipment_summary[equipment_type]['min_price'] = 0
    
    return equipment_summary