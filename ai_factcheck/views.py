# ai_factcheck/views.py
import json
import time
import logging
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from factchecks.models import Submission
from .models import AIAnalysis
from .serializers import AIAnalysisSerializer
from django.core.cache import cache


# Import the OpenAI library
from openai import OpenAI
from openai import APITimeoutError, APIError  # For specific error handling

logger = logging.getLogger(__name__)

def validate_ai_response(ai_data):
    """Validate the structure of the AI response"""
    if not isinstance(ai_data, dict):
        return False
    
    required_fields = ['confidence_score', 'suggested_verdict', 'evidence', 'similar_claims']
    if not all(field in ai_data for field in required_fields):
        return False
    
    # Validate verdict options
    valid_verdicts = ['true', 'false', 'misleading', 'unverifiable']
    if ai_data.get('suggested_verdict') not in valid_verdicts:
        return False
    
    # Validate confidence score
    confidence = ai_data.get('confidence_score', 0)
    if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
        return False
    
    return True



@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def process_submission_ai(request, submission_id):
    """Process a submission with AI"""
    try:
        submission = Submission.objects.get(id=submission_id)
        
        # Check if we already have an analysis for this submission
        existing_analysis = AIAnalysis.objects.filter(submission=submission).first()
        if existing_analysis:
            return Response(
                AIAnalysisSerializer(existing_analysis).data,
                status=status.HTTP_200_OK
            )
        
        logger.info(f"Starting AI analysis for submission {submission_id}")
        
        # Call AI service using OpenAI API
        start_time = time.time()
        
        # Prepare the prompt for fact-checking - handle null context
        context_text = submission.context if submission.context else 'No additional context provided'
        
        prompt = f"""
As a fact-checking assistant for Ayiti Vérité, analyze this claim about Haiti:

CLAIM: "{submission.claim_text}"

CONTEXT: {context_text}

Please provide a JSON response with this exact structure:
{{
    "confidence_score": 0.85,  # Number between 0-1
    "suggested_verdict": "true",  # One of: "true", "false", "misleading", "unverifiable"
    "evidence": [
        "Source or reasoning 1",
        "Source or reasoning 2"
    ],
    "similar_claims": [
        "Brief description of similar claim 1",
        "Brief description of similar claim 2"
    ]
}}

Focus on Haitian context and available evidence. If uncertain, use "unverifiable".
"""
        
        # Initialize the OpenAI client with the API key from settings
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        try:
            # Use GPT-4o which is available and more powerful than GPT-4
            response = client.chat.completions.create(
                model="gpt-4o",  # Using GPT-4o
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # Low temperature for more factual responses
                max_tokens=1000,
                timeout=30  # 30 second timeout
            )
            
            processing_time = time.time() - start_time
            
            # Extract the response content directly from the structured object
            ai_response = response.choices[0].message.content
            
            # Parse the AI response
            try:
                # Extract JSON from the response (AI might add text around JSON)
                json_start = ai_response.find('{')
                json_end = ai_response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = ai_response[json_start:json_end]
                    ai_data = json.loads(json_str)
                else:
                    raise json.JSONDecodeError("No JSON found", ai_response, 0)
                    
                # Validate the response structure
                if not validate_ai_response(ai_data):
                    raise ValueError("Invalid AI response structure")
                    
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse AI response: {e}")
                # Fallback response
                ai_data = {
                    "confidence_score": 0.5,
                    "suggested_verdict": "unverifiable",
                    "evidence": ["Could not parse AI response properly"],
                    "similar_claims": []
                }
            
            # Save AI analysis
            ai_analysis = AIAnalysis.objects.create(
                submission=submission,
                claim_extracted=submission.claim_text,
                confidence_score=ai_data.get('confidence_score', 0.5),
                suggested_verdict=ai_data.get('suggested_verdict', 'unverifiable'),
                evidence_sources=ai_data.get('evidence', []),
                similar_claims=ai_data.get('similar_claims', []),
                processing_time=processing_time,
                ai_model_used="gpt-4o"  # Updated model name
            )
            
            logger.info(f"AI analysis completed in {processing_time:.2f}s with confidence {ai_data.get('confidence_score', 0)}")
            
            # Set rate limit cache
            cache.set(cache_key, True, timeout=30)
            
            return Response(AIAnalysisSerializer(ai_analysis).data)
        
        except APITimeoutError:
            logger.error("AI API request timed out")
            return Response(
                {"error": "AI service timeout"}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except APIError as e:
            logger.error(f"OpenAI API error: {e}")
            
            # Handle specific error types
            error_message = "AI service error"
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            
            if "insufficient_quota" in str(e):
                error_message = "AI service quota exceeded. Please check your OpenAI billing."
                status_code = status.HTTP_402_PAYMENT_REQUIRED
            elif "model_not_found" in str(e):
                error_message = "AI model not available. Please check your OpenAI account settings."
            
            return Response(
                {"error": error_message}, 
                status=status_code
            )
            
    except Submission.DoesNotExist:
        return Response(
            {"error": "Submission not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


    

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_ai_analysis(request, submission_id):
    """Get AI analysis for a submission"""
    try:
        submission = Submission.objects.get(id=submission_id)
        analysis = AIAnalysis.objects.filter(submission=submission).order_by('-created_at').first()
        
        if analysis:
            return Response(AIAnalysisSerializer(analysis).data)
        else:
            return Response(
                {"error": "No AI analysis found for this submission"},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Submission.DoesNotExist:
        return Response(
            {"error": "Submission not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )