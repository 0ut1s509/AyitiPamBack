from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Submission, FactCheck
from .serializers import UserSubmissionSerializer, UserFactCheckSerializer

class UserDashboardView(generics.RetrieveAPIView):
    """
    Get dashboard overview for authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Get user's submissions
        user_submissions = Submission.objects.filter(
            Q(submitter_email=user.email) | Q(submitter_email__iexact=user.email)
        )
        
        # Get fact-checks that might be related to user's submissions
        # This is approximate - we look for fact-checks with similar text/URLs
        user_fact_checks = FactCheck.objects.filter(
            Q(url_submitted__in=user_submissions.values('url_submitted')) |
            Q(title__icontains=user_submissions.values('claim_text'))
        ).distinct()
        
        # Dashboard statistics
        stats = {
            'total_submissions': user_submissions.count(),
            'submissions_last_30_days': user_submissions.filter(
                date_submitted__gte=thirty_days_ago
            ).count(),
            'submissions_in_review': user_submissions.filter(status='in_review').count(),
            'submissions_completed': user_submissions.filter(status='completed').count(),
            'submissions_published': user_fact_checks.count(),
            'completion_rate': round(
                (user_submissions.filter(status='completed').count() / 
                 user_submissions.count() * 100) if user_submissions.count() > 0 else 0
            )
        }
        
        # Recent activity
        recent_submissions = user_submissions.order_by('-date_submitted')[:5]
        
        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'date_joined': user.date_joined
            },
            'stats': stats,
            'recent_submissions': UserSubmissionSerializer(recent_submissions, many=True).data,
            'recent_fact_checks': UserFactCheckSerializer(user_fact_checks.order_by('-date_created')[:3], many=True).data
        })

class UserSubmissionsListView(generics.ListAPIView):
    """
    Get all submissions for authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSubmissionSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Submission.objects.filter(
            Q(submitter_email=user.email) | Q(submitter_email__iexact=user.email)
        ).order_by('-date_submitted')

class UserSubmissionDetailView(generics.RetrieveAPIView):
    """
    Get detailed view of a specific user submission.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSubmissionSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Submission.objects.filter(
            Q(submitter_email=user.email) | Q(submitter_email__iexact=user.email)
        )