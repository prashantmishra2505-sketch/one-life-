import math

def calculate_haversine(lat1, lon1, lat2, lon2):
    """Calculates the great-circle distance between two points on a sphere in kilometers."""
    R = 6371  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_nearest_unit(incident_lat, incident_lon, units):
    nearest_unit = None
    min_distance = float('inf')
    
    for unit in units:
        if not unit.availability:
            continue
            
        dist = calculate_haversine(
            float(incident_lat), float(incident_lon), 
            float(unit.latitude), float(unit.longitude)
        )
        if dist < min_distance:
            min_distance = dist
            nearest_unit = unit
            
    return nearest_unit
