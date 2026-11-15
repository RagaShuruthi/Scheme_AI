import subprocess
import sys
import os
import signal
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

processes = []

def stream_output(proc, prefix):
    """Stream output from a subprocess with a prefix label."""
    for line in iter(proc.stdout.readline, b""):
        print(f"[{prefix}] {line.decode(errors='replace').rstrip()}")

def start_backend():
    print("[RUN] Starting backend on http://localhost:8000 ...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    processes.append(proc)
    thread = threading.Thread(target=stream_output, args=(proc, "BACKEND"), daemon=True)
    thread.start()
    return proc

def start_frontend():
    print("[RUN] Starting frontend on http://localhost:5173 ...")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
    )
    processes.append(proc)
    thread = threading.Thread(target=stream_output, args=(proc, "FRONTEND"), daemon=True)
    thread.start()
    return proc

def shutdown(signum=None, frame=None):
    print("\n[RUN] Shutting down all servers...")
    for proc in processes:
        try:
            proc.terminate()
        except Exception:
            pass
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    backend_proc = start_backend()
    frontend_proc = start_frontend()

    print("\n[RUN] Both servers are running. Press Ctrl+C to stop.\n")

    # Wait for both to finish (they won't unless killed)
    backend_proc.wait()
    frontend_proc.wait()
