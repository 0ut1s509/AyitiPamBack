# ai_factcheck/admin.py
from django.contrib import admin
from .models import AIAnalysis

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'submission', 'suggested_verdict', 'confidence_score', 'created_at']
    list_filter = ['suggested_verdict', 'created_at']
    search_fields = ['submission__claim_text', 'claim_extracted']
    readonly_fields = ['created_at']