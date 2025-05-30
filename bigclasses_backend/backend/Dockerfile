FROM python:3.10-slim

# Set environment variables
# ENV VIRTUAL_ENV=myvenv
# ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# # Create a virtual environment
# RUN python -m venv $VIRTUAL_ENV

# Set working directory
WORKDIR /app

# Install dependencies into the virtual environment
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Run Django commands inside the virtual environment
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
