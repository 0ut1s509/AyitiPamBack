from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from .models import FactCheck, Submission, PositiveContent
from .serializers import FactCheckSerializer, SubmissionSerializer, PositiveContentSerializer,AdminFactCheckSerializer,AdminSubmissionSerializer,AdminPositiveContentSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def create_factcheck_from_submission(request, submission_id):
    """
    Create a fact-check from a submission and update submission status.
    """
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Extract data from submission for the fact-check
    factcheck_data = {
        'title': request.data.get('title', f"Fact-Check: {submission.claim_text[:50]}..." if submission.claim_text else "Fact-Check"),
        'url_submitted': submission.url_submitted,
        'verdict': request.data.get('verdict'),
        'summary': request.data.get('summary', ''),
        'submission': submission.id
    }
    
    # Create the fact-check
    factcheck_serializer = AdminFactCheckSerializer(data=factcheck_data)
    if factcheck_serializer.is_valid():
        factcheck = factcheck_serializer.save()
        
        # Update submission status to completed
        submission.status = 'completed'
        submission.user_notified = False  # Reset for new notification
        submission.save()
        
        # Send notification
        try:
            # Reuse the notification method from earlier
            from .admin_views import AdminSubmissionDetailView
            AdminSubmissionDetailView()._send_notification_email(submission)
        except Exception as e:
            print(f"Notification failed: {e}")
        
        return Response({
            'message': 'Fact-check created successfully',
            'factcheck': factcheck_serializer.data,
            'submission': AdminSubmissionSerializer(submission).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(factcheck_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminFactCheckListCreateView(generics.ListCreateAPIView):
    """
    Admin view to list all fact-checks and create new ones.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = FactCheck.objects.all().order_by('-date_created')
    serializer_class = AdminFactCheckSerializer  # Use the enhanced serializer

class AdminFactCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view to retrieve, update, or delete a specific fact-check.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = FactCheck.objects.all()
    serializer_class = AdminFactCheckSerializer  # Use the enhanced serializer

class AdminSubmissionListView(generics.ListAPIView):
    """
    Admin view to list all user submissions.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = Submission.objects.all().order_by('-date_submitted')
    serializer_class = AdminSubmissionSerializer  # Use the enhanced serializer

class AdminSubmissionDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin view to retrieve or update a specific submission.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = Submission.objects.all()
    serializer_class = AdminSubmissionSerializer  # Use the enhanced serializer



class AdminPositiveContentListCreateView(generics.ListCreateAPIView):
    """
    Admin view to list all positive content and create new ones.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = PositiveContent.objects.all().order_by('-date_created')
    serializer_class = AdminPositiveContentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AdminPositiveContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view to retrieve, update, or delete positive content.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = PositiveContent.objects.all()
    serializer_class = AdminPositiveContentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AdminStatsView(generics.GenericAPIView):
    """
    Admin view to get dashboard statistics.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = {
            'total_factchecks': FactCheck.objects.count(),
            'total_submissions': Submission.objects.count(),
            'pending_submissions': Submission.objects.filter(status='new').count(),
            'total_positive_content': PositiveContent.objects.count(),
            'published_positive_content': PositiveContent.objects.filter(is_published=True).count(),
            'total_users': User.objects.count(),
            'staff_users': User.objects.filter(is_staff=True).count(),
        }
        return Response(stats)