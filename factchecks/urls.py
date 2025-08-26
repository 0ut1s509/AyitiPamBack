from django.urls import path
from . import views,authentication,admin_views,user_views,user_dashboard_views
from .admin_views import create_factcheck_from_submission


urlpatterns = [
    # This defines the endpoint 'api/factchecks/' and maps it to our view
    path('api/factchecks/', views.FactCheckListView.as_view(), name='factcheck-list'),
    path('api/submit-claim/', views.SubmitClaimView.as_view(), name='submit-claim'),
    path('api/positive-content/', views.PositiveContentView.as_view(), name='positive-content'), 

    # Authentication endpoints
    path('api/auth/register/', authentication.RegisterView.as_view(), name='register'),
    path('api/auth/login/', authentication.LoginView.as_view(), name='login'),
    path('api/auth/logout/', authentication.LogoutView.as_view(), name='logout'),
    path('api/auth/profile/', authentication.UserProfileView.as_view(), name='profile'),

      # Admin endpoints
    path('api/admin/factchecks/', admin_views.AdminFactCheckListCreateView.as_view(), name='admin-factcheck-list'),
    path('api/admin/factchecks/<int:pk>/', admin_views.AdminFactCheckDetailView.as_view(), name='admin-factcheck-detail'),
    path('api/admin/submissions/', admin_views.AdminSubmissionListView.as_view(), name='admin-submission-list'),
    path('api/admin/submissions/<int:pk>/', admin_views.AdminSubmissionDetailView.as_view(), name='admin-submission-detail'),
    path('api/admin/positive-content/', admin_views.AdminPositiveContentListCreateView.as_view(), name='admin-positive-content-list'),
    path('api/admin/positive-content/<int:pk>/', admin_views.AdminPositiveContentDetailView.as_view(), name='admin-positive-content-detail'),
    path('api/admin/stats/', admin_views.AdminStatsView.as_view(), name='admin-stats'),

     # User management endpoints
    path('api/admin/users/', user_views.AdminUserListView.as_view(), name='admin-user-list'),
    path('api/admin/users/<int:pk>/', user_views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('api/admin/users/<int:pk>/activation/', user_views.AdminUserActivationView.as_view(), name='admin-user-activation'),


      # User dashboard endpoints
    path('api/user/dashboard/', user_dashboard_views.UserDashboardView.as_view(), name='user-dashboard'),
    path('api/user/submissions/', user_dashboard_views.UserSubmissionsListView.as_view(), name='user-submissions'),
    path('api/user/submissions/<int:pk>/', user_dashboard_views.UserSubmissionDetailView.as_view(), name='user-submission-detail'),

        path('api/admin/submissions/<int:submission_id>/create-factcheck/', create_factcheck_from_submission, name='create-factcheck-from-submission'),
]