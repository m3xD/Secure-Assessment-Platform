# Stage 1: Builder stage with build tools and dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build and essential runtime system dependencies for Debian/Slim
# build-essential includes make, gcc, g++
# cmake, git, wget are needed as before
# libgl1-mesa-glx, libglib2.0-0 etc. are runtime libs needed by OpenCV/TF
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    # Clean up apt cache
    && rm -rf /var/lib/apt/lists/*

# Copy and prepare requirements
COPY requirements.txt .
RUN sed -i 's/#scikit-learn/scikit-learn/' requirements.txt \
    && sed -i 's/#imageio/imageio/' requirements.txt \
    && sed -i 's/#Pillow/Pillow/' requirements.txt \
    && pip install --no-cache-dir -r requirements.txt uvicorn

# Install Python dependencies using wheels (should be faster)
# Upgrade pip first
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt uvicorn

# Download Haar cascade here (will be copied later)
RUN mkdir -p /app/src && \
    wget -P /app/src/ https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml

# Stage 2: Final stage with only runtime dependencies and application code
FROM python:3.12-slim

WORKDIR /app

# Explicitly set PYTHONPATH to include /app
ENV PYTHONPATH=/app:/app/src

# Install only essential runtime system dependencies for Debian/Slim
# These are needed by OpenCV/TensorFlow even in headless mode
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    # Clean up apt cache
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from the builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY ./src ./src

# Ensure permissions
RUN chmod -R 755 /app/src

# Copy the downloaded Haar cascade from the builder stage
COPY --from=builder /app/src/haarcascade_frontalface_default.xml /app/src/haarcascade_frontalface_default.xml

# RUN ls -lh /app/src/align
# In the builder stage
COPY ./Models /app/Models

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application - STANDARD FORM
CMD ["python", "-m", "uvicorn", "src.application:app", "--host", "0.0.0.0", "--port", "8000"]
# vicorn", "src.application:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["python", "-m", "uvicorn", "src.application:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
