#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ---- 0. Detect Java ----
if [ -z "$JAVA_HOME" ]; then
    # Try VS Code bundled JDK
    VSCODE_JDK="/home/gr/.vscode-server/extensions/redhat.java-1.54.0-linux-x64/jre/21.0.10-linux-x86_64"
    if [ -d "$VSCODE_JDK" ]; then
        export JAVA_HOME="$VSCODE_JDK"
        export PATH="$JAVA_HOME/bin:$PATH"
        echo "Auto-detected JDK: $JAVA_HOME"
    fi
fi

if [ -z "$JAVA_HOME" ] || [ ! -f "$JAVA_HOME/bin/java" ]; then
    echo "ERROR: JAVA_HOME not set. Please install JDK 17+ and set JAVA_HOME."
    echo "  sudo apt install -y openjdk-17-jdk"
    echo "  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
    exit 1
fi

echo "=========================================="
echo "  Micro-task Bounty Platform - Build"
echo "=========================================="

# ---- 1. Build Frontend ----
echo ""
echo "[1/3] Building frontend..."
cd "$ROOT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install
fi

echo "  Running vite build..."
npm run build

if [ ! -d "dist" ]; then
    echo "ERROR: Frontend build failed - no dist/ directory"
    exit 1
fi
echo "  Frontend build complete."

# ---- 2. Copy to Backend Static ----
echo ""
echo "[2/3] Copying frontend build to backend static resources..."
STATIC_DIR="$ROOT_DIR/backend/src/main/resources/static"
mkdir -p "$STATIC_DIR"
rm -rf "$STATIC_DIR"/*
cp -r "$ROOT_DIR/frontend/dist/"* "$STATIC_DIR/"
echo "  Copied to $STATIC_DIR"

# ---- 3. Build & Run Backend ----
echo ""
echo "[3/3] Starting backend (Spring Boot)..."
cd "$ROOT_DIR/backend"

if [ -f "./mvnw" ]; then
    ./mvnw spring-boot:run
elif command -v mvn &> /dev/null; then
    mvn spring-boot:run
else
    echo "ERROR: Maven not found."
    exit 1
fi
