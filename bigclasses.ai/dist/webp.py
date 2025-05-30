import subprocess
import os

def compress_mp4(input_file, output_file, resolution="1280x720", bitrate="1M"):
    """
    Compresses an MP4 file using FFmpeg.
    Args:
        input_file (str): Path to the input MP4 file.
        output_file (str): Path to save the compressed file.
        resolution (str): Target resolution (e.g., '1280x720').
        bitrate (str): Target bitrate (e.g., '1M' for 1 Mbps).
    """
    try:
        # Command to compress video
        command = [
            "ffmpeg",
            "-i", input_file,
            "-vf", f"scale={resolution}",
            "-b:v", bitrate,
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "128k",
            output_file
        ]

        # Run the command
        subprocess.run(command, check=True)
        print(f"Compression successful. File saved to: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error during compression: {e}")
    except FileNotFoundError:
        print("FFmpeg is not installed or not added to PATH.")

# Example usage
input_file = "./images/"
output_file = "./images"
compress_mp4(input_file, output_file)
