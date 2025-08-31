from django.db import models

# Create your models here.

class FactCheck(models.Model):
    # Database field for the title of the fact-check
    title = models.CharField(max_length=200)

    submission = models.ForeignKey(
        'Submission', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='fact_checks'
    )
    
    # Database field for the URL being checked. 'blank=True' allows it to be empty in forms.
    url_submitted = models.URLField(max_length=500, blank=True)
    
    # Database field for the final verdict (True, False, Mixture, etc.)
    VERDICT_CHOICES = [
        ('True', 'True'),
        ('Mostly True', 'Mostly True'),
        ('Mixture', 'Mixture'),
        ('Mostly False', 'Mostly False'),
        ('False', 'False'),
        ('Unverifiable', 'Unverifiable'),
    ]
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES)
    
    # Database field for a detailed summary of the fact-check
    summary = models.TextField()
    
    # Database fields to automatically track when a record is created or updated
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    
    # This will make it easier to identify objects in the Django admin later
    def __str__(self):
        return self.title
    



# factchecks/models.py
class Submission(models.Model):
    # Database field for the user's name (optional)
    submitter_name = models.CharField(max_length=100, blank=True)
    
    # Database field for the user's email (optional)
    submitter_email = models.EmailField(blank=True)
    
    # Database field for the claim text (if user doesn't submit a URL)
    claim_text = models.TextField(blank=True)
    
    # Database field for additional context about the claim
    context = models.TextField(blank=True, null=True)  # Add this field
    
    # Database field for the URL being submitted (if user doesn't submit text)
    url_submitted = models.URLField(max_length=500, blank=True)
    
    # Database field to track the status of the submission
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_review', 'In Review'),
        ('completed', 'Fact-Check Completed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Database fields to automatically track when a submission is created
    date_submitted = models.DateTimeField(auto_now_add=True)

    # NEW FIELDS FOR NOTIFICATION TRACKING
    user_notified = models.BooleanField(default=False)
    date_notified = models.DateTimeField(blank=True, null=True)

    # String representation for the admin panel
    def __str__(self):
        source = self.url_submitted if self.url_submitted else self.claim_text[:50] + "..."
        return f"Submission by {self.submitter_name or 'Anonymous'}: {source}"







class PositiveContent(models.Model):
    # Database field for the title of the positive story
    title = models.CharField(max_length=200)
    
    # Database field for the content type
    CONTENT_TYPES = [
        ('culture', 'Culture & Arts'),
        ('innovation', 'Innovation & Technology'),
        ('community', 'Community Initiatives'),
        ('nature', 'Nature & Tourism'),
        ('achievement', 'Achievements & Success'),
    ]
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    
    # Database field for the main content
    description = models.TextField()

    image = models.ImageField(upload_to='positive_content/', blank=True, null=True)
    
    # Database field for an optional image URL
    image_url = models.URLField(max_length=500, blank=True)
    
    # Database field for an optional source URL
    source_url = models.URLField(max_length=500, blank=True)
    
    # Database fields to automatically track dates
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    
    # Field to control visibility/publishing
    is_published = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_content_type_display()})"