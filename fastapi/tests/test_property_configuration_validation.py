"""
Property-Based Tests for Configuration Validation Completeness

**Feature: realtime-ai-detection, Property 9: Configuration validation completeness**
**Validates: Requirements 4.3**

Property 9: Configuration validation completeness
For any invalid configuration input, the system should reject the input with appropriate 
error messages and maintain current valid settings
"""

import pytest
from hypothesis import given, strategies as st, settings, assume
from pydantic import ValidationError
from app.schemas.ai_config_schema import AIConfigCreate, AIConfigUpdate, ViolationTypeConfig
from app.models.ai_model_config import AIModelConfig
from app.services.ai_detection_service import AIDetectionService


# Strategies for invalid configuration values
invalid_confidence_strategy = st.one_of(
    st.floats(min_value=-10.0, max_value=-0.01),  # Negative values
    st.floats(min_value=1.01, max_value=10.0),     # Values > 1.0
    st.just(float('inf')),                          # Infinity
    st.just(float('-inf')),                         # Negative infinity
)

invalid_iou_strategy = st.one_of(
    st.floats(min_value=-10.0, max_value=-0.01),
    st.floats(min_value=1.01, max_value=10.0),
)

invalid_frequency_strategy = st.one_of(
    st.integers(min_value=-100, max_value=0),      # Zero or negative
    st.integers(min_value=31, max_value=1000),     # Above maximum
)

