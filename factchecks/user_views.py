from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from django.db.models import Q
from .serializers import UserSerializer, UserDetailSerializer

class AdminUserListView(generics.ListAPIView):
    """
    Admin view to list all users with search and filtering.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Search functionality
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(
                Q(username__icontains=search_term) |
                Q(email__icontains=search_term) |
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term)
            )
        
        # Filter by staff status
        is_staff = self.request.query_params.get('is_staff', None)
        if is_staff is not None:
            if is_staff.lower() == 'true':
                queryset = queryset.filter(is_staff=True)
            elif is_staff.lower() == 'false':
                queryset = queryset.filter(is_staff=False)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        return queryset

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin view to retrieve, update, or deactivate a specific user.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    
    def perform_update(self, serializer):
        # Prevent admins from demoting themselves
        user = self.get_object()
        if user == self.request.user and 'is_staff' in serializer.validated_data:
            if not serializer.validated_data['is_staff']:
                raise serializers.ValidationError("You cannot remove your own admin privileges.")
        serializer.save()

class AdminUserActivationView(generics.UpdateAPIView):
    """
    Admin view to activate/deactivate users.
    Only accessible by admin users.
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    
    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent deactivating yourself
        if user == request.user and not request.data.get('is_active', True):
            return Response(
                {'error': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().patch(request, *args, **kwargs)
    


# class AdminUserImpersonateView(APIView):
#     permission_classes = [IsAdminUser]
    
#     def post(self, request, pk):
#         user = get_object_or_404(User, pk=pk)
#         # Store original user ID in session
#         request.session['original_user'] = request.user.id
#         # Log in as the target user
#         login(request, user)
#         return Response({'message': f'Impersonating {user.username}'})

# class AdminUserStopImpersonateView(APIView):
#     permission_classes = [IsAdminUser]
    
#     def post(self, request):
#         original_user_id = request.session.pop('original_user', None)
#         if original_user_id:
#             original_user = get_object_or_404(User, pk=original_user_id)
#             login(request, original_user)
#             return Response({'message': 'Stopped impersonation'})
#         return Response({'error': 'Not impersonating'}, status=400)