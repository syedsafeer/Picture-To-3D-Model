from django.db import models
import uuid

class ReconstructionTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, default='PENDING') # PENDING, PROCESSING, COMPLETED, FAILED
    model_file_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CapturedImage(models.Model):
    task = models.ForeignKey(ReconstructionTask, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='captured_images/')