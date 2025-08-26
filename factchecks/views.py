from rest_framework import generics, status # Add status to the import
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import FactCheck, Submission,PositiveContent # Import the new Submission model
from .serializers import FactCheckSerializer, SubmissionSerializer,PositiveContentSerializer # Import the new serializer
from rest_framework.permissions import IsAuthenticated


class FactCheckListView(generics.ListAPIView):
    """
    API view to list all fact-checks.
    This will handle a GET request and return a list of all FactCheck objects.
    """
    queryset = FactCheck.objects.all() # This gets all objects from the FactCheck table
    serializer_class = FactCheckSerializer # This tells the view to use our serializer






class SubmitClaimView(APIView):
    """
    API view for users to submit new claims for fact-checking.
    Handles POST requests.
    """
    permission_classes = [IsAuthenticated]  # Add this line - requires login
    
    def post(self, request, format=None):
        # Automatically use the logged-in user's information
        user = request.user
        
        # Create submission data from user and request
        submission_data = {
            'submitter_name': user.get_full_name() or user.username,
            'submitter_email': user.email,
            'claim_text': request.data.get('claim_text', ''),
            'url_submitted': request.data.get('url_submitted', ''),
            'status': 'new'
        }
        
        # Pass the user's data from the request to the serializer
        serializer = SubmissionSerializer(data=submission_data)
        
        # Check if the data is valid
        if serializer.is_valid():
            # Save the valid data to the database
            serializer.save()
            # Return a success response with the saved data
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If the data is invalid, return an error response with details
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






class PositiveContentView(generics.ListAPIView):
    """
    API view to list published positive content about Haiti.
    """
    queryset = PositiveContent.objects.filter(is_published=True)
    serializer_class = PositiveContentSerializer
    
    def get_serializer_context(self):
        """
        Pass the request object to the serializer context.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context