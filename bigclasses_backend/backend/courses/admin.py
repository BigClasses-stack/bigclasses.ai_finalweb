from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Course, Overview, Highlight, Module, Topic

class OverviewInline(admin.StackedInline):
    model = Overview
    can_delete = False
    verbose_name_plural = 'Overview'

class HighlightInline(admin.TabularInline):
    model = Highlight
    extra = 1

class TopicInline(admin.TabularInline):
    model = Topic
    extra = 1

class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course']
    inlines = [TopicInline]

class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 
        'slug', 
        'students_enrolled', 
        'rating', 
        'duration',
        'curriculum_file_status',
        'file_uploaded_date'
    ]
    list_filter = ['level', 'rating', 'file_uploaded_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [OverviewInline, HighlightInline]
    
    # Organize fields in fieldsets for better admin interface
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'image')
        }),
        ('Course Details', {
            'fields': ('students_enrolled', 'duration', 'level', 'rating', 'modules_count')
        }),
        ('Curriculum File', {
            'fields': ('curriculum_file',),
            'description': 'Upload curriculum file (PDF, DOC, PPT, etc.)'
        }),
    )
    
    # Make slug read-only if you want it auto-generated
    readonly_fields = ['file_uploaded_at']
    
    def curriculum_file_status(self, obj):
        """Display curriculum file status in admin list"""
        if obj.curriculum_file:
            file_url = obj.curriculum_file.url
            file_name = obj.get_curriculum_filename()
            file_ext = obj.get_file_extension()
            
            # Different icons for different file types
            if file_ext == '.pdf':
                icon = '📄'
            elif file_ext in ['.doc', '.docx']:
                icon = '📝'
            elif file_ext in ['.ppt', '.pptx']:
                icon = '📊'
            elif file_ext in ['.txt']:
                icon = '📃'
            else:
                icon = '📁'
            
            return format_html(
                '{} <a href="{}" target="_blank" title="{}">View File</a>',
                icon,
                file_url,
                file_name
            )
        return format_html('<span style="color: #999;">No file uploaded</span>')
    
    curriculum_file_status.short_description = 'Curriculum File'
    curriculum_file_status.admin_order_field = 'curriculum_file'
    
    def file_uploaded_date(self, obj):
        """Display when file was uploaded"""
        if obj.file_uploaded_at:
            return obj.file_uploaded_at.strftime('%Y-%m-%d %H:%M')
        return '-'
    
    file_uploaded_date.short_description = 'File Uploaded'
    file_uploaded_date.admin_order_field = 'file_uploaded_at'
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly based on conditions"""
        readonly = list(self.readonly_fields)
        if obj and obj.curriculum_file:
            # Show file upload date as readonly if file exists
            if 'file_uploaded_at' not in readonly:
                readonly.append('file_uploaded_at')
        return readonly

    class Media:
        """Add custom CSS/JS if needed"""
        css = {
            'all': ('admin/css/custom_course_admin.css',)  # Optional: custom styling
        }

# Custom admin for better file management
class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    show_change_link = True

class CourseWithModulesAdmin(CourseAdmin):
    """Alternative admin with modules inline - uncomment if you prefer this layout"""
    # inlines = [OverviewInline, HighlightInline, ModuleInline]
    pass

admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)

# Optional: Customize admin site headers
admin.site.site_header = "Course Management Admin"
admin.site.site_title = "Course Admin"
admin.site.index_title = "Welcome to Course Management"