from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import FactCheck,Submission, PositiveContent
from django.conf import settings


class FactCheckSerializer(serializers.ModelSerializer):
    """
    This serializer translates the FactCheck model into JSON format.
    It will also handle validating any data we want to send back to the model.
    """
    class Meta:
        model = FactCheck # The model we want to serialize
        fields = '__all__' # This means "include all fields from the model"
        # The fields we defined in the model (title, url, verdict, etc.) will automatically be included.




class AdminFactCheckSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for admin interface with additional computed fields.
    """
    # Add computed fields for admin convenience
    is_recent = serializers.SerializerMethodField()
    verdict_display = serializers.CharField(source='get_verdict_display', read_only=True)
    
    class Meta:
        model = FactCheck
        fields = '__all__'
    
    def get_is_recent(self, obj):
        """Check if the fact-check was created in the last 7 days"""
        from django.utils.timezone import now
        from datetime import timedelta
        return obj.date_created > now() - timedelta(days=7)


class SubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Submission model.
    """
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ('status', 'date_submitted')

class AdminSubmissionSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for admin interface with additional computed fields.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_recent = serializers.SerializerMethodField()
    has_url = serializers.SerializerMethodField()
    has_text = serializers.SerializerMethodField()
    fact_checks = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ('date_submitted',)
    
    def get_is_recent(self, obj):
        """Check if the submission was created in the last 24 hours"""
        from django.utils.timezone import now
        from datetime import timedelta
        return obj.date_submitted > now() - timedelta(hours=24)
    
    def get_has_url(self, obj):
        """Check if the submission has a URL"""
        return bool(obj.url_submitted)
    
    def get_has_text(self, obj):
        """Check if the submission has claim text"""
        return bool(obj.claim_text)
    
    def get_fact_checks(self, obj):
        """Get related fact-checks for this submission"""
        from .models import FactCheck
        fact_checks = FactCheck.objects.filter(submission=obj)
        return [
            {
                'id': fc.id,
                'title': fc.title,
                'verdict': fc.verdict,
                'date_created': fc.date_created
            }
            for fc in fact_checks
        ]


class PositiveContentSerializer(serializers.ModelSerializer):
    """
    Serializer for the PositiveContent model.
    """
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    image_url_full = serializers.SerializerMethodField()  # Add this field
    
    class Meta:
        model = PositiveContent
        fields = '__all__'
    
    def get_image_url_full(self, obj):
        """
        Return the full URL for the image, whether it's uploaded or from image_url field.
        """
        if obj.image:
            # Build absolute URL for uploaded image
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback for cases where request is not available
            return f"http://localhost:8000{obj.image.url}"  # Adjust if needed
        elif obj.image_url:
            # Return the external URL directly
            return obj.image_url
        return None
    

class AdminPositiveContentSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for admin interface with additional computed fields.
    """
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    image_url_full = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()
    has_image = serializers.SerializerMethodField()
    
    class Meta:
        model = PositiveContent
        fields = '__all__'
    
    def get_image_url_full(self, obj):
        """
        Return the full URL for the image, whether it's uploaded or from image_url field.
        """
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://localhost:8000{obj.image.url}"
        elif obj.image_url:
            return obj.image_url
        return None
    
    def get_is_recent(self, obj):
        """Check if the content was created in the last 7 days"""
        from django.utils.timezone import now
        from datetime import timedelta
        return obj.date_created > now() - timedelta(days=7)
    
    def get_has_image(self, obj):
        """Check if the content has any image"""
        return bool(obj.image or obj.image_url)
    

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user listing with basic information.
    """
    full_name = serializers.SerializerMethodField()
    is_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'is_staff', 'is_active', 'date_joined', 
                 'last_login', 'is_current_user')
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_is_current_user(self, obj):
        request = self.context.get('request')
        return request and request.user == obj

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for user management with write capabilities.
    """
    full_name = serializers.SerializerMethodField()
    is_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'is_staff', 'is_active', 'date_joined', 
                 'last_login', 'is_current_user')
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_current_user')
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_is_current_user(self, obj):
        request = self.context.get('request')
        return request and request.user == obj
    
    def validate_email(self, value):
        # Check for unique email excluding current user
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def update(self, instance, validated_data):
        # Handle password update separately if needed
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class CreateUserSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users from admin.
    """
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 
                 'password', 'is_staff', 'is_active')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value





class UserSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for user's own submissions with detailed status.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_since_submission = serializers.SerializerMethodField()
    has_related_factcheck = serializers.SerializerMethodField()
    related_factcheck_id = serializers.SerializerMethodField()  # Add this line
    related_factcheck_title = serializers.SerializerMethodField()  # Add this line
    
    class Meta:
        model = Submission
        fields = ('id', 'claim_text', 'url_submitted', 'status', 'status_display',
                 'date_submitted', 'days_since_submission', 'has_related_factcheck',
                 'related_factcheck_id', 'related_factcheck_title', 'user_notified')
        read_only_fields = fields
    
    def get_days_since_submission(self, obj):
        from django.utils.timezone import now
        if obj.date_submitted:
            return (now() - obj.date_submitted).days
        return None
    
    def get_has_related_factcheck(self, obj):
        # Check if there's a fact-check that might be related to this submission
        from .models import FactCheck
        return FactCheck.objects.filter(submission=obj).exists()
    
    def get_related_factcheck_id(self, obj):
        # Get the ID of the related fact-check
        from .models import FactCheck
        fact_check = FactCheck.objects.filter(submission=obj).first()
        return fact_check.id if fact_check else None
    
    def get_related_factcheck_title(self, obj):
        # Get the title of the related fact-check
        from .models import FactCheck
        fact_check = FactCheck.objects.filter(submission=obj).first()
        return fact_check.title if fact_check else None

    

class UserFactCheckSerializer(serializers.ModelSerializer):
    """
    Serializer for fact-checks that might be related to user submissions.
    """
    verdict_display = serializers.CharField(source='get_verdict_display', read_only=True)
    days_since_publication = serializers.SerializerMethodField()
    
    class Meta:
        model = FactCheck
        fields = ('id', 'title', 'verdict', 'verdict_display', 'summary',
                 'date_created', 'days_since_publication', 'url_submitted')
        read_only_fields = fields
    
    def get_days_since_publication(self, obj):
        from django.utils.timezone import now
        if obj.date_created:
            return (now() - obj.date_created).days
        return None