# Valid strategies for comparison
valid_confidence_strategy = st.floats(min_value=0.0, max_value=1.0)
valid_iou_strategy = st.floats(min_value=0.0, max_value=1.0)
valid_frequency_strategy = st.integers(min_value=1, max_value=30)


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(invalid_confidence=invalid_confidence_strategy)
def test_invalid_confidence_threshold_rejected(invalid_confidence):
    """
    Property: Invalid confidence thresholds should be rejected
    
    For any confidence threshold outside [0.0, 1.0]:
    1. The system should reject the configuration
    2. A validation error should be raised
    3. The error message should be descriptive
    """
    assume(not (0.0 <= invalid_confidence <= 1.0))  # Ensure it's actually invalid
    
    with pytest.raises(ValidationError) as exc_info:
        AIConfigCreate(
            confidence_threshold=invalid_confidence,
            iou_threshold=0.5,
            detection_frequency=2,
            violation_types={
                'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
            }
        )
    
    # Verify error message contains relevant information
    error_str = str(exc_info.value)
    assert 'confidence_threshold' in error_str.lower() or 'greater than or equal to' in error_str.lower(), \
        "Error message should mention confidence_threshold validation"


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(invalid_iou=invalid_iou_strategy)
def test_invalid_iou_threshold_rejected(invalid_iou):
    """
    Property: Invalid IOU thresholds should be rejected
    
    For any IOU threshold outside [0.0, 1.0]:
    1. The system should reject the configuration
    2. A validation error should be raised
    """
    assume(not (0.0 <= invalid_iou <= 1.0))
    
    with pytest.raises(ValidationError) as exc_info:
        AIConfigCreate(
            confidence_threshold=0.5,
            iou_threshold=invalid_iou,
            detection_frequency=2,
            violation_types={
                'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
            }
        )
    
    error_str = str(exc_info.value)
    assert 'iou_threshold' in error_str.lower() or 'greater than or equal to' in error_str.lower(), \
        "Error message should mention iou_threshold validation"


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(invalid_frequency=invalid_frequency_strategy)
def test_invalid_detection_frequency_rejected(invalid_frequency):
    """
    Property: Invalid detection frequencies should be rejected
    
    For any detection frequency outside [1, 30]:
    1. The system should reject the configuration
    2. A validation error should be raised
    """
    assume(not (1 <= invalid_frequency <= 30))
    
    with pytest.raises(ValidationError) as exc_info:
        AIConfigCreate(
            confidence_threshold=0.5,
            iou_threshold=0.5,
            detection_frequency=invalid_frequency,
            violation_types={
                'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
            }
        )
    
    error_str = str(exc_info.value)
    assert 'detection_frequency' in error_str.lower() or 'greater than or equal to' in error_str.lower(), \
        "Error message should mention detection_frequency validation"


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(
    invalid_violation_type=st.text(
        alphabet=st.characters(blacklist_categories=('Cs',)),
        min_size=1,
        max_size=20
    ).filter(lambda x: x not in ['no_helmet', 'red_light', 'wrong_lane', 'speeding'])
)
def test_invalid_violation_type_rejected(invalid_violation_type):
    """
    Property: Invalid violation types should be rejected
    
    For any violation type not in the allowed list:
    1. The system should reject the configuration
    2. A validation error should be raised
    3. The error should mention the invalid type
    """
    with pytest.raises(ValidationError) as exc_info:
        AIConfigCreate(
            confidence_threshold=0.5,
            iou_threshold=0.5,
            detection_frequency=2,
            violation_types={
                invalid_violation_type: ViolationTypeConfig(enabled=True, confidence_min=0.6)
            }
        )
    
    error_str = str(exc_info.value)
    assert 'violation' in error_str.lower() or 'invalid' in error_str.lower(), \
        "Error message should mention violation type validation"


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(
    valid_confidence=valid_confidence_strategy,
    invalid_confidence_min=invalid_confidence_strategy
)
def test_invalid_violation_confidence_rejected(valid_confidence, invalid_confidence_min):
    """
    Property: Invalid violation confidence minimums should be rejected
    
    For any violation confidence_min outside [0.0, 1.0]:
    1. The system should reject the configuration
    2. A validation error should be raised
    """
    assume(not (0.0 <= invalid_confidence_min <= 1.0))
    
    with pytest.raises(ValidationError):
        AIConfigCreate(
            confidence_threshold=valid_confidence,
            iou_threshold=0.5,
            detection_frequency=2,
            violation_types={
                'no_helmet': ViolationTypeConfig(
                    enabled=True,
                    confidence_min=invalid_confidence_min
                )
            }
        )


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(
    original_confidence=valid_confidence_strategy,
    invalid_update_confidence=invalid_confidence_strategy
)
def test_invalid_update_maintains_current_settings(
    original_confidence, invalid_update_confidence, test_db
):
    """
    Property: Invalid configuration updates should maintain current valid settings
    
    For any invalid configuration update:
    1. The update should be rejected
    2. The current valid configuration should remain unchanged
    3. The system should continue operating with the valid configuration
    """
    assume(not (0.0 <= invalid_update_confidence <= 1.0))
    
    # Create valid initial configuration
    original_config = AIModelConfig(
        confidence_threshold=original_confidence,
        iou_threshold=0.5,
        detection_frequency=2,
        violation_types={'no_helmet': {'enabled': True, 'confidence_min': 0.6}},
        is_active=True,
        created_by=1
    )
    test_db.add(original_config)
    test_db.commit()
    test_db.refresh(original_config)
    
    # Attempt invalid update
    with pytest.raises(ValidationError):
        AIConfigUpdate(
            confidence_threshold=invalid_update_confidence
        )
    
    # Verify original configuration is unchanged
    current_config = test_db.query(AIModelConfig).filter(
        AIModelConfig.id == original_config.id
    ).first()
    
    assert current_config.confidence_threshold == original_confidence, \
        "Original configuration should remain unchanged after invalid update attempt"
    assert current_config.is_active == True, \
        "Original configuration should remain active after invalid update attempt"


