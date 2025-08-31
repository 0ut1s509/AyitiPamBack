# ai_factcheck/models.py
from django.db import models
from factchecks.models import Submission

class AIAnalysis(models.Model):
    VERDICT_CHOICES = [
        ('true', 'True'),
        ('false', 'False'),
        ('misleading', 'Misleading'),
        ('unverifiable', 'Unverifiable'),
    ]
    
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='ai_analyses')
    claim_extracted = models.TextField()
    confidence_score = models.FloatField(default=0.0)  # 0-1 confidence level
    suggested_verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='unverifiable')
    evidence_sources = models.JSONField(default=list)  # URLs and snippets
    similar_claims = models.JSONField(default=list)  # Previously checked similar claims
    processing_time = models.FloatField(default=0.0)  # Time taken in seconds
    ai_model_used = models.CharField(max_length=100, default='gpt-4')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'AI Analyses'

    def __str__(self):
        return f"AI Analysis for Submission #{self.submission.id}"