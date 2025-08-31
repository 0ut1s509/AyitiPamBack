from django.urls import path
from . import views

urlpatterns = [
    path('api/ai/process-submission/<int:submission_id>/', views.process_submission_ai, name='process-submission-ai'),
    path('api/ai/analysis/<int:submission_id>/', views.get_ai_analysis, name='get-ai-analysis'),
]