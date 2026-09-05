from typing import Dict, Any, Optional
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.equipment_review import EquipmentReview
from app.models.equipment_rental_request import EquipmentRentalRequest


def calculate_trust_score(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculate comprehensive trust score for a user
    Returns score 0-100 with component breakdown
    
    Args:
        db: Database session
        user_id: User ID to calculate trust score for
    
    Returns:
        Dictionary containing trust score components and overall score
    """
    # Get user's rental history
    rentals_as_owner = db.query(EquipmentRentalRequest).filter(
        and_(
            EquipmentRentalRequest.owner_id == user_id,
            EquipmentRentalRequest.status == 'completed'
        )
    ).count()
    
    rentals_as_renter = db.query(EquipmentRentalRequest).filter(
        and_(
            EquipmentRentalRequest.renter_id == user_id,
            EquipmentRentalRequest.status == 'completed'
        )
    ).count()
    
    total_completed = rentals_as_owner + rentals_as_renter
    
    # Get total requests (for completion rate)
    total_requests = db.query(EquipmentRentalRequest).filter(
        or_(
            EquipmentRentalRequest.owner_id == user_id,
            EquipmentRentalRequest.renter_id == user_id
        )
    ).count()
    
    # Get cancellations
    cancellations = db.query(EquipmentRentalRequest).filter(
        and_(
            or_(
                EquipmentRentalRequest.owner_id == user_id,
                EquipmentRentalRequest.renter_id == user_id
            ),
            EquipmentRentalRequest.status == 'cancelled'
        )
    ).count()
    
    # Get ratings received
    reviews_received = db.query(EquipmentReview).filter(
        EquipmentReview.reviewee_id == user_id
    ).all()
    
    # Get user for verification status
    user = db.query(User).filter(User.id == user_id).first()
    
    # Calculate component scores
    scores = {
        'completion_rate': 0,
        'rating_score': 0,
        'activity_score': 0,
        'verification_score': 0,
        'response_score': 70,  # Default score for new users
        'overall': 0
    }
    
    # 1. Completion Rate (30% weight)
    if total_requests > 0:
        completion_rate = (total_completed / total_requests) * 100
        scores['completion_rate'] = min(completion_rate, 100)
    else:
        # New users get baseline score
        scores['completion_rate'] = 70
    
    # 2. Rating Score (25% weight)
    if reviews_received:
        avg_rating = sum(r.overall_rating for r in reviews_received) / len(reviews_received)
        scores['rating_score'] = (avg_rating / 5) * 100
    else:
        # New users get baseline score
        scores['rating_score'] = 70
    
    # 3. Activity Score (20% weight)
    # More activity = higher trust (up to a point)
    activity_score = min(total_completed * 3, 100)
    # Minimum baseline score for some activity
    if total_completed == 0:
        activity_score = 50
    scores['activity_score'] = activity_score
    
    # 4. Verification Score (15% weight)
    verification_score = 0
    if user and user.identity_verification_status == 'verified':
        verification_score += 50
    if user and user.phone:
        verification_score += 30
    if user and user.profile_completed:
        verification_score += 20
    scores['verification_score'] = verification_score
    
    # 5. Response Score (10% weight)
    # This would be calculated from actual message response times
    # For now, use a default score that can be updated with real data
    scores['response_score'] = 70
    
    # Calculate weighted overall score
    weights = {
        'completion_rate': 0.30,
        'rating_score': 0.25,
        'activity_score': 0.20,
        'verification_score': 0.15,
        'response_score': 0.10
    }
    
    overall_score = sum(
        scores[key] * weights[key] 
        for key in scores.keys() 
        if key != 'overall'
    )
    
    scores['overall'] = round(overall_score, 1)
    
    # Add additional context
    scores['context'] = {
        'total_completed': total_completed,
        'total_requests': total_requests,
        'cancellations': cancellations,
        'reviews_received': len(reviews_received),
        'rentals_as_owner': rentals_as_owner,
        'rentals_as_renter': rentals_as_renter
    }
    
    return scores


def get_user_rating_breakdown(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Get detailed rating breakdown for a user as owner and renter
    
    Args:
        db: Database session
        user_id: User ID to get ratings for
    
    Returns:
        Dictionary containing rating breakdowns
    """
    # Get reviews where user is the reviewee
    reviews_received = db.query(EquipmentReview).filter(
        EquipmentReview.reviewee_id == user_id
    ).all()
    
    if not reviews_received:
        return {
            'average_rating': 0,
            'total_reviews': 0,
            'rating_breakdown': {
                'overall': 0,
                'equipment_condition': 0,
                'communication': 0,
                'punctuality': 0,
                'value': 0
            },
            'review_count_by_type': {
                'equipment': 0,
                'owner': 0,
                'renter': 0
            }
        }
    
    # Calculate averages
    rating_breakdown = {
        'overall': sum(r.overall_rating for r in reviews_received) / len(reviews_received),
        'equipment_condition': 0,
        'communication': 0,
        'punctuality': 0,
        'value': 0
    }
    
    # Calculate optional ratings
    condition_ratings = [r.equipment_condition_rating for r in reviews_received if r.equipment_condition_rating]
    if condition_ratings:
        rating_breakdown['equipment_condition'] = sum(condition_ratings) / len(condition_ratings)
    
    comm_ratings = [r.communication_rating for r in reviews_received if r.communication_rating]
    if comm_ratings:
        rating_breakdown['communication'] = sum(comm_ratings) / len(comm_ratings)
    
    punctuality_ratings = [r.punctuality_rating for r in reviews_received if r.punctuality_rating]
    if punctuality_ratings:
        rating_breakdown['punctuality'] = sum(punctuality_ratings) / len(punctuality_ratings)
    
    value_ratings = [r.value_rating for r in reviews_received if r.value_rating]
    if value_ratings:
        rating_breakdown['value'] = sum(value_ratings) / len(value_ratings)
    
    # Count by review type
    review_count_by_type = {
        'equipment': 0,
        'owner': 0,
        'renter': 0
    }
    
    for review in reviews_received:
        if review.review_type in review_count_by_type:
            review_count_by_type[review.review_type] += 1
    
    return {
        'average_rating': round(rating_breakdown['overall'], 1),
        'total_reviews': len(reviews_received),
        'rating_breakdown': {
            'overall': round(rating_breakdown['overall'], 1),
            'equipment_condition': round(rating_breakdown['equipment_condition'], 1),
            'communication': round(rating_breakdown['communication'], 1),
            'punctuality': round(rating_breakdown['punctuality'], 1),
            'value': round(rating_breakdown['value'], 1)
        },
        'review_count_by_type': review_count_by_type
    }


def validate_review(
    db: Session,
    review_data: Dict[str, Any],
    rental_request_id: int,
    reviewer_id: int
) -> tuple[bool, str]:
    """
    Validate review before submission
    
    Args:
        db: Database session
        review_data: Review data to validate
        rental_request_id: ID of the rental request
        reviewer_id: ID of the user submitting the review
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Get the rental request
    rental_request = db.query(EquipmentRentalRequest).filter(
        EquipmentRentalRequest.id == rental_request_id
    ).first()
    
    if not rental_request:
        return False, "Rental request not found"
    
    # Check if user actually participated in rental
    if reviewer_id not in [rental_request.renter_id, rental_request.owner_id]:
        return False, "You can only review rentals you participated in"
    
    # Check if rental is completed
    if rental_request.status != 'completed':
        return False, "You can only review completed rentals"
    
    # Check if already reviewed
    existing_review = db.query(EquipmentReview).filter(
        and_(
            EquipmentReview.rental_request_id == rental_request_id,
            EquipmentReview.reviewer_id == reviewer_id
        )
    ).first()
    
    if existing_review:
        return False, "You have already reviewed this rental"
    
    # Check rating range
    overall_rating = review_data.get('overall_rating', 0)
    if not (1 <= overall_rating <= 5):
        return False, "Rating must be between 1 and 5"
    
    # Validate optional ratings
    for rating_field in ['equipment_condition_rating', 'communication_rating', 
                        'punctuality_rating', 'value_rating']:
        rating_value = review_data.get(rating_field)
        if rating_value is not None and not (1 <= rating_value <= 5):
            return False, f"{rating_field} must be between 1 and 5"
    
    # Check for inappropriate content (basic filter)
    prohibited_words = ['scam', 'fraud', 'cheat', 'fake', 'stolen']
    comment = review_data.get('comment', '').lower()
    title = review_data.get('title', '').lower()
    
    combined_text = comment + ' ' + title
    if any(word in combined_text for word in prohibited_words):
        return False, "Review contains inappropriate language. Please report issues through proper channels."
    
    return True, "Review validated"


def update_user_trust_score(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Update or create user trust score record
    
    Args:
        db: Database session
        user_id: User ID to update trust score for
    
    Returns:
        Updated trust score data
    """
    from app.models.user_equipment_trust import UserEquipmentTrust
    
    # Calculate new trust score
    trust_scores = calculate_trust_score(db, user_id)
    rating_breakdown = get_user_rating_breakdown(db, user_id)
    
    # Get user details
    user = db.query(User).filter(User.id == user_id).first()
    
    # Get activity metrics
    rentals_as_owner = db.query(EquipmentRentalRequest).filter(
        and_(
            EquipmentRentalRequest.owner_id == user_id,
            EquipmentRentalRequest.status == 'completed'
        )
    ).count()
    
    rentals_as_renter = db.query(EquipmentRentalRequest).filter(
        and_(
            EquipmentRentalRequest.renter_id == user_id,
            EquipmentRentalRequest.status == 'completed'
        )
    ).count()
    
    cancellations = db.query(EquipmentRentalRequest).filter(
        and_(
            or_(
                EquipmentRentalRequest.owner_id == user_id,
                EquipmentRentalRequest.renter_id == user_id
            ),
            EquipmentRentalRequest.status == 'cancelled'
        )
    ).count()
    
    # Count total listings
    from app.models.equipment_listing import EquipmentListing
    total_listings = db.query(EquipmentListing).filter(
        EquipmentListing.owner_id == user_id
    ).count()
    
    # Check if trust record exists
    trust_record = db.query(UserEquipmentTrust).filter(
        UserEquipmentTrust.user_id == user_id
    ).first()
    
    if trust_record:
        # Update existing record
        trust_record.overall_trust_score = trust_scores['overall']
        trust_record.as_owner_rating = rating_breakdown['rating_breakdown'].get('equipment_condition', 0)
        trust_record.as_renter_rating = rating_breakdown['rating_breakdown'].get('value', 0)
        trust_record.total_listings = total_listings
        trust_record.total_rentals_as_owner = rentals_as_owner
        trust_record.total_rentals_as_renter = rentals_as_renter
        trust_record.successful_completions = rentals_as_owner + rentals_as_renter
        trust_record.cancellations = cancellations
        trust_record.identity_verified = user.identity_verification_status == 'verified' if user else False
        trust_record.phone_verified = bool(user.phone) if user else False
        trust_record.equipment_verified_count = db.query(EquipmentListing).filter(
            and_(
                EquipmentListing.owner_id == user_id,
                EquipmentListing.verification_status == 'verified'
            )
        ).count()
    else:
        # Create new record
        trust_record = UserEquipmentTrust(
            user_id=user_id,
            overall_trust_score=trust_scores['overall'],
            as_owner_rating=rating_breakdown['rating_breakdown'].get('equipment_condition', 0),
            as_renter_rating=rating_breakdown['rating_breakdown'].get('value', 0),
            total_listings=total_listings,
            total_rentals_as_owner=rentals_as_owner,
            total_rentals_as_renter=rentals_as_renter,
            successful_completions=rentals_as_owner + rentals_as_renter,
            cancellations=cancellations,
            identity_verified=user.identity_verification_status == 'verified' if user else False,
            phone_verified=bool(user.phone) if user else False,
            equipment_verified_count=db.query(EquipmentListing).filter(
                and_(
                    EquipmentListing.owner_id == user_id,
                    EquipmentListing.verification_status == 'verified'
                )
            ).count()
        )
        db.add(trust_record)
    
    db.commit()
    db.refresh(trust_record)
    
    return {
        'trust_score': trust_scores['overall'],
        'components': trust_scores,
        'rating_breakdown': rating_breakdown,
        'record_id': trust_record.id
    }


def get_trust_badges(db: Session, user_id: int) -> list[str]:
    """
    Get trust badges for a user based on their trust score and activity
    
    Args:
        db: Database session
        user_id: User ID to get badges for
    
    Returns:
        List of badge names
    """
    trust_scores = calculate_trust_score(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    
    badges = []
    
    # Trust score badges
    if trust_scores['overall'] >= 90:
        badges.append('trusted_elite')
    elif trust_scores['overall'] >= 75:
        badges.append('trusted')
    elif trust_scores['overall'] >= 60:
        badges.append('reliable')
    
    # Verification badges
    if user and user.identity_verification_status == 'verified':
        badges.append('identity_verified')
    if user and user.phone:
        badges.append('phone_verified')
    
    # Activity badges
    context = trust_scores.get('context', {})
    if context.get('total_completed', 0) >= 10:
        badges.append('experienced_renter')
    if context.get('rentals_as_owner', 0) >= 10:
        badges.append('experienced_owner')
    
    # Quality badges
    if trust_scores['rating_score'] >= 90:
        badges.append('top_rated')
    
    return badges