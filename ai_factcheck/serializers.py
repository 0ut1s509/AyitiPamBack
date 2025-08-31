from rest_framework import serializers
from .models import AIAnalysis

class AIAnalysisSerializer(serializers.ModelSerializer):
    submission_id = serializers.IntegerField(source='submission.id', read_only=True)
    claim_text = serializers.CharField(source='submission.claim_text', read_only=True)
    
    class Meta:
        model = AIAnalysis
        fields = [
            'id', 'submission_id', 'claim_text', 'claim_extracted',
            'confidence_score', 'suggested_verdict', 'evidence_sources',
            'similar_claims', 'processing_time', 'ai_model_used', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']