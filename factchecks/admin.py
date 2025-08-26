from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import FactCheck,Submission,PositiveContent # Import our model
# Register your models here.
@admin.register(FactCheck)
class FactCheckAdmin(admin.ModelAdmin):
    """
    This class customizes how the FactCheck model is displayed in the admin panel.
    """
    # This defines which fields are shown in the list view of the admin panel
    list_display = ('title', 'verdict', 'date_created')
    # This adds a filter sidebar to easily filter fact-checks by their verdict
    list_filter = ('verdict',)
    # This adds a search box, allowing you to search by the 'title' field
    search_fields = ('title',)








@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """
    Admin panel customization for Submission model.
    """
    list_display = ('__str__', 'status', 'date_submitted')
    list_filter = ('status', 'date_submitted')
    search_fields = ('claim_text', 'url_submitted', 'submitter_name')




@admin.register(PositiveContent)
class PositiveContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'image_preview', 'is_published', 'date_created')
    list_filter = ('content_type', 'is_published', 'date_created')
    list_editable = ('is_published',)  # Quick publish/unpublish from list view
    search_fields = ('title', 'description')
    readonly_fields = ('image_preview',)  # Make the preview read-only in detail view
    
    # Fields to display in the detail/edit form
    fieldsets = (
        (None, {
            'fields': ('title', 'content_type', 'description')
        }),
        ('Media', {
            'fields': ('image', 'image_preview', 'image_url'),
            'description': 'You can either upload an image or provide an external image URL. Uploaded images take precedence.'
        }),
        ('Additional Information', {
            'fields': ('source_url', 'is_published'),
            'classes': ('collapse',)  # Makes this section collapsible
        }),
    )
    
    def image_preview(self, obj):
        """
        Display a thumbnail preview of the image in the admin list view.
        """
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 50px; height: 50px; object-fit: cover;" />')
        elif obj.image_url:
            return mark_safe(f'<img src="{obj.image_url}" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.style.display=\'none\'" />')
        return "No image"
    
    image_preview.short_description = 'Image Preview'
    
    # Optional: Add helpful text to the form fields
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['image_url'].help_text = 'Optional: URL to an external image if you don\'t want to upload one'
        form.base_fields['source_url'].help_text = 'Optional: URL to the original source/article'
        return form