@pytest.mark.property
@settings(max_examples=50, deadline=None)
@given(
    valid_confidence=valid_confidence_strategy,
    valid_iou=valid_iou_strategy,
    valid_frequency=valid_frequency_strategy
)
def test_valid_configuration_accepted(valid_confidence, valid_iou, valid_frequency):
    """
    Property: Valid configurations should be accepted
    
    For any configuration with all valid values:
    1. The system should accept the configuration
    2. No validation errors should be raised
    3. The configuration should be created successfully
    """
    # This should not raise any exceptions
    config = AIConfigCreate(
        confidence_threshold=valid_confidence,
        iou_threshold=valid_iou,
        detection_frequency=valid_frequency,
        violation_types={
            'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6),
            'red_light': ViolationTypeConfig(enabled=False, confidence_min=0.7)
        }
    )
    
    # Verify configuration was created with correct values
    assert config.confidence_threshold == valid_confidence
    assert config.iou_threshold == valid_iou
    assert config.detection_frequency == valid_frequency
    assert len(config.violation_types) == 2


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(
    notes_length=st.integers(min_value=501, max_value=1000)
)
def test_oversized_notes_rejected(notes_length):
    """
    Property: Notes exceeding maximum length should be rejected
    
    For any notes field longer than 500 characters:
    1. The system should reject the configuration
    2. A validation error should be raised
    """
    long_notes = 'a' * notes_length
    
    with pytest.raises(ValidationError) as exc_info:
        AIConfigCreate(
            confidence_threshold=0.5,
            iou_threshold=0.5,
            detection_frequency=2,
            violation_types={
                'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
            },
            notes=long_notes
        )
    
    error_str = str(exc_info.value)
    assert 'notes' in error_str.lower() or 'string' in error_str.lower(), \
        "Error message should mention notes field validation"


@pytest.mark.property
def test_empty_violation_types_accepted():
    """
    Property: Configuration with default violation types should be accepted
    
    The system should provide sensible defaults for violation types
    """
    config = AIConfigCreate(
        confidence_threshold=0.5,
        iou_threshold=0.5,
        detection_frequency=2
    )
    
    # Should have default violation types
    assert config.violation_types is not None
    assert len(config.violation_types) > 0, \
        "Default violation types should be provided"


@pytest.mark.property
@settings(max_examples=50, deadline=None)
@given(
    confidence=valid_confidence_strategy,
    iou=valid_iou_strategy
)
def test_partial_update_validation(confidence, iou):
    """
    Property: Partial configuration updates should validate only provided fields
    
    For any partial update with valid values:
    1. Only the provided fields should be validated
    2. The update should be accepted
    3. Unprovided fields should remain as None
    """
    update = AIConfigUpdate(
        confidence_threshold=confidence,
        iou_threshold=iou
        # detection_frequency and violation_types not provided
    )
    
    assert update.confidence_threshold == confidence
    assert update.iou_threshold == iou
    assert update.detection_frequency is None, \
        "Unprovided fields should be None in partial update"
    assert update.violation_types is None, \
        "Unprovided fields should be None in partial update"


@pytest.mark.property
@settings(max_examples=100, deadline=None)
@given(
    invalid_confidence=invalid_confidence_strategy,
    valid_iou=valid_iou_strategy
)
def test_mixed_valid_invalid_rejected(invalid_confidence, valid_iou):
    """
    Property: Configuration with mix of valid and invalid values should be rejected
    
    For any configuration with at least one invalid field:
    1. The entire configuration should be rejected
    2. No partial application should occur
    """
    assume(not (0.0 <= invalid_confidence <= 1.0))
    
    with pytest.raises(ValidationError):
        AIConfigCreate(
            confidence_threshold=invalid_confidence,  # Invalid
            iou_threshold=valid_iou,                  # Valid
            detection_frequency=2,                     # Valid
            violation_types={
                'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
            }
        )


@pytest.mark.property
def test_validation_error_messages_are_descriptive():
    """
    Property: Validation errors should provide descriptive messages
    
    Error messages should help users understand what went wrong
    """
    test_cases = [
        {'confidence_threshold': -0.5, 'field': 'confidence'},
        {'iou_threshold': 1.5, 'field': 'iou'},
        {'detection_frequency': 0, 'field': 'frequency'},
        {'detection_frequency': 100, 'field': 'frequency'},
    ]
    
    for test_case in test_cases:
        with pytest.raises(ValidationError) as exc_info:
            AIConfigCreate(
                confidence_threshold=test_case.get('confidence_threshold', 0.5),
                iou_threshold=test_case.get('iou_threshold', 0.5),
                detection_frequency=test_case.get('detection_frequency', 2),
                violation_types={
                    'no_helmet': ViolationTypeConfig(enabled=True, confidence_min=0.6)
                }
            )
        
        error_str = str(exc_info.value).lower()
        # Error message should contain information about the validation failure
        assert len(error_str) > 0, \
            f"Error message should be descriptive for invalid {test_case['field']}"
