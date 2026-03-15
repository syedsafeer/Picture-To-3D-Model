from celery import shared_task
from .models import ReconstructionTask
import time


@shared_task
def process_3d_model(task_id):
    try:
        task = ReconstructionTask.objects.get(id=task_id)

        # Yahan apna 3D tool ya API (jaise Luma AI) connect karein
        time.sleep(15)  # Simulating processing time

        task.model_file_url = "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        task.status = 'COMPLETED'
        task.save()
    except Exception as e:
        task.status = 'FAILED'
        task.save()