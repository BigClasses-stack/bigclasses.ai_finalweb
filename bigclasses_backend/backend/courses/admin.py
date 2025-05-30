from django.contrib import admin
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
    list_display = ['title', 'slug', 'students_enrolled', 'rating', 'duration']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [OverviewInline, HighlightInline]
admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)
